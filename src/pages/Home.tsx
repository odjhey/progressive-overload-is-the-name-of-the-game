import { useState } from "react";
import { useLifts } from "../hooks/useLifts";
import { useDebouncedCallback } from 'use-debounce';
import { Searchable } from "../components/Searchable";
import { LiftsForm } from "../components/LiftsForm";
import { useUrlSearchParams } from "../hooks/useUrlSearchParams";

export default function Home() {
    const { data, error, loading, saveLifts } = useLifts()
    const [searchTerm, setSearchTerm] = useState("")
    const setSearchTermDeb = useDebouncedCallback((value) => {
        setSearchTerm(value)
    }, 500)
    const [selected] = useUrlSearchParams()

    if (loading) {
        return <div>Loading...</div>
    }

    if (error) {
        return <div>{error.message}</div>
    }

    console.log(data)
    return <Searchable searchTerm={searchTerm} setSearchTerm={setSearchTermDeb}>
        <LiftsForm
            selectedKey={(selected as any).selected ?? ""}
            lifts={data}
            filterFn={(row: any) => {

                const filterResults = []
                // if (dateFilter) {
                //     filterResults.push(row.date === dateFilter)
                // }

                // if (row.name === "") { return true } <--- lets accept the misfeature of unable to add after search

                if (searchTerm === "") {
                    // none
                } else {
                    filterResults.push(
                        JSON.stringify(Object.values(row)).toLowerCase().includes(searchTerm.toLowerCase())
                    )
                }

                return filterResults.length === 0 || filterResults.every((v) => v === true)
            }}
            onSubmit={(d: unknown[]) => saveLifts(d)}></LiftsForm>
    </Searchable>
}
