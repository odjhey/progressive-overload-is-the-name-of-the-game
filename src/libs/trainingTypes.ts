export type Metadata = Record<string, unknown>

export type Exercise = {
  id: string
  name: string
  tags: string[]
  metadata?: Metadata
}

export type SetGroup = {
  id: string
  sets: number
  reps: number
  weight: number
  unit: string
  metadata?: Metadata
}

export type TrainingEntry = {
  id: string
  exerciseId: string
  trainingDate: string
  performedAt?: string
  recordedAt: string | null
  groups: SetGroup[]
  notes: string
  workoutId?: string
  metadata?: Metadata
}

export type Workout = {
  id: string
  trainingDate: string
  recordedAt: string | null
  notes: string
  attendanceConfirmed: boolean
  metadata?: Metadata
}

export type TrainingDocument = {
  version: 2
  revision: number
  exercises: Exercise[]
  entries: TrainingEntry[]
  workouts: Workout[]
  metadata?: Metadata
}

export type EntryInput = {
  id: string
  exerciseId?: string
  exerciseName: string
  trainingDate: string
  performedAt?: string
  groups: SetGroup[]
  notes: string
  workoutId?: string
}

export type SavedFilters = {
  term: string
  tags: string[]
}

export type LegacySnapshot = {
  keys: string[]
  workouts: unknown
  tags: unknown
  filters: unknown
}

export type LegacyDatePolicy = 'written' | 'local'

export type TrainingBackup = {
  format: 'progressive-overload'
  version: 2
  exportedAt: string
  training: TrainingDocument
  filters: SavedFilters
}
