import { useFieldArray, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { defaultStringifySearch } from '../libs/searchParams'
import type { Lift } from '../hooks/useLifts'
import { Tag } from '../hooks/useTags'
import { LiftRow } from './LiftRow'

type FormValues = {
  lifts: Lift[]
}

export const LiftsForm = ({
  lifts,
  filterFn,
  selectedKey,
  tags,
}: {
  lifts: unknown[]
  filterFn: (row: unknown) => boolean
  selectedKey?: string
  tags: Tag[]
}) => {
  const navigate = useNavigate()
  const { control } = useForm<FormValues>({
    mode: 'onBlur',
    values: { lifts: lifts as Lift[] },
  })

  const { fields } = useFieldArray({
    name: 'lifts',
    control,
  })

  return (
    <div>
      <form>
        {fields.map((field, _index) => {
          return (
            <div
              key={field.id}
              className={`${filterFn(field) ? '' : 'hidden'}`}
            >
              <section
                className={`${
                  selectedKey === field.date
                    ? 'border-secondary border-solid border-2'
                    : ''
                }`}
                key={field.id}
              >
                <LiftRow
                  lift={{
                    ...field,
                    tags: [...tags]
                      .filter((t) => t.liftName === field.name)
                      .map((t) => t.name),
                  }}
                  actions={{
                    edit: () => {
                      navigate({
                        pathname: '/new',
                        search: `${defaultStringifySearch({
                          lift: {
                            name: field.name,
                            date: field.date,
                            rep: field.rep,
                            set: field.set,
                            weight: field.weight,
                            uom: field.uom,
                            comment: field.comment,
                          },
                        })}`,
                      })
                    },
                    copy: () => {
                      navigate({
                        pathname: '/new',
                        search: `${defaultStringifySearch({
                          lift: {
                            name: field.name,
                            date: new Date().toISOString().substring(0, 16),
                            rep: field.rep,
                            set: field.set,
                            weight: field.weight,
                            uom: field.uom,
                            comment: field.comment,
                          },
                        })}`,
                      })
                    },
                  }}
                ></LiftRow>
              </section>
            </div>
          )
        })}
      </form>
    </div>
  )
}
