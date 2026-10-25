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
        <Link
          className="date-action"
          to={`/calendar?${new URLSearchParams({ date: entry.trainingDate, month: entry.trainingDate.slice(0, 7) })}`}
        >
          <time dateTime={entry.trainingDate}>{entry.trainingDate}</time>
        </Link>
      </header>
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
      {!reference && (
        <footer className="lift-card-actions">
          <Link
            className="btn btn-primary"
            aria-label={`Repeat ${exercise.name} from ${entry.trainingDate}`}
            to={`/new?${new URLSearchParams({ repeat: entry.id, ...context })}`}
          >
            Repeat
          </Link>
          <Link
            className="btn btn-outline"
            aria-label={`Edit ${exercise.name} from ${entry.trainingDate}`}
            to={`/new?${new URLSearchParams({ edit: entry.id, ...context })}`}
          >
            Edit
          </Link>
        </footer>
      )}
    </article>
  )
}
