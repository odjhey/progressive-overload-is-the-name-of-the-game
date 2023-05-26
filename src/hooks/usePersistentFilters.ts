import localforage from 'localforage'
import { useEffect, useState } from 'react'

export type PersistentFilter = {
  tags: string[]
  term: string
}

// TODO: add version support
// TODO: fix typescript
const lskey = 'PersistendFilterakj'
export const usePersistentFilters = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error>()
  const [data, setData] = useState<PersistentFilter>({ tags: [], term: '' })

  const reloadItem = () => {
    return localforage
      .getItem(lskey)
      .then((d) => {
        const defaultTags: PersistentFilter = { tags: [], term: '' }
        const typedD = d as PersistentFilter
        if (
          typedD &&
          // below is some form of backward compat check
          typedD.tags &&
          typedD.term !== undefined
        ) {
          return typedD
        }
        return defaultTags
      })
      .then((d) => {
        setData(d)
      })
  }

  useEffect(() => {
    setLoading(true)
    reloadItem()
      .catch((e) => {
        setError(e)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const saveFilters = (filters: PersistentFilter) => {
    setLoading(true)
    return localforage
      .setItem(lskey, filters)
      .catch((e) => {
        setError(e)
      })
      .then(() => {
        // reload
        return reloadItem()
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return { loading, data, error, saveFilters }
}
