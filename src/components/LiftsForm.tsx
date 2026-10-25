import { useNavigate } from 'react-router-dom'
import { defaultStringifySearch } from '../libs/searchParams'
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

  return (
    <div>
      {lifts.map((lift) => (
        <section
          className={`border-secondary ${
            selectedKey === `${lift.name}\0${lift.date}`
              ? 'border-solid border-2'
              : ''
          } ${isWithinToday(toLocalDate(lift.date)) ? 'border-l-8' : ''}`}
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
                  search: defaultStringifySearch({ title: 'Edit', lift }),
                }),
              copy: () =>
                navigate({
                  pathname: '/new',
                  search: defaultStringifySearch({
                    title: 'Copy',
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
