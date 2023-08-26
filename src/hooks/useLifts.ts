import localforage from 'localforage'
import { useEffect, useMemo, useState } from 'react'

export type Lift = {
  date: string
  name: string
  weight: number
  uom: string
  set: number
  rep: number
  comment: string
  difficulty?: number
}

// TODO: add version support
// TODO: fix typescript
const lskey = 'ZLDKSJF'
export const useLifts = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error>()
  const [data, setData] = useState<Lift[]>([])

  const unique = useMemo<typeof data>(() => {
    const orderedData = data.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    const keys = new Set(orderedData.map((d) => d.name))
    const isLift = (item: Lift | undefined): item is Lift => item !== undefined
    return [...keys.values()]
      .map((k) => orderedData.find((d) => d.name === k))
      .filter(isLift)
  }, [data])

  const reloadItem = () => {
    return localforage
      .getItem(lskey)
      .then((d: any) => {
        const defaultLifts: any[] = []
        if (d && d.lifts) {
          return d.lifts
        }
        return defaultLifts
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

  const saveLifts = (lifts: any[]) => {
    setLoading(true)
    return localforage
      .setItem(lskey, { lifts })
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

  const deleteLift = (
    keys: Pick<Lift, 'date' | 'name'>,
    options?: {
      onSuccess: (lift: Lift) => void
    }
  ) => {
    setLoading(true)

    const index = data.findIndex(
      (d) => d.date === keys.date && d.name === keys.name
    )
    const toBeDeleted = data[index]

    const updatedLifts =
      index > -1
        ? (() => {
            data.splice(index, 1)
            return [...data]
          })()
        : [...data]

    return localforage
      .setItem(lskey, { lifts: updatedLifts })
      .catch((e) => {
        setError(e)
      })
      .then((_) => {
        // reload
        reloadItem()
        if (options && typeof options.onSuccess === 'function') {
          options.onSuccess(toBeDeleted)
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const upsertLift = (
    lift: Lift,
    options?: {
      onSuccess: (lift: Lift) => void
    }
  ) => {
    setLoading(true)
  
    const index = data.findIndex(
      (d) => d.date === lift.date && d.name === lift.name
    )
  
    const updatedLifts =
      index > -1
        ? (() => {
            data[index] = { ...data[index], ...lift }
            return [...data]
          })()
        : [...data, lift]
  
    return localforage
      .setItem(lskey, { lifts: updatedLifts })
      .catch((e) => {
        setError(e)
      })
      .then((_) => {
        // reload
        reloadItem()
        if (options && typeof options.onSuccess === 'function') {
          options.onSuccess(lift)
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const appendLift = (
    lift: Lift,
    options?: {
      onSuccess: (lift: Lift) => void
    }
  ) => {
    setLoading(true)
    return localforage
      .setItem(lskey, { lifts: [...data, lift] })
      .catch((e) => {
        setError(e)
      })
      .then((_) => {
        // reload
        reloadItem()
        if (options && typeof options.onSuccess === 'function') {
          options.onSuccess(lift)
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return {
    loading,
    data,
    unique,
    error,
    saveLifts,
    appendLift,
    upsertLift,
    deleteLift,
  }
}
