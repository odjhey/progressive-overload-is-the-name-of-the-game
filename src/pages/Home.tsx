import { useState } from 'react'
import { useLifts } from '../hooks/useLifts'
import { Searchable } from '../components/Searchable'
import { LiftsForm } from '../components/LiftsForm'
import { LiftFormView } from '../components/LiftFormView'
import { useUrlSearchParams } from '../hooks/useUrlSearchParams'
import { useTags } from '../hooks/useTags'
import { usePersistentFilters } from '../hooks/usePersistentFilters'

export default function Home() {
  const { data, loadError, loading, unique } = useLifts()
  const tags = useTags()
  const filters = usePersistentFilters()
  const [selected] = useUrlSearchParams()
  const [latestOnly, setLatestOnly] = useState(true)

  if (loading || tags.loading || filters.loading) {
    return <div role="status">Loading workouts and filters...</div>
  }
  if (loadError) {
    return <div role="alert">Workouts could not be loaded: {loadError.message}</div>
  }

  const visible = data.filter((row) => {
    if (
      latestOnly &&
      !unique.some((lift) => lift.name === row.name && lift.date === row.date)
    ) {
      return false
    }
    const tagTerm = filters.data.tags[0] ?? ''
    if (
      tagTerm !== '' &&
      !tags.data.some(
        (tag) =>
          tag.liftName === row.name &&
          tag.name.toLowerCase().includes(tagTerm.toLowerCase())
      )
    ) {
      return false
    }
    return (
      filters.data.term === '' ||
      JSON.stringify(Object.values(row))
        .toLowerCase()
        .includes(filters.data.term.toLowerCase())
    )
  })
  const saved = data.find(
    (lift) =>
      lift.date === selected.selected && lift.name === selected.selectedName
  )
  const savedHidden = saved && !visible.includes(saved)
  const setTerm = (term: string) => filters.saveFilters({ term })

  return (
    <>
      <h1 className="text-lg font-bold">Workouts</h1>
      {tags.loadError && (
        <p role="alert">Tags could not be loaded: {tags.loadError.message}</p>
      )}
      {filters.loadError && (
        <p role="alert">
          Saved filters could not be loaded: {filters.loadError.message} Restore
          them in Settings before changing saved filters.
        </p>
      )}
      {filters.error && (
        <p role="alert">
          Filters could not be saved: {filters.error.message} Your current filters
          are still shown; change or clear them to retry.
        </p>
      )}
      <fieldset disabled={!!filters.loadError} className="flex flex-col gap-2">
        <legend className="sr-only">Filter workouts</legend>
        <div className="flex flex-row flex-wrap items-end gap-2">
          <Searchable
            clear={() => setTerm('')}
            searchTerm={filters.data.term}
            setSearchTerm={setTerm}
          />
          <label className="flex flex-col gap-1" htmlFor="workout-date">
            <span className="text-sm">Search date</span>
            <input
              id="workout-date"
              className="input input-sm input-bordered"
              type="date"
              value={
                /^\d{4}-\d{2}-\d{2}$/.test(filters.data.term)
                  ? filters.data.term
                  : ''
              }
              onChange={(e) => setTerm(e.target.value)}
            />
          </label>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => setTerm(new Date().toISOString().slice(0, 10))}
          >
            Today
          </button>
        </div>
        <div className="flex gap-1 items-end flex-wrap">
          <Searchable
            clear={() => filters.saveFilters({ tags: [] })}
            placeholder="Tag filter"
            searchTerm={filters.data.tags[0] ?? ''}
            setSearchTerm={(value) =>
              filters.saveFilters({ tags: value ? [value] : [] })
            }
          />
          {['push', 'pull', 'leg'].map((tag) => (
            <button
              type="button"
              className="btn btn-sm"
              key={tag}
              aria-label={`Filter by ${tag} tag`}
              onClick={() => filters.saveFilters({ tags: [tag] })}
            >
              {tag}
            </button>
          ))}
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => filters.saveFilters({ term: '', tags: [] })}
          >
            Clear all filters
          </button>
        </div>
      </fieldset>
      <label className="flex gap-2 items-center my-2" htmlFor="latest-only">
        <input
          id="latest-only"
          type="checkbox"
          checked={latestOnly}
          onChange={(e) => setLatestOnly(e.target.checked)}
        />
        Latest only (most recent session per lift)
      </label>
      <p className="text-sm" role="status">
        {visible.length} of {data.length} workouts shown.{' '}
        {latestOnly ? 'Uncheck Latest only to see history.' : 'Showing history.'}
      </p>
      {saved && (
        <div className="my-2">
          <p role="status">Saved {saved.name}.</p>
          {savedHidden && (
            <>
              <p>
                This saved workout is outside the current filters or latest view.
              </p>
              <LiftFormView lift={saved} />
              <button
                type="button"
                className="btn btn-sm"
                disabled={!!filters.loadError}
                onClick={() => {
                  filters.saveFilters({ term: '', tags: [] })
                  setLatestOnly(false)
                }}
              >
                Show saved workout in history
              </button>
            </>
          )}
        </div>
      )}
      <div className="bg-secondary w-full h-1 my-2"></div>
      {visible.length === 0 && (
        <p>
          {data.length === 0
            ? 'No workouts yet. Choose New to record your first workout.'
            : 'No workouts match. Clear filters or uncheck Latest only to see more history.'}
        </p>
      )}
      <LiftsForm
        actions={{ onDateClick: setTerm }}
        selectedKey={saved ? `${saved.name}\0${saved.date}` : ''}
        lifts={visible}
        tags={tags.data}
      />
    </>
  )
}
