import localforage from 'localforage'
import { useState } from 'react'

export const useDbRaw = () => {
  const [loading, setLoading] = useState(false)
  const [keys, setKeys] = useState<string[]>([])

  const uploadRaw = (key: string, value: unknown) => {
    setLoading(true)
    localforage
      .setItem(key, value)
      .then(() => {
        console.log('success')
      })
      .catch((e) => {
        console.error(e)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const fetchKeys = () => {
      return localforage
        .keys()
        .then((keys) => {
          setKeys(keys)
          return keys
        })
        .finally(() => {
          setLoading(false)
        })
    }

  const getValues = (key: string) => {
    return localforage.getItem(key).then((value) => {
      return JSON.stringify(value)
    })
  }

  return { fetchKeys, keys, loading, getValues, uploadRaw }
}
