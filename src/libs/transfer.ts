import { normalizedName } from '../components/dailyFlow'
import { validateTrainingBackup } from './backupValidation'
import { newId, validateTrainingDocument } from './trainingModel'
import type { TrainingDocument, TrainingEntry } from './trainingTypes'

// Clipboard transfer between devices. A transfer carries selected exercises,
// all of their entries and the workouts those entries reference. Importing it
// merges into existing history and never deletes or overwrites saved work.
export const TRANSFER_FORMAT = 'progressive-overload-transfer'

export type Transfer = {
  format: typeof TRANSFER_FORMAT
  version: 1
  exportedAt: string
  training: TrainingDocument
}

export function makeTransfer(
  doc: TrainingDocument,
  exerciseIds: Iterable<string>
): Transfer {
  const chosen = new Set(exerciseIds)
  const exercises = doc.exercises.filter((item) => chosen.has(item.id))
  if (!exercises.length) throw new Error('Choose at least one exercise.')
  const entries = doc.entries.filter((entry) => chosen.has(entry.exerciseId))
  const workoutIds = new Set(entries.map((entry) => entry.workoutId))
  // Document-level metadata (such as the retained legacy source snapshot) is
  // device history, not part of a transfer; per-record metadata travels.
  const training = validateTrainingDocument({
    version: 2,
    revision: 0,
    exercises,
    entries,
    workouts: doc.workouts.filter((workout) => workoutIds.has(workout.id)),
  })
  return {
    format: TRANSFER_FORMAT,
    version: 1,
    exportedAt: new Date().toISOString(),
    training,
  }
}

// Accepts a transfer or a complete version 2 backup. Returns the training to merge.
export function parseTransfer(text: string): TrainingDocument {
  let value: unknown
  try {
    value = JSON.parse(text.trim()) as unknown
  } catch {
    throw new Error(
      'The pasted text is not complete JSON. Copy it again and paste all of it.'
    )
  }
  const record =
    value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {}
  if (record.format === TRANSFER_FORMAT) {
    if (record.version !== 1)
      throw new Error('This transfer was made by a newer app. Update first.')
    return validateTrainingDocument(record.training)
  }
  if (record.format === 'progressive-overload')
    return validateTrainingBackup(value).training
  throw new Error(
    'This is not a Progressive Overload transfer. Use Copy to clipboard on the other phone.'
  )
}

// Compare recorded work, ignoring IDs a previous merge may have remapped.
function sameWork(a: TrainingEntry, b: TrainingEntry) {
  const work = (entry: TrainingEntry) =>
    JSON.stringify({
      trainingDate: entry.trainingDate,
      performedAt: entry.performedAt,
      recordedAt: entry.recordedAt,
      notes: entry.notes,
      metadata: entry.metadata,
      groups: entry.groups.map(({ sets, reps, weight, unit, metadata }) => ({
        sets,
        reps,
        weight,
        unit,
        metadata,
      })),
    })
  return work(a) === work(b)
}

export type MergeSummary = {
  added: number
  skipped: number
  differing: number
  newExercises: number
  matchedExercises: number
  workoutsAdded: number
}

export function mergeTransfer(
  destination: TrainingDocument,
  incoming: TrainingDocument
): { document: TrainingDocument; summary: MergeSummary } {
  const doc = structuredClone(destination)
  const source = structuredClone(incoming)
  const used = new Set<string>()
  for (const item of [...doc.exercises, ...doc.workouts, ...doc.entries])
    used.add(item.id)
  doc.entries.forEach((entry) => entry.groups.forEach((g) => used.add(g.id)))
  const claim = (id: string) => {
    const next = used.has(id) ? newId() : id
    used.add(next)
    return next
  }
  const summary: MergeSummary = {
    added: 0,
    skipped: 0,
    differing: 0,
    newExercises: 0,
    matchedExercises: 0,
    workoutsAdded: 0,
  }

  const destinationEntries = new Map(doc.entries.map((e) => [e.id, e]))
  const pending = source.entries.filter((entry) => {
    const existing = destinationEntries.get(entry.id)
    if (!existing) return true
    summary.skipped += 1
    // Same ID, different content: keep this device's saved version.
    if (!sameWork(existing, entry)) summary.differing += 1
    return false
  })

  // Exercises: same ID, then exact name, then a unique case-insensitive name.
  const exerciseMap = new Map<string, string>()
  for (const exercise of source.exercises) {
    const byName = doc.exercises.filter(
      (item) => normalizedName(item.name) === normalizedName(exercise.name)
    )
    const target =
      doc.exercises.find((item) => item.id === exercise.id) ??
      doc.exercises.find((item) => item.name === exercise.name) ??
      (byName.length === 1 ? byName[0] : undefined)
    if (target) {
      exerciseMap.set(exercise.id, target.id)
      summary.matchedExercises += 1
      for (const tag of exercise.tags)
        if (!target.tags.includes(tag)) target.tags.push(tag)
    } else if (pending.some((entry) => entry.exerciseId === exercise.id)) {
      const id = claim(exercise.id)
      exerciseMap.set(exercise.id, id)
      doc.exercises.push({ ...exercise, id })
      summary.newExercises += 1
    }
  }

  // Workouts: reuse the same workout when it already exists on the same date.
  const workoutMap = new Map<string, string>()
  for (const workout of source.workouts) {
    if (!pending.some((entry) => entry.workoutId === workout.id)) continue
    const existing = doc.workouts.find((item) => item.id === workout.id)
    if (existing && existing.trainingDate === workout.trainingDate) {
      workoutMap.set(workout.id, existing.id)
      continue
    }
    const id = claim(workout.id)
    workoutMap.set(workout.id, id)
    doc.workouts.push({ ...workout, id })
    summary.workoutsAdded += 1
  }

  for (const entry of pending) {
    const exerciseId = exerciseMap.get(entry.exerciseId)
    if (!exerciseId) throw new Error('A pasted entry has no exercise.')
    doc.entries.push({
      ...entry,
      id: claim(entry.id),
      exerciseId,
      ...(entry.workoutId === undefined
        ? {}
        : { workoutId: workoutMap.get(entry.workoutId) }),
      groups: entry.groups.map((group) => ({ ...group, id: claim(group.id) })),
    })
    summary.added += 1
  }
  return { document: validateTrainingDocument(doc), summary }
}
