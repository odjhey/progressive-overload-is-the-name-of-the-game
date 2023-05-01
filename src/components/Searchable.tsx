import { PropsWithChildren } from "react"

export const Searchable = ({ searchTerm, children, setSearchTerm }: PropsWithChildren<{ searchTerm: string, setSearchTerm: (searchTerm: string) => void }>) => {

    return (<>
        <div className="flex justify-end p-2">
            <input placeholder="search" defaultValue={searchTerm} className="input input-sm" onChange={e => setSearchTerm(e.target.value)}></input>
        </div>
        {children}
    </>)


}