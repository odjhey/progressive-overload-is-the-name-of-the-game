import { IconSearch, IconX } from '@tabler/icons-react'

export function Searchable({
  searchTerm,
  setSearchTerm,
  clear,
  disabled = false,
}: {
  searchTerm: string
  setSearchTerm: (value: string) => void
  clear: () => void
  disabled?: boolean
}) {
  return (
    <div className="search">
      <IconSearch size={20} aria-hidden="true" />
      <input
        type="search"
        aria-label="Search or add exercise"
        placeholder="Search or add exercise"
        value={searchTerm}
        disabled={disabled}
        onChange={(event) => setSearchTerm(event.target.value)}
      />
      {searchTerm && (
        <button
          className="clr"
          type="button"
          aria-label="Clear search"
          disabled={disabled}
          onClick={clear}
        >
          <IconX size={18} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
