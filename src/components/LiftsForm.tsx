import { useNavigate } from 'react-router-dom'
import { defaultStringifySearch } from '../libs/searchParams'
import { useUrlSearchParams } from '../hooks/useUrlSearchParams'
import type { Lift } from '../hooks/useLifts'
import { Tag } from '../hooks/useTags'
import { LiftRow } from './LiftRow'
import { isWithinToday, toLocalDate } from '../libs/date-tz-utils'

export const LiftsForm = ({
  lifts,
  selectedKey,
  tags,
  actions,
}: {
  lifts: Lift[]
  selectedKey?: string
  tags: Tag[]
  actions: {
    onDateClick: (date: string) => void
  }
}) => {
  const navigate = useNavigate()
  const [search] = useUrlSearchParams()
  const view = search.view === 'history' ? 'history' : 'latest'

  return (
    <div className="lift-list">
      {lifts.map((lift) => (
        <section
          className={`lift-entry ${
            selectedKey === `${lift.name}\0${lift.date}` ? 'is-saved' : ''
          } ${isWithinToday(toLocalDate(lift.date)) ? 'is-today' : ''}`}
          key={`${lift.name}\0${lift.date}`}
        >
          <LiftRow
            lift={{
              ...lift,
              tags: tags
                .filter((tag) => tag.liftName === lift.name)
                .map((tag) => tag.name),
            }}
            actions={{
              edit: () =>
                navigate({
                  pathname: '/new',
                  search: defaultStringifySearch({ title: 'Edit', lift, view }),
                }),
              copy: () =>
                navigate({
                  pathname: '/new',
                  search: defaultStringifySearch({
                    title: 'Copy',
                    view,
                    previousLift: lift,
                    lift: {
                      ...lift,
                      date: new Date().toISOString().substring(0, 16),
                    },
                  }),
                }),
              onDateClick: actions.onDateClick,
            }}
          />
        </section>
      ))}
    </div>
  )
}
