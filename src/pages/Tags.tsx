import { useForm } from 'react-hook-form'
import { useLifts } from '../hooks/useLifts'
import { useTags } from '../hooks/useTags'
import { useState } from 'react'
import { useUrlSearchParams } from '../hooks/useUrlSearchParams'

type NewTag = {
  name: string
  liftName: string
}

export default function Tags() {
  const [liftInSearch] = useUrlSearchParams()
  const liftName =
    typeof liftInSearch.liftName === 'string' ? liftInSearch.liftName : ''
  const lifts = useLifts()
  const tags = useTags()
  const [status, setStatus] = useState('')
  const {
    register,
    handleSubmit,
    setValue,
    setFocus,
    formState: { isSubmitting, errors },
  } = useForm<NewTag>({ defaultValues: { name: '', liftName } })

  if (lifts.loading || tags.loading) {
    return <div role="status">Loading workouts and tags...</div>
  }
  const loadError = lifts.loadError ?? tags.loadError
  const busy = tags.saving || isSubmitting
  const names = [
    ...new Set([
      ...lifts.unique.map((lift) => lift.name),
      ...tags.data.map((tag) => tag.liftName),
    ]),
  ]

  return (
    <div className="tags-page">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Organize your lifts</p>
          <h1>Tags</h1>
          <p className="muted">
            Tags apply to all workouts with the exact lift name shown.
          </p>
        </div>
      </header>
      {loadError && (
        <p role="alert">
          Workouts or tags could not be loaded: {loadError.message} Tag changes
          are unavailable until saved data can be read.
        </p>
      )}
      {tags.error && (
        <p role="alert">
          Tag change failed: {tags.error.message} Your entered values are still
          here. Correct the problem and try again.
        </p>
      )}
      <p role="status">{status}</p>
      <div>
        <form
          aria-busy={busy}
          onSubmit={handleSubmit((values) => {
            setStatus('')
            return tags.appendTag(values, {
              onSuccess: (saved) => {
                setStatus(`Added ${saved.name} to ${saved.liftName}.`)
                setValue('name', '')
                window.scrollTo({ top: 0 })
              },
            })
          })}
        >
          <fieldset disabled={!!loadError || busy} className="tag-create">
            <legend className="sr-only">Add a tag</legend>
            <label className="field-label" htmlFor="tag-name">
              <span>Tag name</span>
              <input
                id="tag-name"
                className="input input-bordered w-full"
                {...register('name', { required: true })}
                required
                aria-invalid={!!errors.name}
              />
            </label>
            <label className="field-label" htmlFor="tag-lift-name">
              <span>Lift name</span>
              <input
                id="tag-lift-name"
                className="input input-bordered w-full"
                {...register('liftName', { required: true })}
                required
                aria-invalid={!!errors.liftName}
                list="tag-lift-options"
              />
            </label>
            <datalist id="tag-lift-options">
              {lifts.unique.map((lift) => (
                <option key={lift.name} value={lift.name} />
              ))}
            </datalist>
            <button type="submit" className="btn btn-primary">
              {busy ? 'Saving...' : 'Add tag'}
            </button>
          </fieldset>
        </form>
      </div>
      <div className="tag-groups">
        {names.length === 0 && !loadError && (
          <p>
            No saved workouts yet. Save a workout before assigning its tags.
          </p>
        )}
        {names.map((name) => (
          <section className="tag-group" key={name}>
            <h2>{name}</h2>
            {!lifts.unique.some((lift) => lift.name === name) && (
              <span className="text-sm">(no saved workouts)</span>
            )}
            {tags.data
              .filter((tag) => tag.liftName === name)
              .map((tag) => (
                <span className="tag-assignment" key={tag.name}>
                  {tag.name}
                  <button
                    type="button"
                    className="btn btn-ghost"
                    aria-label={`Remove ${tag.name} tag from ${name}`}
                    disabled={!!loadError || busy}
                    onClick={() => {
                      if (confirm(`Remove "${tag.name}" from "${name}"?`)) {
                        setStatus('')
                        void tags.deleteTag(tag, {
                          onSuccess: () =>
                            setStatus(`Removed ${tag.name} from ${name}.`),
                        })
                      }
                    }}
                  >
                    Remove
                  </button>
                </span>
              ))}
            <button
              type="button"
              className="btn btn-outline"
              disabled={!!loadError || busy}
              aria-label={`Add tag to ${name}`}
              onClick={() => {
                setValue('liftName', name, { shouldDirty: true })
                setFocus('name')
              }}
            >
              Add tag
            </button>
          </section>
        ))}
      </div>
    </div>
  )
}
