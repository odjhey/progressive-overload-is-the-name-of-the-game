import { PropsWithChildren } from 'react'

export const Searchable = ({
  searchTerm,
  children,
  setSearchTerm,
  placeholder,
}: PropsWithChildren<{
  searchTerm: string
  setSearchTerm: (searchTerm: string) => void
  placeholder?: string
}>) => {
  return (
    <>
      <input
        placeholder={placeholder || 'Search'}
        defaultValue={searchTerm}
        className="input input-sm"
        onChange={(e) => setSearchTerm(e.target.value)}
      ></input>
      {children}
    </>
  )
}
