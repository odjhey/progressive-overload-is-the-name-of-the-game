import { Fragment } from 'react'
import { IconNotes, IconPencil, IconRepeat } from '@tabler/icons-react'
import { Link, useLocation } from 'react-router-dom'
import type { Exercise, TrainingEntry } from '../libs/trainingTypes'
import { dateLabel, loadLabel } from './dailyFlow'

export function LiftRow({
  entry,
  exercise,
  calendar = false,
  history = false,
  highlighted = false,
}: {
  entry: TrainingEntry
  exercise: Exercise
  calendar?: boolean
  history?: boolean
  highlighted?: boolean
}) {
  const location = useLocation()
  const context: Record<string, string> = calendar
    ? { date: entry.trainingDate }
    : {}
  const state = { backgroundLocation: location }
  const edit = `/new?${new URLSearchParams({ edit: entry.id, ...context })}`
  const first = entry.groups[0]
  return (
    <article
      className={`row${highlighted ? ' saved' : ''}`}
      data-entry-id={entry.id}
    >
      <Link
        className="main"
        to={history ? edit : `/exercise/${encodeURIComponent(exercise.id)}`}
        state={history ? state : undefined}
      >
        <span className="name">
          {history ? dateLabel(entry.trainingDate, true) : exercise.name}
        </span>
        <span className={`stat${history || calendar ? ' all-groups' : ''}`}>
          {(history || calendar ? entry.groups : [first]).map(
            (group, index) => (
              <Fragment key={group.id}>
                {index > 0 && <span aria-hidden="true">|</span>}
                <b>{loadLabel(group.weight, group.unit)}</b>
                <span>
                  {group.sets} × {group.reps}
                </span>
              </Fragment>
            )
          )}
          {!history && !calendar && entry.groups.length > 1 && (
            <span
              className="more"
              aria-label={`${entry.groups.length} set groups`}
            >
              +{entry.groups.length - 1}
            </span>
          )}
          {history && entry.notes && (
            <IconNotes size={16} role="img" aria-label="Has notes" />
          )}
          {!history && (
            <time className="d" dateTime={entry.trainingDate}>
              {dateLabel(entry.trainingDate)}
            </time>
          )}
        </span>
      </Link>
      {!history && (
        <Link
          className="ib ib-36 ghost"
          aria-label={`Edit ${exercise.name} from ${entry.trainingDate}`}
          to={edit}
          state={state}
        >
          <IconPencil size={20} aria-hidden="true" />
        </Link>
      )}
      <Link
        className="ib y"
        aria-label={`Repeat ${exercise.name} from ${entry.trainingDate}`}
        to={`/new?${new URLSearchParams({ repeat: entry.id, ...context })}`}
        state={state}
      >
        <IconRepeat size={20} aria-hidden="true" />
      </Link>
    </article>
  )
}
