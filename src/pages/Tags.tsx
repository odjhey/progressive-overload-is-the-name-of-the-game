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

  return (
    <>
      <h1 className="text-lg font-bold">Tags</h1>
      <p>Tags apply to all workouts with the exact lift name shown.</p>
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
      <div className="p-2">
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
          <fieldset
            disabled={!!loadError || busy}
            className="flex gap-2 flex-wrap items-end p-2 border-solid border-primary border"
          >
            <legend className="sr-only">Add a tag</legend>
            <label className="flex flex-col gap-1" htmlFor="tag-name">
              <span>Tag name</span>
              <input
                id="tag-name"
                className="input input-bordered w-full"
                {...register('name', { required: true })}
                required
                aria-invalid={!!errors.name}
              />
            </label>
            <label className="flex flex-col gap-1" htmlFor="tag-lift-name">
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
            <button type="submit" className="btn btn-sm">
              {busy ? 'Saving...' : 'Add tag'}
            </button>
          </fieldset>
        </form>
      </div>
      <div className="space-y-2">
        {lifts.unique.length === 0 && !loadError && (
          <p>No saved workouts yet. Save a workout before assigning its tags.</p>
        )}
        {lifts.unique.map((lift) => (
          <div className="flex flex-wrap gap-1 items-center" key={lift.name}>
            <span>{lift.name}</span>
            {tags.data
              .filter((tag) => tag.liftName === lift.name)
              .map((tag) => (
                <span className="badge" key={tag.name}>
                  {tag.name}
                  <button
                    type="button"
                    className="btn btn-xs"
                    aria-label={`Remove ${tag.name} tag from ${lift.name}`}
                    disabled={!!loadError || busy}
                    onClick={() => {
                      if (confirm(`Remove "${tag.name}" from "${lift.name}"?`)) {
                        setStatus('')
                        void tags.deleteTag(tag, {
                          onSuccess: () =>
                            setStatus(`Removed ${tag.name} from ${lift.name}.`),
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
              className="btn btn-sm"
              disabled={!!loadError || busy}
              aria-label={`Add tag to ${lift.name}`}
              onClick={() => {
                setValue('liftName', lift.name, { shouldDirty: true })
                setFocus('name')
              }}
            >
              Add tag
            </button>
          </div>
        ))}
      </div>
    </>
  )
}
