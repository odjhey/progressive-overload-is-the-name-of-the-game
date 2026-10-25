import { IconEdit, IconRepeat } from '@tabler/icons-react'
import type { Lift } from '../hooks/useLifts'

export const LiftRow = ({
  lift,
  actions,
}: {
  lift: Lift & { tags?: string[] }
  actions: {
    copy: () => void
    edit: () => void
    onDateClick?: (date: string) => void
  }
}) => {
  const dateLabel = new Date(lift.date).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  return (
    <article className="lift-card">
      <header className="lift-card-heading">
        <h2>{lift.name}</h2>
        {actions.onDateClick ? (
          <button
            type="button"
            className="date-action"
            aria-label={`Filter by date of ${lift.name}: ${dateLabel}`}
            onClick={() => {
              const offset = new Date().getTimezoneOffset()
              actions.onDateClick?.(
                new Date(new Date(lift.date).getTime() - offset * 60 * 1000)
                  .toISOString()
                  .split('T')[0]
              )
            }}
          >
            <time dateTime={lift.date}>{dateLabel}</time>
          </button>
        ) : (
          <time className="lift-date" dateTime={lift.date}>
            {dateLabel}
          </time>
        )}
      </header>
      <dl className="effort-numbers">
        <div className="effort-weight">
          <dt className="sr-only">Weight</dt>
          <dd>
            {lift.weight} <span>{lift.uom}</span>
          </dd>
        </div>
        <div className="effort-reps">
          <dt>Sets × reps</dt>
          <dd>
            {lift.set} × {lift.rep}
          </dd>
        </div>
      </dl>
      {lift.comment && <p className="lift-notes">{lift.comment}</p>}
      {lift.tags && lift.tags.length > 0 && (
        <ul className="lift-tags" aria-label="Tags">
          {lift.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      )}
      <footer className="lift-card-actions">
        <button
          type="button"
          className="btn btn-primary repeat-action"
          aria-label={`Repeat ${lift.name} from ${lift.date}`}
          onClick={actions.copy}
        >
          <IconRepeat size={20} aria-hidden="true" />
          Repeat
        </button>
        <button
          type="button"
          className="btn btn-outline"
          aria-label={`Edit ${lift.name} from ${lift.date}`}
          onClick={actions.edit}
        >
          <IconEdit size={18} aria-hidden="true" />
          Edit
        </button>
      </footer>
    </article>
  )
}
