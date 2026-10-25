import { IconPencil, IconRepeat } from '@tabler/icons-react'
import { Link } from 'react-router-dom'
import type { Exercise, TrainingEntry } from '../libs/trainingTypes'

export const LiftRow = ({
  entry,
  exercise,
  view = 'history',
  calendar = false,
  reference = false,
}: {
  entry: TrainingEntry
  exercise: Exercise
  view?: 'latest' | 'history'
  calendar?: boolean
  reference?: boolean
}) => {
  const context: Record<string, string> = calendar
    ? { date: entry.trainingDate }
    : { view }
  return (
    <article className="lift-card">
      <header className="lift-card-heading">
        <h2>{exercise.name}</h2>
        {!reference && (
          <div className="lift-card-actions">
            <Link
              className="btn btn-primary icon-action"
              aria-label={`Repeat ${exercise.name} from ${entry.trainingDate}`}
              title={`Repeat ${exercise.name} from ${entry.trainingDate}`}
              to={`/new?${new URLSearchParams({ repeat: entry.id, ...context })}`}
            >
              <IconRepeat size={20} aria-hidden="true" />
            </Link>
            <Link
              className="btn btn-outline icon-action"
              aria-label={`Edit ${exercise.name} from ${entry.trainingDate}`}
              title={`Edit ${exercise.name} from ${entry.trainingDate}`}
              to={`/new?${new URLSearchParams({ edit: entry.id, ...context })}`}
            >
              <IconPencil size={20} aria-hidden="true" />
            </Link>
          </div>
        )}
      </header>
      <div className="lift-card-effort">
        <ul className="training-groups" aria-label="Recorded set groups">
          {entry.groups.map((group) => (
            <li key={group.id}>
              <strong>
                {group.weight} {group.unit}
              </strong>
              <span>
                {group.sets} × {group.reps}{' '}
                <span className="muted">sets × reps</span>
              </span>
            </li>
          ))}
        </ul>
        <Link
          className="date-action"
          to={`/calendar?${new URLSearchParams({ date: entry.trainingDate, month: entry.trainingDate.slice(0, 7) })}`}
        >
          <time dateTime={entry.trainingDate}>{entry.trainingDate}</time>
        </Link>
      </div>
      {entry.notes && (
        <details className="previous-notes">
          <summary>{reference ? 'Source notes' : 'Notes'}</summary>
          <p className="lift-notes">{entry.notes}</p>
        </details>
      )}
      {exercise.tags.length > 0 && (
        <ul className="lift-tags" aria-label="Exercise tags">
          {exercise.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      )}
    </article>
  )
}
