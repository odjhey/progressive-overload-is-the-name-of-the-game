import { useEffect, useRef, useState } from 'react'
import { readSavedFilters, restoreSavedFilters } from '../libs/trainingModel'
import type { SavedFilters } from '../libs/trainingTypes'

export type PersistentFilter = SavedFilters

export const usePersistentFilters = () => {
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<Error>()
  const [error, setError] = useState<Error>()
  const [data, setData] = useState<PersistentFilter>({ tags: [], term: '' })
  const current = useRef(data)
  const ready = useRef(false)
  const version = useRef(0)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    let active = true
    readSavedFilters()
      .then((stored) => {
        if (!active) return
        current.current = stored
        setData(stored)
        ready.current = true
      })
      .catch((cause: unknown) => {
        if (active)
          setLoadError(
            cause instanceof Error ? cause : new Error(String(cause))
          )
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
      mounted.current = false
      ready.current = false
    }
  }, [])

  const saveFilters = async (
    patch: Partial<PersistentFilter>
  ): Promise<void> => {
    if (!ready.current) {
      setError(
        new Error(
          'Saved filters have not loaded successfully. Restore them in Settings before saving filters.'
        )
      )
      return
    }
    const attempt = ++version.current
    const next = { ...current.current, ...patch }
    current.current = next
    setData(next)
    setError(undefined)
    // Optimistic typing stays responsive, but durable snapshots and resets share
    // the recovery helper's queue. Event callers receive a handled error state.
    try {
      await restoreSavedFilters(next)
    } catch (cause: unknown) {
      if (mounted.current && attempt === version.current) {
        setError(cause instanceof Error ? cause : new Error(String(cause)))
      }
    }
  }

  return { loading, loadError, data, error, saveFilters }
}
