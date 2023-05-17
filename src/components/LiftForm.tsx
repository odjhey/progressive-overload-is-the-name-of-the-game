import { PropsWithChildren } from 'react'
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
  }
}

const LabeledFieldLayout = ({ children }: PropsWithChildren) => {
  return (
    <div className="flex gap-1 border border-solid border-red-100">
      {children}
    </div>
  )
}

export const LiftForm = ({
  lift,
  onSubmit,
}: {
  lift: FormValues['lift']
  onSubmit: (d: Lift) => Promise<unknown>
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
    onSubmit(data.lift)
  }

  const TAB_FIELD_COUNT = 6
  const index = 0

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmitForm)}>
        <div key={lift.name}>
          <section className="flex flex-col gap-1 p-1" key={lift.date}>
            <input
              tabIndex={1 + index * TAB_FIELD_COUNT}
              {...register(`lift.date` as const, {
                required: true,
              })}
              className={errors?.lift?.date ? 'error' : ''}
              type="datetime-local"
            />

            <LabeledFieldLayout>
              <label
                className="label text-xs text-slate-400"
                htmlFor={`lift.name`}
              >
                name
              </label>
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
                className={errors?.lift?.name ? 'error' : ''}
              />
            </LabeledFieldLayout>

            <LabeledFieldLayout>
              <label
                className="label text-xs text-slate-400"
                htmlFor={`lift.weight`}
              >
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
                {...register(`lift.weight` as const, {
                  valueAsNumber: true,
                  required: true,
                })}
                className={errors?.lift?.weight ? 'error' : 'w-20'}
              />
              {['+10', '+1', '-1', '-10'].map((v) => (
                <button
                  type="button"
                  key={v}
                  className="btn btn-sm"
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
            </LabeledFieldLayout>

            <LabeledFieldLayout>
              <label
                className="label text-xs text-slate-400"
                htmlFor={`lift.uom`}
              >
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

            <LabeledFieldLayout>
              <label
                className="label text-xs text-slate-400"
                htmlFor={`lift.rep`}
              >
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
              {[6, 8, 10, 12, 14].map((v) => (
                <button
                  type="button"
                  key={v}
                  className="btn btn-sm"
                  onClick={() => setValue('lift.rep', v)}
                >
                  {v}
                </button>
              ))}
            </LabeledFieldLayout>

            <LabeledFieldLayout>
              <label
                className="label text-xs text-slate-400"
                htmlFor={`lift.set`}
              >
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
              {[3, 4].map((v) => (
                <button
                  type="button"
                  key={v}
                  className="btn btn-sm"
                  onClick={() => setValue('lift.set', v)}
                >
                  {v}
                </button>
              ))}
            </LabeledFieldLayout>
          </section>
          <div className="bg-slate-100 p-2"></div>
        </div>

        <div className="flex gap-1 pb-10">
          <input className="btn btn-primary btn-sm" type="submit" />
        </div>
      </form>
    </div>
  )
}
