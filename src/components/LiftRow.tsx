import { IconEdit, IconCopy } from '@tabler/icons-react'
import type { Lift } from '../hooks/useLifts'
import dayjs from 'dayjs'

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
  const dateLabel = (
    <>
      {dayjs(Date.now()).diff(dayjs(lift.date), 'day')}
      {'d - '}
      {new Date(lift.date).toLocaleDateString()}
    </>
  )
  return (
    <div className="card card-compact">
      <div className="card-body">
        <span className="card-title text-sm flex flex-wrap gap-1 justify-between break-words">
          {lift.name}{' '}
          {actions.onDateClick ? (
            <button
              type="button"
              className="btn btn-ghost btn-sm text-xs"
              aria-label={`Filter by date of ${lift.name}: ${new Date(lift.date).toLocaleDateString()}`}
              onClick={() => {
                const offset = new Date().getTimezoneOffset()
                actions.onDateClick?.(
                  new Date(new Date(lift.date).getTime() - offset * 60 * 1000)
                    .toISOString()
                    .split('T')[0]
                )
              }}
            >
              {dateLabel}
            </button>
          ) : (
            <span className="text-xs text-slate-500">{dateLabel}</span>
          )}
        </span>
        <div className="flex flex-wrap gap-3">
          <div>
            <span className="font-bold">{lift.weight}</span>{' '}
            <span>{lift.uom}</span>
          </div>
          <div>
            <span className="font-bold">{lift.set}</span>{' '}
            <span className="text-slate-500">sets x </span>
            <span className="font-bold">{lift.rep}</span>{' '}
            <span className="text-slate-500">reps</span>
          </div>
          {lift.comment && (
            <div className="min-w-0 break-words">
              <span>{lift.comment}</span>
            </div>
          )}
        </div>
        <div className="card-actions justify-between">
          <button
            type="button"
            className="btn btn-sm"
            aria-label={`Edit ${lift.name} from ${lift.date}`}
            onClick={actions.edit}
          >
            <IconEdit size={16} aria-hidden="true" />
            Edit
          </button>
          {lift.tags && lift.tags.length > 0 && (
            <div className="flex gap-1">
              {lift.tags.map((n) => {
                return (
                  <span key={n} className="badge badge-sm badge-info">
                    {n}
                  </span>
                )
              })}
            </div>
          )}
          <button
            type="button"
            className="btn btn-sm"
            aria-label={`Copy ${lift.name} from ${lift.date}`}
            onClick={actions.copy}
          >
            <IconCopy size={20} aria-hidden="true" />
            Copy
          </button>
        </div>
      </div>
    </div>
  )
}
