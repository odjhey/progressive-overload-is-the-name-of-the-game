import { IconCalendar, IconFilter, IconPlus } from '@tabler/icons-react'
import { useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { Searchable } from '../components/Searchable'
import { LiftRow } from '../components/LiftRow'
import { matchingExercises, newestFirst } from '../components/dailyFlow'
import { useTraining } from '../hooks/useTraining'
import { usePersistentFilters } from '../hooks/usePersistentFilters'
import { useFeedback } from '../hooks/useFeedback'

export default function Home() {
  const { document, loading, loadError } = useTraining()
  const filters = usePersistentFilters()
  const { feedback, dismissFeedback } = useFeedback()
  const location = useLocation()
  const [params, setParams] = useSearchParams()
  const [filterOpen, setFilterOpen] = useState(false)
  const month = /^\d{4}-(0[1-9]|1[0-2])$/.test(params.get('month') ?? '')
    ? params.get('month')!
    : ''
  if (loading || filters.loading) return <p role="status">Loading training…</p>
  if (loadError)
    return <p role="alert">Training could not be read: {loadError.message}</p>
  if (!document)
    return (
      <p role="alert">
        Import or recover your training in Settings to view the log.
      </p>
    )
  const exercises = new Map(
    document.exercises.map((exercise) => [exercise.id, exercise])
  )
  const ordered = [...document.entries].sort(newestFirst)
  const seen = new Set<string>()
  const latest = ordered
    .filter((entry) => {
      if (
        (month && !entry.trainingDate.startsWith(month)) ||
        seen.has(entry.exerciseId)
      )
        return false
      seen.add(entry.exerciseId)
      return true
    })
    .sort(
      (a, b) =>
        b.trainingDate.localeCompare(a.trainingDate) ||
        exercises
          .get(a.exerciseId)!
          .name.localeCompare(exercises.get(b.exerciseId)!.name)
    )
  const term = filters.data.term.trim().toLocaleLowerCase()
  const visible = latest.filter((entry) => {
    const exercise = exercises.get(entry.exerciseId)!
    return (
      (!filters.data.tags.length ||
        exercise.tags.some((tag) => filters.data.tags.includes(tag))) &&
      (!term ||
        exercise.name.toLocaleLowerCase().includes(term) ||
        document.entries.some(
          (item) =>
            item.exerciseId === exercise.id &&
            item.notes.toLocaleLowerCase().includes(term)
        ))
    )
  })
  const selectedId =
    feedback?.kind === 'saved' ? feedback.entryId : params.get('selected')
  const selected = selectedId
    ? document.entries.find((entry) => entry.id === selectedId)
    : undefined
  const tags = [
    ...new Set([
      ...filters.data.tags,
      ...document.exercises.flatMap((exercise) => exercise.tags),
    ]),
  ].sort((a, b) => a.localeCompare(b))
  const matching = matchingExercises(document.exercises, filters.data.term)
  const create = term && matching.length === 0
  const entryName = create
    ? filters.data.term.trim()
    : matching.length === 1 &&
        !document.entries.some((entry) => entry.exerciseId === matching[0].id)
      ? matching[0].name
      : ''
  const setMonth = (value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set('month', value)
    else next.delete('month')
    setParams(next, { replace: true })
  }
  return (
    <div className="page home-page">
      <header className="top">
        <Searchable
          searchTerm={filters.data.term}
          setSearchTerm={(value) => {
            void filters.saveFilters({ term: value })
          }}
          clear={() => {
            void filters.saveFilters({ term: '' })
          }}
          disabled={!!filters.loadError}
        />
        <button
          type="button"
          className={`ib${filterOpen || filters.data.tags.length || month ? ' on' : ''}`}
          aria-label="Filters"
          aria-expanded={filterOpen}
          onClick={() => setFilterOpen(!filterOpen)}
        >
          <IconFilter size={20} aria-hidden="true" />
        </button>
      </header>
      {(filterOpen || filters.data.tags.length > 0 || month) && (
        <div className="chips" aria-label="Search filters">
          <button
            className={`chip${!filters.data.tags.length && !month ? ' on' : ''}`}
            type="button"
            disabled={!!filters.loadError}
            onClick={() => {
              void filters.saveFilters({ tags: [] })
              setMonth('')
            }}
          >
            All
          </button>
          {tags.map((tag) => (
            <button
              className={`chip${filters.data.tags.includes(tag) ? ' on' : ''}`}
              type="button"
              key={tag}
              aria-pressed={filters.data.tags.includes(tag)}
              disabled={!!filters.loadError}
              onClick={() => {
                void filters.saveFilters({
                  tags: filters.data.tags.includes(tag)
                    ? filters.data.tags.filter((value) => value !== tag)
                    : [...filters.data.tags, tag],
                })
              }}
            >
              {tag}
            </button>
          ))}
          <label className="chip date date-control">
            <IconCalendar size={16} aria-hidden="true" />
            {month
              ? new Date(`${month}-15T12:00:00`).toLocaleDateString('en-GB', {
                  month: 'short',
                  year: 'numeric',
                })
              : 'Month'}
            <input
              type="month"
              aria-label="Filter training month"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
            />
          </label>
          {month && (
            <button type="button" className="chip" onClick={() => setMonth('')}>
              Clear month
            </button>
          )}
        </div>
      )}
      <div className="list" onScroll={dismissFeedback}>
        {filters.loadError && (
          <p className="form-error" role="alert">
            Saved filters could not be read: {filters.loadError.message} Recover
            them in Settings before changing them.
          </p>
        )}
        {filters.error && (
          <p className="form-error" role="alert">
            Filters could not be saved: {filters.error.message}. Your current
            filters remain visible.
          </p>
        )}
        {selected && !visible.some((entry) => entry.id === selected.id) && (
          <section aria-label="Saved entry outside filters">
            <LiftRow
              entry={selected}
              exercise={exercises.get(selected.exerciseId)!}
              highlighted
            />
          </section>
        )}
        {visible.map((entry) => (
          <LiftRow
            key={entry.id}
            entry={entry}
            exercise={exercises.get(entry.exerciseId)!}
            highlighted={entry.id === selectedId}
          />
        ))}
        {entryName && (
          <div className="row create">
            <Link
              className="main"
              to={`/new?${new URLSearchParams({ name: entryName })}`}
              state={{ backgroundLocation: location }}
            >
              <span className="ib y">
                <IconPlus size={20} aria-hidden="true" />
              </span>
              <span className="name">
                {create ? 'Create' : 'Add entry'} “{entryName}”
              </span>
            </Link>
          </div>
        )}
        {!visible.length && !entryName && (
          <p className="form-error">
            {document.exercises.length
              ? 'No matching exercises'
              : 'Search to add your first exercise'}
          </p>
        )}
      </div>
    </div>
  )
}
