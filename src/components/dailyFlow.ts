import { localDate } from '../libs/trainingModel'
import type { Exercise, TrainingEntry } from '../libs/trainingTypes'

export const normalizedName = (name: string) => name.trim().toLocaleLowerCase()

export function matchingExercises(exercises: Exercise[], name: string) {
  const matches = exercises.filter(
    (exercise) => normalizedName(exercise.name) === normalizedName(name)
  )
  const exact = matches.find((exercise) => exercise.name === name)
  return exact ? [exact] : matches
}

export function newestFirst(a: TrainingEntry, b: TrainingEntry) {
  const time = (entry: TrainingEntry) => {
    const parsed = Date.parse(entry.recordedAt ?? entry.performedAt ?? '')
    return Number.isFinite(parsed) ? parsed : 0
  }
  return (
    b.trainingDate.localeCompare(a.trainingDate) ||
    time(b) - time(a) ||
    a.id.localeCompare(b.id)
  )
}

// Keep imported precision and arbitrary unit labels intact. lb is only a UI label.
export const unitLabel = (unit: string) => (unit === 'lbs' ? 'lb' : unit)

// "Other" work is counted, not weighed: a qty value is a whole number.
export const QTY_UNIT = 'qty'
export const CHOOSABLE_UNITS = ['kg', 'lbs', QTY_UNIT] as const
export type ChoosableUnit = (typeof CHOOSABLE_UNITS)[number]
export const isChoosableUnit = (unit: unknown): unit is ChoosableUnit =>
  CHOOSABLE_UNITS.includes(unit as ChoosableUnit)

// Parse a typed load. Returns null for anything that is not a usable value.
export function parseLoad(text: string, unit: string) {
  const trimmed = text.trim()
  const pattern = unit === QTY_UNIT ? /^\d+$/ : /^(\d+\.?\d*|\.\d+)$/
  if (!pattern.test(trimmed)) return null
  const value = Number(trimmed)
  return Number.isFinite(value) ? value : null
}

export const loadLabel = (weight: number, unit: string) =>
  `${weight} ${unitLabel(unit)}`

export function dateLabel(value: string, weekday = false) {
  if (!weekday && value === localDate()) return 'Today'
  const date = new Date(`${value}T12:00:00`)
  return date.toLocaleDateString('en-GB', {
    ...(weekday ? { weekday: 'short' as const } : {}),
    day: 'numeric',
    month: 'short',
    ...(date.getFullYear() !== new Date().getFullYear()
      ? { year: 'numeric' as const }
      : {}),
  })
}

export function withTypedTag(
  tags: string[],
  knownTags: string[],
  value: string
) {
  const typed = value.trim().toLocaleLowerCase()
  if (!typed) return tags
  const tag =
    [...tags, ...knownTags].find(
      (item) => item.toLocaleLowerCase() === typed
    ) ?? typed
  return tags.includes(tag) ? tags : [...tags, tag]
}
