import localforage from 'localforage'
import {
  convertLegacy,
  FILTERS_KEY,
  legacySavedFilters,
  readLegacySnapshot,
  TRAINING_KEY,
  validateTrainingDocument,
  validateSavedFilters,
} from './trainingModel'
import type {
  LegacyDatePolicy,
  LegacySnapshot,
  SavedFilters,
  TrainingBackup,
  TrainingDocument,
} from './trainingTypes'

export const recoveryTargets = {
  workouts: { key: 'ZLDKSJF', label: 'Workouts' },
  tags: { key: 'TAGSlksajdf', label: 'Tags' },
  filters: { key: 'PersistendFilterakj', label: 'Saved filters' },
} as const
export type RecoveryTarget = keyof typeof recoveryTargets
export const legacyTargets = Object.keys(recoveryTargets) as RecoveryTarget[]

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export function validateTrainingBackup(value: unknown): TrainingBackup {
  if (!isObject(value) || value.format !== 'progressive-overload' || value.version !== 2) {
    throw new Error('Choose a complete version 2 JSON backup, or stage all three old files below. CSV is not a restorable backup.')
  }
  if (typeof value.exportedAt !== 'string' || !Number.isFinite(Date.parse(value.exportedAt))) {
    throw new Error('The backup must include a valid exportedAt timestamp.')
  }
  return {
    format: 'progressive-overload', version: 2, exportedAt: value.exportedAt,
    training: validateTrainingDocument(value.training),
    filters: validateSavedFilters(value.filters),
  }
}

export function makeTrainingBackup(training: TrainingDocument, filters: SavedFilters): TrainingBackup {
  return {
    format: 'progressive-overload', version: 2,
    exportedAt: new Date().toISOString(),
    training: validateTrainingDocument(training), filters: validateSavedFilters(filters),
  }
}

export type RecoveryDestination = {
  revision: number | null
  training: TrainingDocument | null
  trainingExists: boolean
  filtersExist: boolean
  filters: unknown
  legacy: LegacySnapshot
}

// Read-only snapshot. The provider remains the sole training write owner.
export async function readRecoveryDestination(): Promise<RecoveryDestination> {
  const keys = await localforage.keys()
  const trainingExists = keys.includes(TRAINING_KEY)
  const filtersExist = keys.includes(FILTERS_KEY)
  const training = trainingExists
    ? validateTrainingDocument(await localforage.getItem(TRAINING_KEY)) : null
  return {
    revision: training?.revision ?? null, training, trainingExists, filtersExist,
    filters: filtersExist ? await localforage.getItem(FILTERS_KEY) : null,
    legacy: await readLegacySnapshot(),
  }
}

export async function assertRecoveryDestination(expected: RecoveryDestination): Promise<void> {
  const current = await readRecoveryDestination()
  if (JSON.stringify(current) !== JSON.stringify(expected)) {
    throw new Error('The destination changed after preview. Nothing was written by this attempt. Cancel and preview again, then back up the new destination.')
  }
}

export type RecoveryPreview = {
  training: TrainingDocument
  filters: SavedFilters
  source: unknown
  sourceLabel: string
  policy?: LegacyDatePolicy
  destination: RecoveryDestination
  localSource?: LegacySnapshot
}

export async function previewLegacy(
  snapshot: LegacySnapshot,
  policy: LegacyDatePolicy,
  sourceLabel: string,
  localSource = false
): Promise<RecoveryPreview> {
  // Convert exactly once: reviewed IDs are the ones passed to replaceDocument.
  const training = convertLegacy(snapshot, policy)
  const filters = legacySavedFilters(snapshot)
  return {
    training, filters, source: snapshot, sourceLabel, policy,
    destination: await readRecoveryDestination(),
    ...(localSource ? { localSource: snapshot } : {}),
  }
}

export type LegacyStage = Record<RecoveryTarget, { file?: File; absent: boolean }>
export async function readLegacyStage(stage: LegacyStage): Promise<LegacySnapshot> {
  const snapshot: LegacySnapshot = { keys: [], workouts: undefined, tags: undefined, filters: undefined }
  for (const target of legacyTargets) {
    const item = stage[target]
    if (item.absent) continue
    if (!item.file) throw new Error(`Choose the old ${recoveryTargets[target].label.toLowerCase()} JSON file, or explicitly mark it not stored in the original app.`)
    try {
      snapshot[target] = JSON.parse(await item.file.text()) as unknown
    } catch {
      throw new Error(`Could not read ${item.file.name} as JSON. Keep the original file unchanged.`)
    }
    snapshot.keys.push(recoveryTargets[target].key)
  }
  if (snapshot.keys.length === 0) throw new Error('This staged set contains no stored items. Choose at least one original JSON file.')
  return snapshot
}

export function recoveryError(cause: unknown): string {
  return cause instanceof Error ? cause.message : 'Recovery outcome could not be verified. Keep the source and destination backups and inspect storage before retrying.'
}
