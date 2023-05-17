import { PropsWithChildren } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { defaultStringifySearch } from '../libs/searchParams'
import type { Lift } from '../hooks/useLifts'
import { Tag } from '../hooks/useTags'

type FormValues = {
  lifts: Lift[]
}

const LabeledFieldLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="flex gap-1 border border-solid border-red-100">
      {children}
    </div>
  )
}

export const LiftsForm = ({
  lifts,
  onSubmit,
  filterFn,
  selectedKey,
  tags,
}: {
  lifts: unknown[]
  onSubmit: (d: unknown[]) => Promise<unknown>
  filterFn: (row: unknown) => boolean
  selectedKey?: string
  tags: Tag[]
}) => {
  const navigate = useNavigate()
  const {
    register,
    control,
    handleSubmit,
    setFocus,
    formState: { errors },
  } = useForm<FormValues>({
    mode: 'onBlur',
    values: { lifts: lifts as Lift[] },
  })

  const { fields } = useFieldArray({
    name: 'lifts',
    control,
  })

  const onSubmitForm = (data: FormValues) => {
    onSubmit(data.lifts)
  }

  const TAB_FIELD_COUNT = 6

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmitForm)}>
        {fields.map((field, index) => {
          return (
            <div
              key={field.id}
              className={`${filterFn(field) ? '' : 'hidden'}`}
            >
              <section
                className={`flex flex-wrap gap-1 p-1 ${
                  selectedKey === field.date
                    ? 'border-secondary border-solid border-2'
                    : ''
                }`}
                key={field.id}
              >
                <input
                  tabIndex={1 + index * TAB_FIELD_COUNT}
                  {...register(`lifts.${index}.date` as const, {
                    required: true,
                    disabled: true,
                  })}
                  className={errors?.lifts?.[index]?.date ? 'error' : ''}
                  type="datetime-local"
                />

                <div className="flex flex-wrap flex-row">
                  <LabeledFieldLayout>
                    <label
                      className="label text-xs text-slate-400"
                      htmlFor={`lifts.${index}.name`}
                    >
                      name
                    </label>
                    <input
                      onKeyUp={(e) => {
                        if (e.key === 'Enter') {
                          setFocus(`lifts.${index}.weight`)
                        }
                      }}
                      tabIndex={2 + index * TAB_FIELD_COUNT}
                      placeholder="name"
                      {...register(`lifts.${index}.name` as const, {
                        required: true,
                        disabled: true,
                      })}
                      className={errors?.lifts?.[index]?.name ? 'error' : ''}
                    />
                  </LabeledFieldLayout>

                  <LabeledFieldLayout>
                    <label
                      className="label text-xs text-slate-400"
                      htmlFor={`lifts.${index}.weight`}
                    >
                      weight
                    </label>
                    <input
                      onKeyUp={(e) => {
                        if (e.key === 'Enter') {
                          setFocus(`lifts.${index}.rep`)
                        }
                      }}
                      tabIndex={3 + index * TAB_FIELD_COUNT}
                      placeholder="weight"
                      type="number"
                      {...register(`lifts.${index}.weight` as const, {
                        valueAsNumber: true,
                        required: true,
                        disabled: true,
                      })}
                      className={
                        errors?.lifts?.[index]?.weight ? 'error' : 'w-16'
                      }
                    />
                  </LabeledFieldLayout>

                  <LabeledFieldLayout>
                    <label
                      className="label text-xs text-slate-400"
                      htmlFor={`lifts.${index}.uom`}
                    >
                      uom
                    </label>
                    <input
                      onKeyUp={(e) => {
                        if (e.key === 'Enter') {
                          setFocus(`lifts.${index}.rep`)
                        }
                      }}
                      tabIndex={4 + index * TAB_FIELD_COUNT}
                      placeholder="uom"
                      {...register(`lifts.${index}.uom` as const, {
                        required: true,
                        disabled: true,
                      })}
                      className={
                        errors?.lifts?.[index]?.name ? 'error' : 'w-16'
                      }
                    />
                  </LabeledFieldLayout>

                  <LabeledFieldLayout>
                    <label
                      className="label text-xs text-slate-400"
                      htmlFor={`lifts.${index}.rep`}
                    >
                      rep
                    </label>
                    <input
                      onKeyUp={(e) => {
                        if (e.key === 'Enter') {
                          setFocus(`lifts.${index}.set`)
                        }
                      }}
                      tabIndex={5 + index * TAB_FIELD_COUNT}
                      placeholder="rep"
                      type="number"
                      {...register(`lifts.${index}.rep` as const, {
                        valueAsNumber: true,
                        required: true,
                        disabled: true,
                      })}
                      className={errors?.lifts?.[index]?.rep ? 'error' : 'w-12'}
                    />
                  </LabeledFieldLayout>

                  <LabeledFieldLayout>
                    <label
                      className="label text-xs text-slate-400"
                      htmlFor={`lifts.${index}.set`}
                    >
                      set
                    </label>
                    <input
                      onKeyUp={(e) => {
                        if (e.key === 'Enter') {
                          // TODO set focus to submit
                        }
                      }}
                      tabIndex={6 + index * TAB_FIELD_COUNT}
                      placeholder="set"
                      type="number"
                      {...register(`lifts.${index}.set` as const, {
                        valueAsNumber: true,
                        required: true,
                        disabled: true,
                      })}
                      className={errors?.lifts?.[index]?.set ? 'error' : 'w-12'}
                    />
                  </LabeledFieldLayout>
                </div>

                {tags
                  .filter((t) => t.liftName === field.name)
                  .map((t) => {
                    return <span className="badge badge-info">{t.name}</span>
                  })}

                <button
                  className="btn btn-accent btn-xs"
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
                </button>
                <button
                  className="btn btn-accent btn-xs"
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
                >
                  edit
                </button>
              </section>
              <div className="bg-slate-100 p-2"></div>
            </div>
          )
        })}
      </form>
    </div>
  )
}
