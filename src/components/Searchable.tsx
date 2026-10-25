import { PropsWithChildren, useId } from 'react'
import { IconX } from '@tabler/icons-react'

export const Searchable = ({
  searchTerm,
  children,
  setSearchTerm,
  placeholder = 'Search workouts',
  clear,
}: PropsWithChildren<{
  searchTerm: string
  setSearchTerm: (searchTerm: string) => void
  clear: () => void
  placeholder?: string
}>) => {
  const id = useId()
  return (
    <>
      <div className="search-control">
        <label className="field-label" htmlFor={id}>
          <span>{placeholder}</span>
          <input
            id={id}
            type="search"
            placeholder={placeholder === 'Search workouts' ? 'Lift name, notes, date…' : placeholder}
            className="input input-bordered"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </label>
        <button
          type="button"
          className="btn btn-outline search-clear"
          aria-label={`Clear ${placeholder.toLowerCase()}`}
          onClick={clear}
          disabled={!searchTerm}
        >
          <IconX size={16} aria-hidden="true" />
        </button>
      </div>
      {children}
    </>
  )
}
