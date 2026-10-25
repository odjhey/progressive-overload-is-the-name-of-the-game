import { Link, useNavigate } from 'react-router-dom'
import { useLifts } from '../hooks/useLifts'
import { Searchable } from '../components/Searchable'
import { LiftsForm } from '../components/LiftsForm'
import { LiftFormView } from '../components/LiftFormView'
import { useUrlSearchParams } from '../hooks/useUrlSearchParams'
import { useTags } from '../hooks/useTags'
import { usePersistentFilters } from '../hooks/usePersistentFilters'
import { defaultStringifySearch } from '../libs/searchParams'

export default function Home() {
  const { data, loadError, loading, unique } = useLifts()
  const tags = useTags()
  const filters = usePersistentFilters()
  const [selected] = useUrlSearchParams()
  const navigate = useNavigate()
  const latestOnly = selected.view !== 'history'
  const setLatestOnly = (latest: boolean) =>
    navigate(
      {
        search: defaultStringifySearch({
          ...selected,
          view: latest ? 'latest' : 'history',
        }),
      },
      { replace: true }
    )

  if (loading || tags.loading || filters.loading) {
    return <div role="status">Loading workouts and filters...</div>
  }
  if (loadError) {
    return (
      <div role="alert">Workouts could not be loaded: {loadError.message}</div>
    )
  }

  const visible = data
    .filter((row) => {
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
    .sort(
      (a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime() ||
        a.name.localeCompare(b.name)
    )
  const saved = data.find(
    (lift) =>
      lift.date === selected.selected && lift.name === selected.selectedName
  )
  const savedHidden = saved && !visible.includes(saved)
  const setTerm = (term: string) => filters.saveFilters({ term })

  const hasFilters = filters.data.term !== '' || filters.data.tags.length > 0
  const clearFilters = () => filters.saveFilters({ term: '', tags: [] })

  return (
    <div className="workout-collection">
      <header className="page-heading">
        <h1>Workouts</h1>
      </header>
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
          Filters could not be saved: {filters.error.message} Your current
          filters are still shown; change or clear them to retry.
        </p>
      )}
      <fieldset disabled={!!filters.loadError} className="collection-tools">
        <legend className="sr-only">Filter workouts</legend>
        <Searchable
          clear={() => setTerm('')}
          searchTerm={filters.data.term}
          setSearchTerm={setTerm}
        />
        <div className="collection-options">
          <div className="view-switch" role="group" aria-label="Workout view">
            <button
              type="button"
              aria-pressed={latestOnly}
              onClick={() => setLatestOnly(true)}
            >
              Latest
            </button>
            <button
              type="button"
              aria-pressed={!latestOnly}
              onClick={() => setLatestOnly(false)}
            >
              History
            </button>
          </div>
          <details className="advanced-filters">
            <summary>Date &amp; tags</summary>
            <div className="filter-fields">
              <div className="date-filter">
                <label className="field-label" htmlFor="workout-date">
                  <span>Search date</span>
                  <input
                    id="workout-date"
                    className="input input-bordered"
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
                  className="btn btn-outline"
                  onClick={() => setTerm(new Date().toISOString().slice(0, 10))}
                >
                  Today
                </button>
              </div>
              <p className="field-hint">
                Choosing a date replaces the search text.
              </p>
              <Searchable
                clear={() => filters.saveFilters({ tags: [] })}
                placeholder="Tag filter"
                searchTerm={filters.data.tags[0] ?? ''}
                setSearchTerm={(value) =>
                  filters.saveFilters({ tags: value ? [value] : [] })
                }
              />
              <div className="tag-shortcuts" aria-label="Common tag filters">
                {['push', 'pull', 'leg'].map((tag) => (
                  <button
                    type="button"
                    className="btn btn-outline"
                    key={tag}
                    aria-label={`Filter by ${tag} tag`}
                    onClick={() => filters.saveFilters({ tags: [tag] })}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </details>
        </div>
      </fieldset>
      <div className="collection-summary">
        <p className="muted" role="status">
          <strong>{visible.length}</strong> of {data.length} workouts
          {latestOnly ? ' · Most recent per lift' : ' · All sessions'}
        </p>
        {hasFilters && (
          <button
            type="button"
            className="text-action"
            disabled={!!filters.loadError}
            onClick={clearFilters}
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
      {saved && (
        <section className="saved-notice" aria-label="Saved workout">
          <p role="status">
            <strong>Saved {saved.name}.</strong>
          </p>
          {savedHidden && (
            <>
              <p>
                This saved workout is outside the current filters or latest
                view.
              </p>
              <LiftFormView lift={saved} />
              <button
                type="button"
                className="btn btn-outline"
                disabled={!!filters.loadError}
                onClick={() => {
                  clearFilters()
                  setLatestOnly(false)
                }}
              >
                Show saved workout in history
              </button>
            </>
          )}
        </section>
      )}
      {visible.length === 0 && (
        <section className="empty-state">
          <h2>
            {data.length === 0 ? 'No workouts yet' : 'No matching workouts'}
          </h2>
          <p className="muted">
            {data.length === 0
              ? 'Record a workout to get started.'
              : 'Try another search, clear your filters, or switch to History to find an older effort.'}
          </p>
          {data.length === 0 ? (
            <Link className="btn btn-primary" to="/new">
              Record a workout
            </Link>
          ) : (
            <button
              type="button"
              className="btn btn-outline"
              disabled={!!filters.loadError}
              onClick={() => {
                clearFilters()
                setLatestOnly(false)
              }}
            >
              Show all history
            </button>
          )}
        </section>
      )}
      <LiftsForm
        actions={{ onDateClick: setTerm }}
        selectedKey={saved ? `${saved.name}\0${saved.date}` : ''}
        lifts={visible}
        tags={tags.data}
      />
    </div>
  )
}
