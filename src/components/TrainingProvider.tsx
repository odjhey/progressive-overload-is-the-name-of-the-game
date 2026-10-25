import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { TrainingContext } from '../hooks/useTraining'
import type { TrainingContextValue } from '../hooks/useTraining'
import type { LegacySnapshot, TrainingDocument, TrainingEntry } from '../libs/trainingTypes'
import {
  commitTrainingDocument,
  emptyTrainingDocument,
  isTrainingDate,
  newId,
  queueTrainingOperation,
  readLegacySnapshot,
  readTrainingDocument,
  sameValue,
  StorageMutationError,
  validateTrainingDocument,
} from '../libs/trainingModel'

type Snapshot = {
  document: TrainingDocument | null
  storedRevision: number | null
  legacy: LegacySnapshot | null
}
const initial: Snapshot = { document: null, storedRevision: null, legacy: null }
const asError = (cause: unknown) => cause instanceof Error ? cause : new Error(String(cause))

export function TrainingProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<Snapshot>(initial)
  const current = useRef(snapshot)
  const ready = useRef(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState<Error>()
  const [error, setError] = useState<Error>()
  const pending = useRef(0)
  const mounted = useRef(true)

  const publish = useCallback((next: Snapshot) => {
    current.current = next
    if (mounted.current) setSnapshot(next)
  }, [])

  const reload = useCallback(async (): Promise<void> => {
    if (mounted.current) setLoading(true)
    return queueTrainingOperation(async () => {
      ready.current = false
      try {
        const stored = await readTrainingDocument()
        const legacy = stored === null ? await readLegacySnapshot() : null
        const blocked = legacy !== null && legacy.keys.length > 0
        publish({
          document: stored ?? (blocked ? null : emptyTrainingDocument()),
          storedRevision: stored?.revision ?? null,
          legacy: blocked ? legacy : null,
        })
        ready.current = !blocked
        if (mounted.current) {
          setLoadError(undefined)
          setError(undefined)
        }
      } catch (cause) {
        // A failed read is never interpreted as an empty, writable history.
        publish({ ...current.current, document: null })
        const failure = asError(cause)
        if (mounted.current) {
          setLoadError(failure)
          setError(failure)
        }
        throw failure
      } finally {
        if (mounted.current) setLoading(false)
      }
    })
  }, [publish])

  useEffect(() => {
    mounted.current = true
    void reload().catch(() => undefined)
    return () => { mounted.current = false }
  }, [reload])

  async function operation<T>(action: () => Promise<T>): Promise<T> {
    pending.current += 1
    if (mounted.current) {
      setSaving(true)
      setError(undefined)
    }
    try {
      return await queueTrainingOperation(action)
    } catch (cause) {
      const failure = asError(cause)
      if (mounted.current) setError(failure)
      throw failure
    } finally {
      pending.current -= 1
      if (mounted.current) setSaving(pending.current > 0)
    }
  }

  function ensureReady() {
    if (!ready.current || !current.current.document || current.current.legacy) {
      throw new StorageMutationError('Training is not ready for changes. Load it successfully or review the legacy migration in Settings first. No write was attempted.', 'not-written')
    }
  }

  async function mutate<T>(
    change: (doc: TrainingDocument) => { document: TrainingDocument; result: T; unchanged?: boolean },
    duplicate?: (doc: TrainingDocument) => T | undefined
  ): Promise<T> {
    return operation(async () => {
      ensureReady()
      let stored: TrainingDocument | null
      try {
        stored = await readTrainingDocument()
      } catch (cause) {
        throw new StorageMutationError('Training could not be checked; no write was attempted.', 'not-written', cause)
      }
      const doc = stored ?? emptyTrainingDocument()
      // Reconcile an already-durable retry without another effect, even after an
      // earlier write succeeded but its verification read failed.
      const prior = duplicate?.(doc)
      if (prior !== undefined) {
        publish({ ...current.current, document: doc, storedRevision: stored?.revision ?? null })
        return structuredClone(prior)
      }
      if ((stored?.revision ?? null) !== current.current.storedRevision) {
        throw new StorageMutationError('Training changed since this view loaded. Reload and review before saving. No write was attempted.', 'not-written')
      }
      const changed = change(doc)
      if (changed.unchanged) return structuredClone(changed.result)
      const committed = await commitTrainingDocument(changed.document, current.current.storedRevision)
      publish({ ...current.current, document: committed, storedRevision: committed.revision })
      return structuredClone(changed.result)
    })
  }

  const saveEntry: TrainingContextValue['saveEntry'] = async (input, originalId) => {
    const draft = structuredClone(input)
    function sameCreation(doc: TrainingDocument): TrainingEntry | undefined {
      if (originalId !== undefined) return undefined
      const existing = doc.entries.find((entry) => entry.id === draft.id)
      if (!existing) return undefined
      const exercise = doc.exercises.find((item) => item.id === existing.exerciseId)
      const candidate = {
        id: draft.id,
        exerciseName: draft.exerciseName,
        trainingDate: draft.trainingDate,
        performedAt: draft.performedAt,
        groups: draft.groups,
        notes: draft.notes,
        workoutId: draft.workoutId,
      }
      const saved = {
        id: existing.id,
        exerciseName: exercise?.name,
        trainingDate: existing.trainingDate,
        performedAt: existing.performedAt,
        groups: existing.groups,
        notes: existing.notes,
        workoutId: existing.workoutId,
      }
      if (!sameValue(candidate, saved)) {
        throw new StorageMutationError('This entry ID already belongs to different saved work. It was not overwritten; keep this draft and review the saved entry.', 'not-written')
      }
      return existing
    }
    return mutate((doc) => {
      if (typeof draft.exerciseName !== 'string' || !draft.exerciseName.trim()) throw new Error('Enter an exercise name.')
      const existing = originalId === undefined ? undefined : doc.entries.find((entry) => entry.id === originalId)
      if (originalId !== undefined && (!existing || draft.id !== originalId)) {
        throw new Error('Editing requires the original saved entry ID, unchanged. No entry was written.')
      }
      if (doc.entries.some((entry) => entry.id === draft.id && entry.id !== originalId)) throw new Error('Entry ID is already in use.')
      const selected = draft.exerciseId === undefined ? undefined : doc.exercises.find((exercise) => exercise.id === draft.exerciseId)
      if (draft.exerciseId !== undefined && !selected) throw new Error('The selected exercise no longer exists.')
      // A changed label on an entry moves only this entry. Global rename is explicit.
      const exercise = selected?.name === draft.exerciseName ? selected : doc.exercises.find((item) => item.name === draft.exerciseName)
      const target = exercise ?? { id: newId(), name: draft.exerciseName, tags: [] }
      const entry: TrainingEntry = {
        ...existing,
        id: draft.id,
        exerciseId: target.id,
        trainingDate: draft.trainingDate,
        recordedAt: existing ? existing.recordedAt : new Date().toISOString(),
        groups: draft.groups.map((group) => {
          const old = existing?.groups.find((item) => item.id === group.id)
          return { ...old, ...group, ...(group.metadata === undefined && old?.metadata !== undefined ? { metadata: old.metadata } : {}) }
        }),
        notes: draft.notes,
      }
      if (draft.performedAt !== undefined) entry.performedAt = draft.performedAt
      if (draft.workoutId === undefined) delete entry.workoutId
      else entry.workoutId = draft.workoutId
      const next = {
        ...doc,
        exercises: exercise ? doc.exercises : [...doc.exercises, target],
        entries: existing ? doc.entries.map((item) => item.id === originalId ? entry : item) : [...doc.entries, entry],
      }
      return { document: next, result: entry }
    }, sameCreation)
  }

  const deleteEntry: TrainingContextValue['deleteEntry'] = (id) => mutate((doc) => {
    if (!doc.entries.some((entry) => entry.id === id)) throw new Error('The entry no longer exists. Reload before deleting.')
    return { document: { ...doc, entries: doc.entries.filter((entry) => entry.id !== id) }, result: undefined }
  })

  const renameExercise: TrainingContextValue['renameExercise'] = (id, name) => mutate((doc) => {
    if (typeof name !== 'string' || !name.trim()) throw new Error('Exercise name cannot be empty.')
    const exercise = doc.exercises.find((item) => item.id === id)
    if (!exercise) throw new Error('Exercise no longer exists.')
    if (doc.exercises.some((item) => item.id !== id && item.name === name)) throw new Error('An exercise with that exact name already exists.')
    return {
      document: { ...doc, exercises: doc.exercises.map((item) => item.id === id ? { ...item, name } : item) },
      result: undefined,
      unchanged: exercise.name === name,
    }
  })

  const setExerciseTags: TrainingContextValue['setExerciseTags'] = async (id, tags) => {
    const nextTags = [...tags]
    return mutate((doc) => {
      const exercise = doc.exercises.find((item) => item.id === id)
      if (!exercise) throw new Error('Exercise no longer exists.')
      if (!nextTags.every((tag) => typeof tag === 'string') || new Set(nextTags).size !== nextTags.length) throw new Error('Tags must be unique text labels.')
      return {
        document: { ...doc, exercises: doc.exercises.map((item) => item.id === id ? { ...item, tags: nextTags } : item) },
        result: undefined,
        unchanged: sameValue(exercise.tags, nextTags),
      }
    })
  }

  const setAttendance: TrainingContextValue['setAttendance'] = (date, confirmed, notes) => mutate((doc) => {
    if (!isTrainingDate(date)) throw new Error('Choose a real training date.')
    if (typeof confirmed !== 'boolean' || (notes !== undefined && typeof notes !== 'string')) throw new Error('Invalid attendance details.')
    const onDate = doc.workouts.filter((workout) => workout.trainingDate === date)
    let workouts = doc.workouts
    if (confirmed) {
      const target = onDate.find((workout) => workout.attendanceConfirmed) ?? onDate[0]
      workouts = target
        ? doc.workouts.map((workout) => workout.id === target.id ? { ...workout, attendanceConfirmed: true, ...(notes === undefined ? {} : { notes }) } : workout)
        : [...doc.workouts, { id: newId(), trainingDate: date, recordedAt: new Date().toISOString(), notes: notes ?? '', attendanceConfirmed: true }]
    } else {
      workouts = doc.workouts.flatMap((workout) => {
        if (workout.trainingDate !== date || !workout.attendanceConfirmed) return [workout]
        // Keep any workout referenced by real entries; removing a confirmation never removes work.
        return doc.entries.some((entry) => entry.workoutId === workout.id)
          ? [{ ...workout, attendanceConfirmed: false, ...(notes === undefined ? {} : { notes }) }]
          : []
      })
    }
    return { document: { ...doc, workouts }, result: undefined, unchanged: sameValue(workouts, doc.workouts) }
  })

  const replaceDocument: TrainingContextValue['replaceDocument'] = async (next, expectedRevision) => {
    const validated = validateTrainingDocument(next)
    return operation(async () => {
      if (expectedRevision !== null && (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0)) throw new Error('Invalid expected destination revision.')
      const committed = await commitTrainingDocument(validated, expectedRevision)
      // Keep the migration gate mounted until recovery finishes the separate filter
      // write and explicitly reloads. Replacing two keys is not atomic.
      publish({ ...current.current, document: committed, storedRevision: committed.revision })
      ready.current = current.current.legacy === null
      if (mounted.current) setLoadError(undefined)
    })
  }

  const value: TrainingContextValue = {
    ...snapshot,
    loading,
    saving,
    loadError,
    error,
    saveEntry,
    deleteEntry,
    renameExercise,
    setExerciseTags,
    setAttendance,
    replaceDocument,
    reload,
  }
  return <TrainingContext.Provider value={value}>{children}</TrainingContext.Provider>
}
