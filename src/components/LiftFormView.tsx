import { PropsWithChildren } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { defaultStringifySearch } from '../libs/searchParams'

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

export const LiftFormView = ({ lift }: { lift: FormValues['lift'] }) => {
  const {
    register,
    setFocus,
    formState: { errors },
  } = useForm<FormValues>({
    mode: 'onBlur',
    values: { lift },
  })

  const navigate = useNavigate()

  const TAB_FIELD_COUNT = 6
  const index = 0

  return (
    <div>
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

          <div className="flex">
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
            </LabeledFieldLayout>
          </div>
        </section>
      </div>

      <button
        className="btn btn-accent btn-xs"
        type="button"
        onClick={() => {
          navigate({
            pathname: '/new',
            search: `${defaultStringifySearch({
              lift: {
                name: lift.name,
                date: new Date().toISOString().substring(0, 16),
                rep: lift.rep,
                set: lift.set,
                weight: lift.weight,
                uom: lift.uom,
              },
            })}`,
          })
        }}
      >
        copy
      </button>

      <div className="bg-slate-100 p-2"></div>
    </div>
  )
}
