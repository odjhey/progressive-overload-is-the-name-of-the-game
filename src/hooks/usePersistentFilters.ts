import localforage from 'localforage'
import { useEffect, useRef, useState } from 'react'

export type PersistentFilter = {
  tags: string[]
  term: string
}

const lskey = 'PersistendFilterakj'
export const usePersistentFilters = () => {
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<Error>()
  const [error, setError] = useState<Error>()
  const [data, setData] = useState<PersistentFilter>({ tags: [], term: '' })
  const current = useRef(data)
  const ready = useRef(false)
  const writes = useRef(Promise.resolve())
  const version = useRef(0)

  useEffect(() => {
    let active = true
    localforage
      .getItem<PersistentFilter>(lskey)
      .then((stored) => {
        if (!active) return
        if (
          stored !== null &&
          (!stored ||
            !Array.isArray(stored.tags) ||
            !stored.tags.every((tag) => typeof tag === 'string') ||
            typeof stored.term !== 'string')
        ) {
          throw new Error(
            'Saved filters could not be read. Restore them in Settings.'
          )
        }
        current.current = stored ?? { tags: [], term: '' }
        setData(current.current)
        ready.current = true
      })
      .catch((cause: unknown) => {
        if (active) {
          setLoadError(cause instanceof Error ? cause : new Error(String(cause)))
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const saveFilters = (patch: Partial<PersistentFilter>) => {
    if (!ready.current) return Promise.resolve()
    const next = { ...current.current, ...patch }
    const attempt = ++version.current
    current.current = next
    setData(next)
    setError(undefined)
    // Keep typing responsive, but commit snapshots in order so Clear stays cleared.
    writes.current = writes.current
      .then(() => localforage.setItem(lskey, next))
      .then(() => undefined)
      .catch((cause: unknown) => {
        if (attempt === version.current) {
          setError(cause instanceof Error ? cause : new Error(String(cause)))
        }
      })
    return writes.current
  }

  return { loading, loadError, data, error, saveFilters }
}
