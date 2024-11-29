import { PropsWithChildren, ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { Lift } from '../hooks/useLifts'

type FormValues = {
  lift: {
    date: string
    name: string
    weight: number
    uom: string
    set: number
    rep: number
    comment: string
    difficulty: number
  }
}

const LabeledFieldLayout = ({
  children,
  controls,
}: PropsWithChildren<{ controls: ReactNode }>) => {
  return (
    <div className="flex gap-1 border border-solid flex-wrap justify-between">
      <div className="flex gap-1">{children}</div>
      <div className="flex gap-1">{controls}</div>
    </div>
  )
}

export const LiftForm = ({
  lift,
  onSubmit,
  onDelete,
  goToTag,
  title = 'New',
}: {
  title: string
  lift: FormValues['lift']
  onSubmit: (d: Lift) => Promise<unknown>
  onDelete: (keys: Pick<Lift, 'name' | 'date'>) => Promise<unknown>
  goToTag?: (keys: Pick<Lift, 'name'>) => void
}) => {
  const {
    register,
    handleSubmit,
    setFocus,
    setValue,
    formState: { errors },
    getValues,
  } = useForm<FormValues>({
    mode: 'onBlur',
    values: { lift },
  })

  const onSubmitForm = (data: FormValues) => {
    onSubmit({
      ...data.lift,
      difficulty: data.lift.difficulty || 1,
    })
  }

  const TAB_FIELD_COUNT = 6
  const index = 0

  return (
    <div>
      <div className="text text-lg font-bold">{title}</div>
      <form onSubmit={handleSubmit(onSubmitForm)}>
        <div key={lift.name}>
          <section className="flex flex-col gap-5 p-1" key={lift.date}>
            <LabeledFieldLayout controls={<></>}>
              <label className="label text-slate-400" htmlFor={`lift.date`}>
                UTC
              </label>
              <input
                tabIndex={1 + index * TAB_FIELD_COUNT}
                {...register(`lift.date` as const, {
                  required: true,
                })}
                className={errors?.lift?.date ? 'error' : ''}
                type="datetime-local"
              />
            </LabeledFieldLayout>

            <input
              onKeyUp={(e) => {
                if (e.key === 'Enter') {
                  setFocus(`lift.weight`)
                }
              }}
              tabIndex={2 + index * TAB_FIELD_COUNT}
              placeholder="name"
              {...register(`lift.name` as const, {
                required: true,
              })}
              className={`input input-bordered ${
                errors?.lift?.name ? 'error' : ''
              }`}
            />

            <LabeledFieldLayout
              controls={
                <>
                  {['+5', '+1'].map((v) => (
                    <button
                      type="button"
                      key={v}
                      className="btn"
                      onClick={() => {
                        const bias =
                          v.charAt(0) === '+'
                            ? Number(v.substring(1)) * 1
                            : Number(v.substring(1)) * -1
                        setValue('lift.weight', getValues('lift.weight') + bias)
                      }}
                    >
                      {v}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="btn "
                    onClick={() => {
                      setValue('lift.weight', 0)
                    }}
                  >
                    0
                  </button>
                </>
              }
            >
              <div className="flex gap-1">
                <label className="label text-slate-400" htmlFor={`lift.weight`}>
                  weight
                </label>
                <input
                  onKeyUp={(e) => {
                    if (e.key === 'Enter') {
                      setFocus(`lift.rep`)
                    }
                  }}
                  tabIndex={3 + index * TAB_FIELD_COUNT}
                  placeholder="weight"
                  type="number"
                  step={0.25}
                  {...register(`lift.weight` as const, {
                    valueAsNumber: true,
                    required: true,
                  })}
                  className={errors?.lift?.weight ? 'error' : 'w-16'}
                />
              </div>
            </LabeledFieldLayout>

            <LabeledFieldLayout
              controls={
                <>
                  {['lbs', 'kg'].map((v) => (
                    <button
                      type="button"
                      key={v}
                      className="btn "
                      onClick={() => {
                        setValue('lift.uom', v)
                      }}
                    >
                      {v}
                    </button>
                  ))}
                </>
              }
            >
              <label className="label text-slate-400" htmlFor={`lift.uom`}>
                uom
              </label>
              <input
                onKeyUp={(e) => {
                  if (e.key === 'Enter') {
                    setFocus(`lift.rep`)
                  }
                }}
                placeholder="uom"
                {...register(`lift.uom` as const, {
                  required: true,
                })}
                className={errors?.lift?.uom ? 'error' : 'w-16'}
              />
            </LabeledFieldLayout>

            <LabeledFieldLayout
              controls={
                <>
                  {[6, 8, 10, 12].map((v) => (
                    <button
                      type="button"
                      key={v}
                      className="btn "
                      onClick={() => setValue('lift.rep', v)}
                    >
                      {v}
                    </button>
                  ))}
                </>
              }
            >
              <label className="label text-slate-400" htmlFor={`lift.rep`}>
                rep
              </label>
              <input
                onKeyUp={(e) => {
                  if (e.key === 'Enter') {
                    setFocus(`lift.set`)
                  }
                }}
                tabIndex={4 + index * TAB_FIELD_COUNT}
                placeholder="rep"
                type="number"
                {...register(`lift.rep` as const, {
                  valueAsNumber: true,
                  required: true,
                })}
                className={errors?.lift?.rep ? 'error' : 'w-12'}
              />
            </LabeledFieldLayout>

            <LabeledFieldLayout
              controls={
                <>
                  {[3, 4].map((v) => (
                    <button
                      type="button"
                      key={v}
                      className="btn "
                      onClick={() => setValue('lift.set', v)}
                    >
                      {v}
                    </button>
                  ))}
                </>
              }
            >
              <label className="label text-slate-400" htmlFor={`lift.set`}>
                set
              </label>
              <input
                onKeyUp={(e) => {
                  if (e.key === 'Enter') {
                    // TODO set focus to submit
                  }
                }}
                tabIndex={5 + index * TAB_FIELD_COUNT}
                placeholder="set"
                type="number"
                {...register(`lift.set` as const, {
                  valueAsNumber: true,
                  required: true,
                })}
                className={errors?.lift?.set ? 'error' : 'w-12'}
              />
            </LabeledFieldLayout>
            <textarea
              onKeyUp={(e) => {
                if (e.key === 'Enter') {
                  setFocus(`lift.difficulty`)
                }
              }}
              tabIndex={6 + index * TAB_FIELD_COUNT}
              placeholder="notes"
              {...register(`lift.comment` as const, {
                required: false,
              })}
              className={`input w-full ${errors?.lift?.comment ? 'error' : ''}`}
            />
            
            <input
              onKeyUp={(e) => {
                if (e.key === 'Enter') {
                  // TODO set focus to submit
                }
              }}
              tabIndex={7 + index * TAB_FIELD_COUNT}
              placeholder="difficulty"
              type="number"
              min="1"
              max="5"
              {...register(`lift.difficulty` as const, {
                valueAsNumber: true,
                required: true,
              })}
              className={errors?.lift?.difficulty ? 'error' : 'w-12'}
            />
          </section>
          <div className="bg-slate-100 p-2"></div>
        </div>

        <div className="flex gap-1 justify-center p-5 pb-10">
          <input className="btn btn-primary " type="submit" />
          <button
            className="btn btn-info"
            type="button"
            onClick={() => {
              if (typeof goToTag === 'function') {
                goToTag({ name: lift.name })
              }
            }}
          >
            tag
          </button>
          <button
            className="btn btn-error "
            type="button"
            onClick={() => {
              if (confirm('Are you sure you want to delete?')) {
                onDelete(lift)
              }
            }}
          >
            x
          </button>
        </div>
      </form>
    </div>
  )
}
