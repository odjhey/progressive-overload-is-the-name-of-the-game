import localforage from 'localforage'
import type {
  LegacyDatePolicy,
  LegacySnapshot,
  SavedFilters,
  TrainingDocument,
} from './trainingTypes'

export const TRAINING_KEY = 'progressive-overload:training:v2'
export const FILTERS_KEY = 'progressive-overload:filters:v2'
const LEGACY_WORKOUTS = 'ZLDKSJF'
const LEGACY_TAGS = 'TAGSlksajdf'
const LEGACY_FILTERS = 'PersistendFilterakj'
const legacyKeys = [LEGACY_WORKOUTS, LEGACY_TAGS, LEGACY_FILTERS]

type ObjectValue = Record<string, unknown>
function object(value: unknown, label: string): ObjectValue {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`)
  }
  return value as ObjectValue
}
function text(value: unknown, label: string): asserts value is string {
  if (typeof value !== 'string') throw new Error(`${label} must be text.`)
}
function list(value: unknown, label: string): asserts value is unknown[] {
  if (!Array.isArray(value)) throw new Error(`${label} must be a list.`)
}
function finite(value: unknown, label: string): asserts value is number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`${label} must be a finite number.`)
  }
}
function timestamp(value: unknown, label: string) {
  if (value !== null) {
    text(value, label)
    if (!Number.isFinite(Date.parse(value)))
      throw new Error(`${label} is invalid.`)
  }
}
function metadata(value: unknown, label: string) {
  if (value !== undefined) object(value, label)
}

export function newId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6] & 15) | 64
  bytes[8] = (bytes[8] & 63) | 128
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0'))
  return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10).join('')}`
}

