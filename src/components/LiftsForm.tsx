import { useFieldArray, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { defaultStringifySearch } from '../libs/searchParams'
import type { Lift } from '../hooks/useLifts'
import { Tag } from '../hooks/useTags'
import { IconEdit, IconCopy } from '@tabler/icons-react'

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
                <div className="card card-compact">
                  <div className="card-body">
                    <span className="card-title flex justify-between">
                      {field.name}{' '}
                      <span className="text-sm text-slate-500">
                        {field.date}
                      </span>
                    </span>
                    <div className="flex gap-3">
                      <div>
                        <span className="font-bold">{field.weight}</span>{' '}
                        <span>{field.uom}</span>
                      </div>
                      <div>
                        <span className="font-bold">{field.set}</span>{' '}
                        <span className="text-slate-500">sets x </span>
                        <span className="font-bold">{field.rep}</span>{' '}
                        <span className="text-slate-500">reps</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {tags
                        .filter((t) => t.liftName === field.name)
                        .map((t) => {
                          return (
                            <span className="badge badge-info">{t.name}</span>
                          )
                        })}
                    </div>
                    <div className="card-actions justify-between">
                      <IconEdit
                        type="button"
                        onClick={() => {
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
                              },
                            })}`,
                          })
                        }}
                      ></IconEdit>
                      <IconCopy
                        type="button"
                        onClick={() => {
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
                              },
                            })}`,
                          })
                        }}
                      >
                        copy
                      </IconCopy>
                    </div>
                  </div>
                </div>
                <div className="divider">
                  <span className="text-slate-300">oOo</span>
                </div>
              </section>
            </div>
          )
        })}
      </form>
    </div>
  )
}
