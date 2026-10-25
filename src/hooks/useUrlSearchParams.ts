import { useLocation } from 'react-router-dom'
import { defaultParseSearch } from '../libs/searchParams'

export const useUrlSearchParams = () => {
  const { search } = useLocation()
  return [defaultParseSearch(search)]
}
