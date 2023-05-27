import { Lift, useLifts } from '../hooks/useLifts'
import { LiftFormView } from '../components/LiftFormView'
import { useTags } from '../hooks/useTags'
import { Searchable } from '../components/Searchable'
import { usePersistentFilters } from '../hooks/usePersistentFilters'

export default function Latest() {
  const { unique, data } = useLifts()
  const { data: tags, unique: uniqueTags } = useTags()
  const { data: filters, saveFilters } = usePersistentFilters()

  const filterFn = (row: Lift) => {
    const filterResults = []

    if (filters && filters.tags.length > 0) {
      const match = tags.find(
        (t) =>
          t.liftName === row.name &&
          // TODO: fix hard coded index
          t.name.toLowerCase().includes(filters.tags[0].toLowerCase())
      )
      filterResults.push(!!match)
    }

    return filterResults.length === 0 || filterResults.every((v) => v === true)
  }

  return (
    <>
      <div>
        <Searchable
          clear={() => {
            saveFilters({ ...filters, tags: [] })
          }}
          placeholder="tag search"
          searchTerm={filters.tags[0]}
          setSearchTerm={(term: string) => {
            saveFilters({ tags: [term], term: '' })
          }}
        ></Searchable>
        <div className="flex flex-wrap gap-1">
          {uniqueTags.map((d) => (
            <button
              className="btn btn-xs"
              key={d}
              onClick={() => saveFilters({ tags: [d], term: '' })}
            >
              {d}
            </button>
          ))}
        </div>
        {unique.map((lift) => {
          return (
            <div
              key={lift.date + lift.name}
              className={`space-y-1 ${filterFn(lift) ? '' : 'hidden'} `}
            >
              <div className="collapse collapse-arrow">
                <input type="checkbox" />
                <div className="collapse-title">
                  {lift.name}
                  <div className="space-x-1">
                    {tags
                      .filter((d) => d.liftName === lift.name)
                      .map((t) => {
                        return (
                          <span key={t.name} className="badge">
                            {t.name}
                          </span>
                        )
                      })}
                  </div>
                </div>
                <div className="collapse-content">
                  {data
                    .filter((d) => d.name === lift.name)
                    .map((d) => {
                      return (
                        <LiftFormView
                          key={d.date + d.name}
                          lift={d}
                        ></LiftFormView>
                      )
                    })}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
