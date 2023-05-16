import { useState } from 'react'
import { Lift, useLifts } from '../hooks/useLifts'
import { LiftFormView } from '../components/LiftFormView'
import { useTags } from '../hooks/useTags'
import { Searchable } from '../components/Searchable'

export default function Latest() {
  const { unique, data } = useLifts()
  const [openList, setOpenList] = useState<string[]>([])
  const { data: tags, unique: uniqueTags } = useTags()
  const [tagSearch, setTagSearch] = useState('')

  const filterFn = (row: Lift) => {
    const filterResults = []

    if (tagSearch !== '') {
      const match = tags.find(
        (t) =>
          t.liftName === row.name &&
          t.name.toLowerCase().includes(tagSearch.toLowerCase())
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
          searchTerm={tagSearch}
          setSearchTerm={setTagSearch}
        ></Searchable>
        <div className="flex flex-wrap gap-1">
          {uniqueTags.map((d) => (
            <button
              className="btn btn-xs"
              key={d}
              onClick={() => setTagSearch(d)}
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
            className={`flex flex-col items-start gap-2 ${
              filterFn(lift) ? '' : 'hidden'
            } `}
          >
            <div>
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
              {tags
                .filter((d) => d.liftName === lift.name)
                .map((t) => {
                  return <span className="badge">{t.name}</span>
                })}
            </div>
            <div
              className={`flex flex-wrap border border-solid border-red-300 ${
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
