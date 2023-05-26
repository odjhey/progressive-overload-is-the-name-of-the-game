import { PropsWithChildren } from 'react'
import { IconX } from '@tabler/icons-react'

export const Searchable = ({
  searchTerm,
  children,
  setSearchTerm,
  placeholder,
  clear,
}: PropsWithChildren<{
  searchTerm: string
  setSearchTerm: (searchTerm: string) => void
  clear: () => void
  placeholder?: string
}>) => {
  return (
    <>
      <div className="space-x-2 flex items-center">
        <input
          placeholder={placeholder || 'Search'}
          defaultValue={searchTerm}
          className="input input-sm input-bordered"
          onChange={(e) => {
            setSearchTerm(e.target.value)
          }}
        ></input>
        <IconX className="border border-solid border-red-300" onClick={clear} />
      </div>
      {children}
    </>
  )
}
