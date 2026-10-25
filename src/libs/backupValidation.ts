export const recoveryTargets = {
  workouts: { key: 'ZLDKSJF', label: 'Workouts' },
  tags: { key: 'TAGSlksajdf', label: 'Tags' },
  filters: { key: 'PersistendFilterakj', label: 'Saved filters' },
} as const

export type RecoveryTarget = keyof typeof recoveryTargets

type JsonObject = Record<string, unknown>
const isObject = (value: unknown): value is JsonObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

// Check the legacy fields consumed by the app, without normalizing dates,
// adding absent notes, or removing fields unknown to this version.
export function validateBackup(target: RecoveryTarget, value: unknown): string {
  if (!isObject(value)) {
    throw new Error(
      'Expected a JSON object exported by Settings, not a list or empty value.'
    )
  }

  if (target === 'workouts') {
    if (!Array.isArray(value.lifts)) {
      throw new Error('Workouts must contain a "lifts" list.')
    }
    value.lifts.forEach((lift: unknown, index: number) => {
      const prefix = `Workout ${index + 1}`
      if (!isObject(lift)) throw new Error(`${prefix} must be an object.`)
      for (const field of ['name', 'date', 'uom']) {
        if (typeof lift[field] !== 'string') {
          throw new Error(`${prefix}: "${field}" must be text.`)
        }
      }
      for (const field of ['weight', 'rep', 'set']) {
        if (typeof lift[field] !== 'number' || !Number.isFinite(lift[field])) {
          throw new Error(`${prefix}: "${field}" must be a finite number.`)
        }
      }
      if (
        lift.comment !== undefined &&
        lift.comment !== null &&
        typeof lift.comment !== 'string'
      ) {
        throw new Error(`${prefix}: optional "comment" must be text or null.`)
      }
    })
    return `${value.lifts.length} workout records`
  }

  if (!Array.isArray(value.tags)) {
    throw new Error(
      `${recoveryTargets[target].label} must contain a "tags" list.`
    )
  }
  if (target === 'filters') {
    if (
      typeof value.term !== 'string' ||
      !value.tags.every((tag: unknown) => typeof tag === 'string')
    ) {
      throw new Error(
        'Saved filters need a text "term" and a list of tag names (text).'
      )
    }
    return `Search: ${JSON.stringify(value.term)}; ${value.tags.length} selected tags`
  }

  value.tags.forEach((tag: unknown, index: number) => {
    if (
      !isObject(tag) ||
      typeof tag.name !== 'string' ||
      typeof tag.liftName !== 'string'
    ) {
      throw new Error(
        `Tag ${index + 1} needs text "name" and "liftName" fields.`
      )
    }
  })
  return `${value.tags.length} tag associations`
}

export function identifyBackup(value: unknown): RecoveryTarget {
  if (
    isObject(value) &&
    typeof value.term === 'string' &&
    Array.isArray(value.tags) &&
    value.tags.every((tag: unknown) => typeof tag === 'string')
  ) {
    return 'filters'
  }
  const matches = (Object.keys(recoveryTargets) as RecoveryTarget[]).filter(
    (target) => {
      try {
        validateBackup(target, value)
        return true
      } catch {
        return false
      }
    }
  )
  if (matches.length !== 1) {
    throw new Error(
      'Cannot identify this backup safely. Choose Workouts, Tags, or Saved filters, then preview again to see validation details.'
    )
  }
  return matches[0]
}
