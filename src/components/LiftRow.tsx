import { IconEdit, IconCopy } from '@tabler/icons-react'

export const LiftRow = ({
  lift,
  actions,
}: {
  lift: {
    name: string
    date: string
    rep: number
    set: number
    weight: number
    uom: string
    tags: string[]
  }
  actions: {
    copy: () => void
    edit: () => void
  }
}) => {
  return (
    <div className="card card-compact">
      <div className="card-body">
        <span className="card-title text-sm flex justify-between">
          {lift.name}{' '}
          <span className="text-xs text-slate-500">
            {new Date(lift.date).toLocaleDateString()}
          </span>
        </span>
        <div className="flex gap-3">
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
        </div>
        <div className="card-actions justify-between">
          <IconEdit size={14} type="button" onClick={actions.edit}></IconEdit>
          <div className="flex gap-1">
            {lift.tags.map((n) => {
              return (
                <span key={n} className="badge badge-sm badge-info">
                  {n}
                </span>
              )
            })}
          </div>
          <IconCopy size={20} type="button" onClick={actions.copy}>
            copy
          </IconCopy>
        </div>
      </div>
    </div>
  )
}
