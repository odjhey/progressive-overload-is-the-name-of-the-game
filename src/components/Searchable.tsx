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
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1" htmlFor={id}>
          <span className="text-sm">{placeholder}</span>
          <input
            id={id}
            type="search"
            placeholder={placeholder}
            value={searchTerm}
            className="input input-sm input-bordered w-40"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </label>
        <button
          type="button"
          className="btn btn-sm"
          aria-label={`Clear ${placeholder.toLowerCase()}`}
          onClick={clear}
        >
          <IconX size={16} aria-hidden="true" />
        </button>
      </div>
      {children}
    </>
  )
}
