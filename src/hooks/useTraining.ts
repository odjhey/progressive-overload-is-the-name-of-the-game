import { createContext, useContext } from 'react'
import type { EntryInput, LegacySnapshot, TrainingDocument, TrainingEntry } from '../libs/trainingTypes'

export type TrainingContextValue = {
  document: TrainingDocument | null
  storedRevision: number | null
  legacy: LegacySnapshot | null
  loading: boolean
  saving: boolean
  loadError: Error | undefined
  error: Error | undefined
  saveEntry: (input: EntryInput, originalId?: string) => Promise<TrainingEntry>
  deleteEntry: (id: string) => Promise<void>
  renameExercise: (id: string, name: string) => Promise<void>
  setExerciseTags: (id: string, tags: string[]) => Promise<void>
  setAttendance: (date: string, confirmed: boolean, notes?: string) => Promise<void>
  replaceDocument: (next: TrainingDocument, expectedRevision: number | null) => Promise<void>
  reload: () => Promise<void>
}

export const TrainingContext = createContext<TrainingContextValue | null>(null)

export function useTraining(): TrainingContextValue {
  const context = useContext(TrainingContext)
  if (!context) throw new Error('useTraining must be used inside TrainingProvider.')
  return context
}
