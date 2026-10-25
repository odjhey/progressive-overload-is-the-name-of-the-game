import { Link, useSearchParams } from 'react-router-dom'
import { Searchable } from '../components/Searchable'
import { LiftRow } from '../components/LiftRow'
import { useTraining } from '../hooks/useTraining'
import { usePersistentFilters } from '../hooks/usePersistentFilters'
import { localDate } from '../libs/trainingModel'

function knownTime(value: string | null | undefined): number {
  const time = Date.parse(value ?? '')
  return Number.isFinite(time) ? time : -Infinity
}

export default function Home() {
  const { document, loading, loadError } = useTraining()
  const filters = usePersistentFilters()
  const [params, setParams] = useSearchParams()
  const view = params.get('view') === 'history' ? 'history' : 'latest'
  const setView = (next: 'latest' | 'history') => {
    const search = new URLSearchParams({ view: next })
    const selected = params.get('selected')
    if (selected) search.set('selected', selected)
    setParams(search, { replace: true })
  }
  if (loading || filters.loading)
    return <p role="status">Loading workouts and filters…</p>
  if (loadError)
    return <p role="alert">Training could not be read: {loadError.message}</p>
  if (!document)
    return (
      <p role="alert">
        Import or recover your training in Settings to view workouts.
      </p>
    )
  const exercises = new Map(
    document.exercises.map((exercise) => [exercise.id, exercise])
  )
  const ordered = [...document.entries].sort(
    (a, b) =>
      b.trainingDate.localeCompare(a.trainingDate) ||
      knownTime(b.recordedAt ?? b.performedAt) -
        knownTime(a.recordedAt ?? a.performedAt) ||
      a.id.localeCompare(b.id)
  )
  const latest = new Set<string>()
  const term = filters.data.term.toLocaleLowerCase()
  const visible = ordered.filter((entry) => {
    const exercise = exercises.get(entry.exerciseId)
    if (!exercise) return false
    const isLatest = !latest.has(entry.exerciseId)
    latest.add(entry.exerciseId)
    if (view === 'latest' && !isLatest) return false
    if (
      !filters.data.tags.every((tag) =>
        exercise.tags.some((value) =>
          value.toLocaleLowerCase().includes(tag.toLocaleLowerCase())
        )
      )
    )
      return false
    const searchable = [
      exercise.name,
      entry.trainingDate,
      entry.notes,
      ...exercise.tags,
      ...entry.groups.flatMap((group) => [
        group.unit,
        String(group.weight),
        String(group.sets),
        String(group.reps),
      ]),
    ]
      .join(' ')
      .toLocaleLowerCase()
    return searchable.includes(term)
  })
  const selected = document.entries.find(
    (entry) => entry.id === params.get('selected')
  )
  const selectedExercise = selected
    ? exercises.get(selected.exerciseId)
    : undefined
  const hasFilters = !!filters.data.term || filters.data.tags.length > 0
  const clear = () => {
    void filters.saveFilters({ term: '', tags: [] })
  }
  const setTerm = (value: string) => {
    void filters.saveFilters({ term: value })
  }
  const tags = [
    ...new Set(document.exercises.flatMap((exercise) => exercise.tags)),
  ].sort((a, b) => a.localeCompare(b))
  return (
    <div className="workout-collection training-page">
      <header className="page-heading">
        <h1>Workouts</h1>
        <div className="training-actions">
          <Link
            className="btn btn-primary"
            to={`/new?${new URLSearchParams({ view })}`}
          >
            + New entry
          </Link>
          <Link className="back-link" to="/calendar">
            Calendar
          </Link>
          <Link className="back-link" to="/tags">
            Exercises &amp; tags
          </Link>
        </div>
      </header>
      {filters.loadError && (
        <p role="alert">
          Saved filters could not be read: {filters.loadError.message} Recover
          them in Settings before changing them.
        </p>
      )}
      {filters.error && (
        <p role="alert">
          Filters could not be saved: {filters.error.message} Your current
          filters are shown; change or clear them to retry.
        </p>
      )}
      <div className="view-switch" role="group" aria-label="Workout view">
        <button
          type="button"
          aria-pressed={view === 'latest'}
          onClick={() => setView('latest')}
        >
          Latest
        </button>
        <button
          type="button"
          aria-pressed={view === 'history'}
          onClick={() => setView('history')}
        >
          History
        </button>
      </div>
      <fieldset disabled={!!filters.loadError} className="collection-tools">
        <legend className="sr-only">Filter entries</legend>
        <Searchable
          searchTerm={filters.data.term}
          setSearchTerm={setTerm}
          clear={() => setTerm('')}
        />
        <details className="advanced-filters">
          <summary>Date &amp; tags</summary>
          <div className="filter-fields">
            <div className="date-filter">
              <label className="field-label" htmlFor="search-date">
                <span>Search date</span>
                <input
                  id="search-date"
                  className="input input-bordered"
                  type="date"
                  value={
                    /^\d{4}-\d{2}-\d{2}$/.test(filters.data.term)
                      ? filters.data.term
                      : ''
                  }
                  onChange={(event) => setTerm(event.target.value)}
                />
              </label>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setTerm(localDate())}
              >
                Today
              </button>
            </div>
            <p className="field-hint">
              Choosing a date replaces the search text.
            </p>
            <Searchable
              placeholder="Tag filter"
              searchTerm={filters.data.tags[0] ?? ''}
              setSearchTerm={(value) => {
                void filters.saveFilters({ tags: value ? [value] : [] })
              }}
              clear={() => {
                void filters.saveFilters({ tags: [] })
              }}
            />
            <div className="tag-shortcuts">
              {tags.map((tag) => (
                <button
                  className="btn btn-outline"
                  type="button"
                  key={tag}
                  onClick={() => {
                    void filters.saveFilters({ tags: [tag] })
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </details>
      </fieldset>
      <div className="collection-summary">
        <p role="status">
          {visible.length} of {document.entries.length} entries ·{' '}
          {view === 'latest'
            ? 'Most recent per exercise'
            : 'All saved training'}
        </p>
        {hasFilters && (
          <button
            className="text-action"
            type="button"
            disabled={!!filters.loadError}
            onClick={clear}
          >
            Clear all filters
          </button>
        )}
      </div>
      {hasFilters && (
        <div className="active-filters" aria-label="Active filters">
          {filters.data.term && (
            <span className="filter-chip">Search: {filters.data.term}</span>
          )}
          {filters.data.tags.map((tag) => (
            <span className="filter-chip" key={tag}>
              Tag: {tag}
            </span>
          ))}
        </div>
      )}
      {selected && selectedExercise && (
        <section className="saved-notice" aria-label="Selected saved entry">
          <p role="status">
            <strong>
              Saved entry: {selectedExercise.name} · {selected.trainingDate}
            </strong>
          </p>
          {!visible.includes(selected) && (
            <>
              <p>This entry is outside the current filters or Latest view.</p>
              <LiftRow
                entry={selected}
                exercise={selectedExercise}
                view={view}
              />
              <button
                type="button"
                className="btn btn-outline"
                disabled={!!filters.loadError}
                onClick={() => {
                  clear()
                  setView('history')
                }}
              >
                Show in history
              </button>
            </>
          )}
        </section>
      )}
      {params.has('selected') && !selected && (
        <p role="alert">The selected entry is no longer in saved history.</p>
      )}
      {visible.length === 0 && (
        <section className="empty-state">
          <h2>
            {document.entries.length === 0
              ? 'No saved entries yet'
              : 'No matching entries'}
          </h2>
          <p>
            {document.entries.length === 0
              ? 'Record actual training, or use Calendar to backfill a day.'
              : 'Clear filters or switch to History to find an older effort.'}
          </p>
          {document.entries.length > 0 && (
            <button
              type="button"
              className="btn btn-outline"
              disabled={!!filters.loadError}
              onClick={() => {
                clear()
                setView('history')
              }}
            >
              Show all history
            </button>
          )}
        </section>
      )}
      <div className="lift-list">
        {visible.map((entry) => {
          const exercise = exercises.get(entry.exerciseId)!
          return (
            <section
              className={`lift-entry${entry.id === selected?.id ? ' is-saved' : ''}`}
              key={entry.id}
            >
              <LiftRow entry={entry} exercise={exercise} view={view} />
            </section>
          )
        })}
      </div>
    </div>
  )
}
