import { useSearchParams } from "react-router-dom"
import { defaultParseSearch } from "../libs/searchParams"


export const useUrlSearchParams = () => {
    const [search] = useSearchParams()
    const searchObj = defaultParseSearch(search.toString())

    return [searchObj]
}