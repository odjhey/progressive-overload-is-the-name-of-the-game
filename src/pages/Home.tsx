import { PropsWithChildren, useState } from 'react'
import { useLifts } from '../hooks/useLifts'
import { useDebouncedCallback } from 'use-debounce'
import { Searchable } from '../components/Searchable'
import { LiftsForm } from '../components/LiftsForm'
import { useUrlSearchParams } from '../hooks/useUrlSearchParams'
import { useTags } from '../hooks/useTags'

const DateSearch = (
  props: PropsWithChildren<{
    setDate: (date: string) => void
  }>
) => {
  const { setDate, children } = props
  return (
    <>
      <div className="space-x-2">
        <input
          className="input input-sm input-bordered"
          type="date"
          onChange={(e) => {
            setDate(e.target.value)
          }}
        ></input>
        <button
          type="button"
          className="btn btn-xs"
          onClick={() => {
            setDate(new Date().toISOString().slice(0, 10))
          }}
        >
          today
        </button>
      </div>
      {children}
    </>
  )
}

export default function Home() {
  const { data, error, loading, unique } = useLifts()
  const { data: tags } = useTags()
  const [searchTerm, setSearchTerm] = useState('')
  const [tagSearch, setTagSearch] = useState('')
  const setSearchTermDeb = useDebouncedCallback((value) => {
    setSearchTerm(value)
  }, 500)
  const [selected] = useUrlSearchParams()
  const [latestOnly, setLatestOnly] = useState(false)

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>{error.message}</div>
  }

  return (
    <>
      <div className="flex flex-col">
        <DateSearch setDate={setSearchTerm}></DateSearch>
        <Searchable
          searchTerm={searchTerm}
          setSearchTerm={setSearchTermDeb}
        ></Searchable>
        <div className="flex gap-1 items-center">
          <Searchable
            placeholder="tag search"
            searchTerm={tagSearch}
            setSearchTerm={setTagSearch}
          ></Searchable>
          {['push', 'pull'].map((d) => (
            <button
              className="btn btn-xs"
              key={d}
              onClick={() => setTagSearch(d)}
            >
              {d}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          <input
            id="latest-only"
            type="checkbox"
            onChange={(e) => setLatestOnly(e.target.checked)}
          ></input>
          <label htmlFor="latest-only">latest</label>
        </div>
      </div>
      <div className="bg-secondary w-full h-1 my-2"></div>
      <LiftsForm
        selectedKey={(selected as any).selected ?? ''}
        lifts={data}
        tags={tags}
        filterFn={(row: any) => {
          const filterResults = []

          // if (row.name === "") { return true } < --- lets accept the misfeature of unable to add after search

          if (latestOnly) {
            const match = unique.find(
              (d) => d.name === row.name && d.date === row.date
            )
            filterResults.push(!!match)
          }

          if (tagSearch !== '') {
            const match = tags.find(
              (t) =>
                t.liftName === row.name &&
                t.name.toLowerCase().includes(tagSearch.toLowerCase())
            )
            filterResults.push(!!match)
          }

          if (searchTerm === '') {
            // none
          } else {
            filterResults.push(
              JSON.stringify(Object.values(row))
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
            )
          }

          return (
            filterResults.length === 0 || filterResults.every((v) => v === true)
          )
        }}
      ></LiftsForm>
    </>
  )
}
