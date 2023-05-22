import localforage from 'localforage'
import { useEffect, useState } from 'react'

export type PersistentFilter = {
  tags: string[]
}

// TODO: add version support
// TODO: fix typescript
const lskey = 'PersistendFilterakj'
export const usePersistentFilters = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error>()
  const [data, setData] = useState<PersistentFilter>({ tags: [] })

  const reloadItem = () => {
    return localforage
      .getItem(lskey)
      .then((d) => {
        const defaultTags: PersistentFilter = { tags: [] }
        const typedD = d as PersistentFilter
        if (typedD) {
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
