import { useState } from 'react'
import { Lift, useLifts } from '../hooks/useLifts'
import { LiftFormView } from '../components/LiftFormView'
import { useTags } from '../hooks/useTags'
import { Searchable } from '../components/Searchable'
import { usePersistentFilters } from '../hooks/usePersistentFilters'

export default function Latest() {
  const { unique, data } = useLifts()
  const [openList, setOpenList] = useState<string[]>([])
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
      <div className="flex flex-col items-start gap-1">
        <Searchable
          placeholder="tag search"
          searchTerm={filters ? filters.tags[0] : ''}
          setSearchTerm={(term: string) => {
            saveFilters({ tags: [term] })
          }}
        ></Searchable>
        <div className="flex flex-wrap gap-1">
          {uniqueTags.map((d) => (
            <button
              className="btn btn-xs"
              key={d}
              onClick={() => saveFilters({ tags: [d] })}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
      <div className="h-2 w-full my-2 bg-accent-content"></div>
      {unique.map((lift) => {
        return (
          <div
            key={lift.date + lift.name}
            className={`flex flex-col items-start gap-2 ${
              filterFn(lift) ? '' : 'hidden'
            } `}
          >
            <div className="flex items-center gap-1">
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => {
                  setOpenList((prev) => {
                    const match = prev.find((v) => v === lift.name)
                    if (match) {
                      return prev.filter((p) => p !== match)
                    }
                    return [...prev, lift.name]
                  })
                }}
                key={lift.name}
              >
                {lift.name}
              </button>
              <div className="flex gap-1 items-center">
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
            <div
              className={`container border border-solid border-red-300 ${
                openList.find((o) => lift.name === o) ? '' : 'hidden'
              }`}
            >
              {data
                .filter((d) => d.name === lift.name)
                .map((d) => {
                  return <LiftFormView lift={d}></LiftFormView>
                })}
            </div>
          </div>
        )
      })}
    </>
  )
}
