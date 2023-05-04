import { PropsWithChildren } from "react"

export const Searchable = ({ searchTerm, children, setSearchTerm }: PropsWithChildren<{ searchTerm: string, setSearchTerm: (searchTerm: string) => void }>) => {

    return (<>
        <input placeholder="search" defaultValue={searchTerm} className="input input-sm" onChange={e => setSearchTerm(e.target.value)}></input>
        {children}
    </>)


}