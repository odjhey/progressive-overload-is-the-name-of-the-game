import localforage from 'localforage'
import { useCallback, useRef, useState } from 'react'
import {
  recoveryTargets,
  RecoveryTarget,
  validateBackup,
} from '../libs/backupValidation'

export type RawSnapshot = { key: string; exists: boolean; value: unknown }

const serialize = (value: unknown) => JSON.stringify(value)

export const useDbRaw = () => {
  const [loading, setLoading] = useState(false)
  const [keys, setKeys] = useState<string[]>([])
  const [error, setError] = useState<Error>()
  const writing = useRef(false)

  const getKeys = useCallback(async () => {
    setLoading(true)
    setError(undefined)
    try {
      const storedKeys = await localforage.keys()
      setKeys(storedKeys)
      return storedKeys
    } catch {
      setError(
        new Error(
          'Could not list stored data. Retry before relying on a backup.'
        )
      )
      return undefined
    } finally {
      setLoading(false)
    }
  }, [])

  const getSnapshot = async (key: string): Promise<RawSnapshot> => {
    const storedKeys = await localforage.keys()
    const exists = storedKeys.includes(key)
    return {
      key,
      exists,
      value: exists ? await localforage.getItem(key) : null,
    }
  }

  const getValues = async (key: string) => {
    const snapshot = await getSnapshot(key)
    if (!snapshot.exists)
      throw new Error('This data is no longer stored. Refresh the key list.')
    const text = serialize(snapshot.value)
    if (text === undefined)
      throw new Error('This stored value cannot be exported as JSON.')
    return text
  }

  const uploadRaw = async (
    target: RecoveryTarget,
    value: unknown,
    expected: RawSnapshot,
    replaceAcknowledged: boolean
  ) => {
    if (writing.current)
      throw new Error('A restore is already running. Wait for its result.')
    writing.current = true
    setLoading(true)
    try {
      if (!(target in recoveryTargets))
        throw new Error('Choose a supported restore destination.')
      validateBackup(target, value)
      const key = recoveryTargets[target].key
      if (expected.key !== key)
        throw new Error('Destination changed. Preview the backup again.')
      const current = await getSnapshot(key)
      if (
        current.exists !== expected.exists ||
        serialize(current.value) !== serialize(expected.value)
      ) {
        throw new Error(
          'Destination data changed since the preview. Preview again and back up the current data before replacing it.'
        )
      }
      if (current.exists && !replaceAcknowledged) {
        throw new Error(
          'Acknowledge replacement of the existing destination before restoring.'
        )
      }
      try {
        await localforage.setItem(key, value)
      } catch {
        throw new Error(
          'Storage did not confirm the restore. The outcome is unverified. Keep this file and your previous backup; preview the destination again before retrying.'
        )
      }
      let restored: RawSnapshot
      try {
        restored = await getSnapshot(key)
      } catch {
        throw new Error(
          'Storage accepted the write, but it could not be read back. The restore is unverified. Keep both backups and preview the destination again before retrying.'
        )
      }
      if (!restored.exists || serialize(restored.value) !== serialize(value)) {
        throw new Error(
          'The stored value did not match the backup on read-back. The restore is unverified. Keep both backups and inspect the destination before retrying.'
        )
      }
    } finally {
      writing.current = false
      setLoading(false)
    }
  }

  return { getKeys, keys, loading, error, getValues, getSnapshot, uploadRaw }
}
