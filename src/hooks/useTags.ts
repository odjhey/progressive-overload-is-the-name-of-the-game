import localforage from 'localforage'
import { useEffect, useMemo, useRef, useState } from 'react'

export type Tag = {
  name: string
  liftName: string
}

const lskey = 'TAGSlksajdf'
export const useTags = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState<Error>()
  const [error, setError] = useState<Error>()
  const [data, setData] = useState<Tag[]>([])
  const stored = useRef<{ tags: Tag[] }>()
  const pending = useRef(false)

  const unique = useMemo(() => {
    const tagNames = data.map((d) => d.name)
    return [...new Set(tagNames)]
  }, [data])

  useEffect(() => {
    let active = true
    localforage
      .getItem<{ tags: Tag[] }>(lskey)
      .then((value) => {
        if (!active) return
        const next = value ?? { tags: [] }
        if (!Array.isArray(next.tags)) {
          throw new Error('Tags could not be read. Restore a valid tags backup in Settings before saving.')
        }
        stored.current = next
        setData(next.tags)
      })
      .catch((cause: unknown) => {
        if (!active) return
        const failure = cause instanceof Error ? cause : new Error(String(cause))
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

  const mutateTags = async (
    change: (tags: Tag[]) => { tags: Tag[]; tag: Tag },
    onSuccess?: (tag: Tag) => void
  ): Promise<void> => {
    if (pending.current) return
    setError(undefined)
    const current = stored.current
    if (!current) {
      setError(loadError ?? new Error('Wait for tags to load before saving. If loading failed, reopen the app or restore a backup in Settings.'))
      return
    }
    pending.current = true
    setSaving(true)
    try {
      const result = change(current.tags)
      const next = { ...current, tags: result.tags }
      await localforage.setItem(lskey, next)
      stored.current = next
      setData(next.tags)
      onSuccess?.(result.tag)
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause : new Error(String(cause)))
    } finally {
      pending.current = false
      setSaving(false)
    }
  }

  const deleteTag = (
    tag: Tag,
    options?: {
      onSuccess?: (tag: Tag) => void
    }
  ): Promise<void> =>
    mutateTags((tags) => {
      const index = tags.findIndex(
        (item) => item.liftName === tag.liftName && item.name === tag.name
      )
      if (index === -1) {
        throw new Error('This tag is no longer assigned to this lift. Return to the tag list and select it again.')
      }
      return {
        tags: tags.filter(
          (item) => item.liftName !== tag.liftName || item.name !== tag.name
        ),
        tag: tags[index],
      }
    }, options?.onSuccess)

  const appendTag = (
    tag: Tag,
    options?: {
      onSuccess?: (tag: Tag) => void
    }
  ): Promise<void> =>
    mutateTags((tags) => {
      if (
        tags.some(
          (item) => item.liftName === tag.liftName && item.name === tag.name
        )
      ) {
        throw new Error('This tag is already assigned to this lift. Choose a different tag name.')
      }
      const savedTag = { ...tag }
      return { tags: [...tags, savedTag], tag: savedTag }
    }, options?.onSuccess)

  return { loading, saving, loadError, data, error, unique, appendTag, deleteTag }
}
