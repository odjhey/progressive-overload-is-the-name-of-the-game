import localforage from 'localforage'
import { useEffect, useState } from 'react'

export type Tag = {
  name: string
  liftName: string
}

// TODO: add version support
// TODO: fix typescript
const lskey = 'TAGSlksajdf'
export const useTags = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error>()
  const [data, setData] = useState<Tag[]>([])

  const reloadItem = () => {
    return localforage
      .getItem(lskey)
      .then((d) => {
        const defaultTags: Tag[] = []
        const typedD = d as { tags: Tag[] }
        if (typedD && typedD.tags) {
          return typedD.tags
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

  const saveTags = (tags: Tag[]) => {
    setLoading(true)
    return localforage
      .setItem(lskey, { tags })
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

  const appendTag = (
    tag: Tag,
    options?: {
      onSuccess: (tag: Tag) => void
    }
  ) => {
    setLoading(true)
    const match = data.find(
      (d) => d.liftName === tag.liftName && d.name === tag.name
    )
    if (match) {
      // already exist, skip
      // FIXME: no empty return
      return
    }

    return localforage
      .setItem(lskey, { tags: [...data, tag] })
      .catch((e) => {
        setError(e)
      })
      .then((_) => {
        // reload
        reloadItem()
        if (options && typeof options.onSuccess === 'function') {
          options.onSuccess(tag)
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return { loading, data, error, saveTags, appendTag }
}