export function localDate(date = new Date()): string {
  if (!Number.isFinite(date.getTime())) throw new Error('Invalid local date.')
  return `${String(date.getFullYear()).padStart(4, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function isTrainingDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false
  const [year, month, day] = value.split('-').map(Number)
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  return (
    year >= 1 && month >= 1 && month <= 12 && day >= 1 && day <= days[month - 1]
  )
}

export function emptyTrainingDocument(): TrainingDocument {
  return { version: 2, revision: 0, exercises: [], entries: [], workouts: [] }
}

export function validateTrainingDocument(value: unknown): TrainingDocument {
  const doc = object(value, 'Training document')
  if (doc.version !== 2)
    throw new Error('Expected training document version 2.')
  if (!Number.isSafeInteger(doc.revision) || (doc.revision as number) < 0) {
    throw new Error('Training revision must be a nonnegative safe integer.')
  }
  list(doc.exercises, 'Exercises')
  list(doc.entries, 'Entries')
  list(doc.workouts, 'Workouts')
  metadata(doc.metadata, 'Training metadata')
  const identities = new Set<string>()
  function identity(value: unknown, label: string): string {
    text(value, label)
    if (!value || identities.has(value))
      throw new Error(`${label} is empty or duplicated.`)
    identities.add(value)
    return value
  }
  function date(value: unknown, label: string) {
    if (!isTrainingDate(value))
      throw new Error(`${label} must be a real YYYY-MM-DD date.`)
  }
  const exercises = new Set<string>()
  const names = new Set<string>()
  for (const raw of doc.exercises) {
    const exercise = object(raw, 'Exercise')
    exercises.add(identity(exercise.id, 'Exercise ID'))
    text(exercise.name, 'Exercise name')
    if (names.has(exercise.name))
      throw new Error('Exercise names must be exact and unique.')
    names.add(exercise.name)
    list(exercise.tags, 'Exercise tags')
    exercise.tags.forEach((tag) => text(tag, 'Exercise tag'))
    if (new Set(exercise.tags).size !== exercise.tags.length)
      throw new Error('Exercise tags are duplicated.')
    metadata(exercise.metadata, 'Exercise metadata')
  }
  const workouts = new Map<string, string>()
  for (const raw of doc.workouts) {
    const workout = object(raw, 'Workout')
    const id = identity(workout.id, 'Workout ID')
    date(workout.trainingDate, 'Workout date')
    workouts.set(id, workout.trainingDate as string)
    timestamp(workout.recordedAt, 'Workout recordedAt')
    text(workout.notes, 'Workout notes')
    if (typeof workout.attendanceConfirmed !== 'boolean')
      throw new Error('Workout attendance must be boolean.')
    metadata(workout.metadata, 'Workout metadata')
  }
  for (const raw of doc.entries) {
    const entry = object(raw, 'Entry')
    identity(entry.id, 'Entry ID')
    text(entry.exerciseId, 'Entry exercise ID')
    if (!exercises.has(entry.exerciseId))
      throw new Error('Entry references a missing exercise.')
    date(entry.trainingDate, 'Entry training date')
    timestamp(entry.recordedAt, 'Entry recordedAt')
    if (entry.performedAt !== undefined) {
      text(entry.performedAt, 'Entry performedAt')
      timestamp(entry.performedAt, 'Entry performedAt')
    }
    text(entry.notes, 'Entry notes')
    if (entry.workoutId !== undefined) {
      text(entry.workoutId, 'Entry workout ID')
      if (workouts.get(entry.workoutId) !== entry.trainingDate) {
        throw new Error(
          'Entry workout must exist and have the same training date.'
        )
      }
    }
    list(entry.groups, 'Entry groups')
    if (!entry.groups.length)
      throw new Error('An actual entry needs at least one set group.')
    for (const rawGroup of entry.groups) {
      const group = object(rawGroup, 'Set group')
      identity(group.id, 'Set group ID')
      for (const field of ['sets', 'reps', 'weight'])
        finite(group[field], `Group ${field}`)
      text(group.unit, 'Group unit')
      metadata(group.metadata, 'Group metadata')
    }
    metadata(entry.metadata, 'Entry metadata')
  }
  // Return an independent snapshot: mutations must not modify a previously published document.
  return structuredClone(value) as TrainingDocument
}

export async function readLegacySnapshot(): Promise<LegacySnapshot> {
  const present = await localforage.keys()
  const keys = legacyKeys.filter((key) => present.includes(key))
  const [workouts, tags, filters] = await Promise.all(
    legacyKeys.map((key) =>
      keys.includes(key) ? localforage.getItem(key) : Promise.resolve(null)
    )
  )
  return { keys, workouts, tags, filters }
}

function legacyEnvelope(
  snapshot: LegacySnapshot,
  key: string,
  value: unknown,
  field: string
): unknown[] {
  if (!snapshot.keys.includes(key)) return []
  const envelope = object(value, `Legacy ${field}`)
  list(envelope[field], `Legacy ${field}`)
  return envelope[field]
}

export function validateSavedFilters(value: unknown): SavedFilters {
  const filters = object(value, 'Saved filters')
  text(filters.term, 'Filter term')
  list(filters.tags, 'Filter tags')
  filters.tags.forEach((tag) => text(tag, 'Filter tag'))
  return { term: filters.term, tags: [...filters.tags] as string[] }
}

export function legacySavedFilters(snapshot: LegacySnapshot): SavedFilters {
  return snapshot.keys.includes(LEGACY_FILTERS)
    ? validateSavedFilters(snapshot.filters)
    : { term: '', tags: [] }
}

export function convertLegacy(
  snapshot: LegacySnapshot,
  policy: LegacyDatePolicy
): TrainingDocument {
  if (policy !== 'written' && policy !== 'local')
    throw new Error('Choose written or local legacy dates.')
  if (
    !Array.isArray(snapshot.keys) ||
    snapshot.keys.some((key) => !legacyKeys.includes(key)) ||
    new Set(snapshot.keys).size !== snapshot.keys.length
  ) {
    throw new Error('Legacy snapshot has invalid source keys.')
  }
  legacySavedFilters(snapshot)
  const lifts = legacyEnvelope(
    snapshot,
    LEGACY_WORKOUTS,
    snapshot.workouts,
    'lifts'
  )
  const tags = legacyEnvelope(snapshot, LEGACY_TAGS, snapshot.tags, 'tags')
  const result = emptyTrainingDocument()
  const byName = new Map<string, TrainingDocument['exercises'][number]>()
  function exercise(name: string) {
    let item = byName.get(name)
    if (!item) {
      item = { id: newId(), name, tags: [] }
      byName.set(name, item)
      result.exercises.push(item)
    }
    return item
  }
  lifts.forEach((raw, index) => {
    const row = object(raw, `Legacy workout ${index + 1}`)
    for (const field of ['name', 'date', 'uom'])
      text(row[field], `Legacy workout ${index + 1} ${field}`)
    for (const field of ['set', 'rep', 'weight'])
      finite(row[field], `Legacy workout ${index + 1} ${field}`)
    if (row.comment !== undefined && row.comment !== null)
      text(row.comment, 'Legacy comment')
    const source = row.date as string
    const parsed = new Date(source)
    const written = source.match(/^(\d{4}-\d{2}-\d{2})(?:$|[T\s])/i)?.[1]
    if (
      !Number.isFinite(parsed.getTime()) ||
      (written !== undefined && !isTrainingDate(written))
    ) {
      throw new Error(
        `Legacy workout ${index + 1} has an invalid date: ${source}`
      )
    }
    const trainingDate = policy === 'written' ? written : localDate(parsed)
    if (!isTrainingDate(trainingDate)) {
      throw new Error(
        `Legacy workout ${index + 1} has no valid written YYYY-MM-DD date. Review the local-date policy.`
      )
    }
    result.entries.push({
      id: newId(),
      exerciseId: exercise(row.name as string).id,
      trainingDate,
      performedAt: source,
      recordedAt: null,
      groups: [
        {
          id: newId(),
          sets: row.set as number,
          reps: row.rep as number,
          weight: row.weight as number,
          unit: row.uom as string,
        },
      ],
      notes: typeof row.comment === 'string' ? row.comment : '',
      metadata: {
        legacy: { index, sourceDate: source, row: structuredClone(row) },
      },
    })
  })
  tags.forEach((raw, index) => {
    const row = object(raw, `Legacy tag ${index + 1}`)
    text(row.name, 'Legacy tag name')
    text(row.liftName, 'Legacy tag exercise name')
    const target = exercise(row.liftName)
    if (!target.tags.includes(row.name)) target.tags.push(row.name)
  })
  // Complete source envelopes preserve duplicate tags, unknown fields and null/missing comments.
  result.metadata = {
    legacy: { datePolicy: policy, snapshot: structuredClone(snapshot) },
  }
  return validateTrainingDocument(result)
}

export class StorageMutationError extends Error {
  readonly outcome: 'not-written' | 'unverified'
  constructor(
    message: string,
    outcome: 'not-written' | 'unverified',
    cause?: unknown
  ) {
    super(
      `${message}${cause === undefined ? '' : ` ${cause instanceof Error ? cause.message : String(cause)}`}`
    )
    this.name = 'StorageMutationError'
    this.outcome = outcome
  }
}

// These queues serialize this application's in-process callers only, not other browser tabs.
let trainingQueue: Promise<unknown> = Promise.resolve()
export function queueTrainingOperation<T>(
  action: () => Promise<T>
): Promise<T> {
  const operation = trainingQueue.then(action)
  trainingQueue = operation.catch(() => undefined)
  return operation
}
let filterQueue: Promise<unknown> = Promise.resolve()
function queueFilters<T>(action: () => Promise<T>): Promise<T> {
  const operation = filterQueue.then(action)
  filterQueue = operation.catch(() => undefined)
  return operation
}

export async function readTrainingDocument(): Promise<TrainingDocument | null> {
  const value = await localforage.getItem(TRAINING_KEY)
  if (value === null) {
    if ((await localforage.keys()).includes(TRAINING_KEY))
      throw new Error(
        'Stored version 2 training is null, not an absent history. Restore a valid backup.'
      )
    return null
  }
  return validateTrainingDocument(value)
}

// Object property order is not meaningful; array order and every stored value are.
export function sameValue(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true
  if (!left || !right || typeof left !== 'object' || typeof right !== 'object')
    return false
  if (Array.isArray(left) || Array.isArray(right)) {
    return (
      Array.isArray(left) &&
      Array.isArray(right) &&
      left.length === right.length &&
      left.every((value, index) => sameValue(value, right[index]))
    )
  }
  const a = left as ObjectValue
  const b = right as ObjectValue
  const keys = Object.keys(a)
  return (
    keys.length === Object.keys(b).length &&
    keys.every(
      (key) =>
        Object.prototype.hasOwnProperty.call(b, key) &&
        sameValue(a[key], b[key])
    )
  )
}

export async function commitTrainingDocument(
  next: TrainingDocument,
  expectedRevision: number | null
): Promise<TrainingDocument> {
  const validated = validateTrainingDocument(next)
  let current: TrainingDocument | null
  try {
    current = await readTrainingDocument()
  } catch (cause) {
    throw new StorageMutationError(
      'Training could not be checked; no write was attempted.',
      'not-written',
      cause
    )
  }
  if ((current?.revision ?? null) !== expectedRevision) {
    throw new StorageMutationError(
      'Training changed since this snapshot. Reload and review before saving. No write was attempted.',
      'not-written'
    )
  }
  validated.revision = (current?.revision ?? 0) + 1
  if (!Number.isSafeInteger(validated.revision))
    throw new StorageMutationError(
      'Training revision is exhausted; no write was attempted.',
      'not-written'
    )
  try {
    await localforage.setItem(TRAINING_KEY, validated)
    const verified = await readTrainingDocument()
    if (!sameValue(verified, validated))
      throw new Error(
        'The saved training document does not match the requested snapshot.'
      )
    return validated
  } catch (cause) {
    throw new StorageMutationError(
      'Training save outcome is unverified. It may already be stored; reload to reconcile before another change. Your draft/source remains available.',
      'unverified',
      cause
    )
  }
}

export function readSavedFilters(): Promise<SavedFilters> {
  return queueFilters(async () => {
    const stored = await localforage.getItem(FILTERS_KEY)
    if (stored === null) {
      if ((await localforage.keys()).includes(FILTERS_KEY))
        throw new Error(
          'Stored filters are invalid null. Restore filters in Settings.'
        )
      return { term: '', tags: [] }
    }
    return validateSavedFilters(stored)
  })
}

export async function restoreSavedFilters(
  filters: SavedFilters
): Promise<void> {
  // Capture the caller's snapshot before queuing, including during rapid typing/reset.
  const next = validateSavedFilters(filters)
  return queueFilters(async () => {
    try {
      await localforage.setItem(FILTERS_KEY, next)
      const stored = await localforage.getItem(FILTERS_KEY)
      if (!sameValue(stored, next))
        throw new Error('Saved filters did not match on read-back.')
    } catch (cause) {
      throw new StorageMutationError(
        'Filter save outcome is unverified. Training history was not changed by this filter operation.',
        'unverified',
        cause
      )
    }
  })
}
