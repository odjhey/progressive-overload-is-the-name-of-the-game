import localforage from 'localforage'
import { useEffect, useMemo, useRef, useState } from 'react'

export type Lift = {
  date: string
  name: string
  weight: number
  uom: string
  set: number
  rep: number
  comment: string
}

const lskey = 'ZLDKSJF'
export const useLifts = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState<Error>()
  const [error, setError] = useState<Error>()
  const [data, setData] = useState<Lift[]>([])
  const stored = useRef<{ lifts: Lift[] }>()
  const pending = useRef(false)

  const unique = useMemo<typeof data>(() => {
    const orderedData = [...data].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    const keys = new Set(orderedData.map((d) => d.name))
    const isLift = (item: Lift | undefined): item is Lift => item !== undefined
    return [...keys.values()]
      .map((k) => orderedData.find((d) => d.name === k))
      .filter(isLift)
  }, [data])

  useEffect(() => {
    let active = true
    localforage
      .getItem<{ lifts: Lift[] }>(lskey)
      .then((value) => {
        if (!active) return
        const next = value ?? { lifts: [] }
        if (!Array.isArray(next.lifts)) {
          throw new Error(
            'Workout history could not be read. Restore a valid workout backup in Settings before saving.'
          )
        }
        stored.current = next
        setData(next.lifts)
      })
      .catch((cause: unknown) => {
        if (!active) return
        const failure =
          cause instanceof Error ? cause : new Error(String(cause))
        setLoadError(failure)
        setError(failure)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const mutateLifts = async (
    change: (lifts: Lift[]) => { lifts: Lift[]; lift: Lift },
    onSuccess?: (lift: Lift) => void
  ): Promise<void> => {
    if (pending.current) return
    setError(undefined)
    const current = stored.current
    if (!current) {
      setError(
        loadError ??
          new Error(
            'Wait for workout history to load before saving. If loading failed, reopen the app or restore a backup in Settings.'
          )
      )
      return
    }
    pending.current = true
    setSaving(true)
    try {
      const result = change(current.lifts)
      const next = { ...current, lifts: result.lifts }
      await localforage.setItem(lskey, next)
      stored.current = next
      setData(next.lifts)
      onSuccess?.(result.lift)
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause : new Error(String(cause)))
    } finally {
      pending.current = false
      setSaving(false)
    }
  }

  const deleteLift = (
    keys: Pick<Lift, 'date' | 'name'>,
    options?: {
      onSuccess?: (lift: Lift) => void
    }
  ): Promise<void> =>
    mutateLifts((lifts) => {
      const matches = (lift: Lift) =>
        lift.date === keys.date && lift.name === keys.name
      const index = lifts.findIndex(matches)
      if (index === -1) {
        throw new Error(
          'This workout no longer exists. Return to history and select the workout again.'
        )
      }
      if (lifts.findIndex((lift, i) => i !== index && matches(lift)) !== -1) {
        throw new Error(
          'More than one workout has this name and date. Back up and resolve the duplicate records before deleting.'
        )
      }
      return {
        lifts: lifts.filter((_, i) => i !== index),
        lift: lifts[index],
      }
    }, options?.onSuccess)

  const upsertLift = (
    lift: Lift,
    options?: {
      original?: Pick<Lift, 'name' | 'date'>
      onSuccess?: (lift: Lift) => void
    }
  ): Promise<void> =>
    mutateLifts((lifts) => {
      const original = options?.original
      const index = original
        ? lifts.findIndex(
            (item) => item.name === original.name && item.date === original.date
          )
        : -1
      if (original && index === -1) {
        throw new Error(
          'The original workout no longer exists. Return to history and select it again before editing.'
        )
      }
      if (
        original &&
        lifts.findIndex(
          (item, i) =>
            i !== index &&
            item.name === original.name &&
            item.date === original.date
        ) !== -1
      ) {
        throw new Error(
          'More than one workout matches the original name and date. Back up and resolve the duplicate records before editing.'
        )
      }
      if (
        lifts.some(
          (item, i) =>
            i !== index && item.name === lift.name && item.date === lift.date
        )
      ) {
        throw new Error(
          'A workout with this name and date already exists. Choose a different date or name, or edit that existing workout.'
        )
      }
      const savedLift =
        index === -1 ? { ...lift } : { ...lifts[index], ...lift }
      return {
        lifts:
          index === -1
            ? [...lifts, savedLift]
            : lifts.map((item, i) => (i === index ? savedLift : item)),
        lift: savedLift,
      }
    }, options?.onSuccess)

  return {
    loading,
    saving,
    loadError,
    data,
    unique,
    error,
    upsertLift,
    deleteLift,
  }
}
