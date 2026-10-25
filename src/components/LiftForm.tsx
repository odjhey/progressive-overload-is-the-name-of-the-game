import { PropsWithChildren, ReactNode, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Lift } from '../hooks/useLifts'

type FormValues = { lift: Lift }

const LabeledFieldLayout = ({
  children,
  controls,
}: PropsWithChildren<{ controls: ReactNode }>) => (
  <div className="flex gap-1 border border-solid flex-wrap justify-between">
    <div className="flex flex-wrap gap-1 items-center min-w-0">{children}</div>
    <div className="flex gap-1 flex-wrap">{controls}</div>
  </div>
)

export const LiftForm = ({
  lift,
  onSubmit,
  onDelete,
  onSaveAndTag,
  onDirtyChange,
  title = 'New',
  saving = false,
  disabled = false,
}: {
  title?: string
  lift: Lift
  onSubmit: (lift: Lift) => Promise<void>
  onDelete?: () => Promise<void>
  onSaveAndTag: (lift: Lift) => Promise<void>
  onDirtyChange: (dirty: boolean) => void
  saving?: boolean
  disabled?: boolean
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isDirty },
    getValues,
  } = useForm<FormValues>({
    mode: 'onBlur',
    defaultValues: { lift },
  })
  const busy = saving || isSubmitting
  useEffect(() => {
    onDirtyChange(isDirty)
  }, [isDirty, onDirtyChange])

  return (
    <div>
      <h1 className="text text-lg font-bold">{title} workout</h1>
      {title === 'Copy' && (
        <p>
          Save a separate session. Choose a distinct date and time for this
          lift.
        </p>
      )}
      {title === 'Edit' && (
        <p>
          Editing only this session. Changing its name does not rename other
          workouts or move name-based tags.
        </p>
      )}
      <form
        aria-busy={busy}
        onSubmit={handleSubmit((data, event) => {
          const submitter = (event?.nativeEvent as SubmitEvent | undefined)
            ?.submitter
          return submitter instanceof HTMLButtonElement &&
            submitter.value === 'tags'
            ? onSaveAndTag(data.lift)
            : onSubmit(data.lift)
        })}
      >
        <fieldset disabled={disabled || busy}>
          <legend className="sr-only">Workout details</legend>
          <section className="flex flex-col gap-5 p-1">
            <LabeledFieldLayout controls={null}>
              <label className="label text-slate-400" htmlFor="lift-date">
                Date and time (UTC)
              </label>
              <input
                id="lift-date"
                {...register('lift.date', { required: true })}
                required
                aria-invalid={!!errors.lift?.date}
                type="datetime-local"
                className="max-w-full"
              />
            </LabeledFieldLayout>

            <label className="flex flex-col gap-1" htmlFor="lift-name">
              <span>Lift name</span>
              <input
                id="lift-name"
                placeholder="Lift name"
                {...register('lift.name', { required: true })}
                required
                aria-invalid={!!errors.lift?.name}
                className="input input-bordered w-full"
              />
            </label>

            <LabeledFieldLayout
              controls={
                <>
                  {[5, 1].map((amount) => (
                    <button
                      type="button"
                      key={amount}
                      className="btn"
                      aria-label={`Add ${amount} to weight`}
                      onClick={() =>
                        setValue(
                          'lift.weight',
                          Math.round(
                            (Number(getValues('lift.weight')) + amount) * 100
                          ) / 100,
                          { shouldDirty: true }
                        )
                      }
                    >
                      +{amount}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="btn"
                    aria-label="Reset weight to zero"
                    onClick={() =>
                      setValue('lift.weight', 0, { shouldDirty: true })
                    }
                  >
                    0
                  </button>
                </>
              }
            >
              <label className="label text-slate-400" htmlFor="lift-weight">
                Weight
              </label>
              <input
                id="lift-weight"
                type="number"
                inputMode="decimal"
                step={0.01}
                {...register('lift.weight', {
                  valueAsNumber: true,
                  required: true,
                })}
                required
                aria-invalid={!!errors.lift?.weight}
                className="w-24"
              />
            </LabeledFieldLayout>

            <LabeledFieldLayout
              controls={['lbs', 'kg'].map((unit) => (
                <button
                  type="button"
                  key={unit}
                  className="btn"
                  aria-label={`Set unit to ${unit}`}
                  onClick={() =>
                    setValue('lift.uom', unit, { shouldDirty: true })
                  }
                >
                  {unit}
                </button>
              ))}
            >
              <label className="label text-slate-400" htmlFor="lift-uom">
                Unit
              </label>
              <input
                id="lift-uom"
                {...register('lift.uom', { required: true })}
                required
                aria-invalid={!!errors.lift?.uom}
                className="w-16"
              />
            </LabeledFieldLayout>

            <LabeledFieldLayout
              controls={[6, 8, 10, 12].map((reps) => (
                <button
                  type="button"
                  key={reps}
                  className="btn"
                  aria-label={`Set reps to ${reps}`}
                  onClick={() =>
                    setValue('lift.rep', reps, { shouldDirty: true })
                  }
                >
                  {reps}
                </button>
              ))}
            >
              <label className="label text-slate-400" htmlFor="lift-rep">
                Reps
              </label>
              <input
                id="lift-rep"
                type="number"
                {...register('lift.rep', {
                  valueAsNumber: true,
                  required: true,
                })}
                required
                aria-invalid={!!errors.lift?.rep}
                className="w-16"
              />
            </LabeledFieldLayout>

            <LabeledFieldLayout
              controls={[3, 4].map((sets) => (
                <button
                  type="button"
                  key={sets}
                  className="btn"
                  aria-label={`Set sets to ${sets}`}
                  onClick={() =>
                    setValue('lift.set', sets, { shouldDirty: true })
                  }
                >
                  {sets}
                </button>
              ))}
            >
              <label className="label text-slate-400" htmlFor="lift-set">
                Sets
              </label>
              <input
                id="lift-set"
                type="number"
                {...register('lift.set', {
                  valueAsNumber: true,
                  required: true,
                })}
                required
                aria-invalid={!!errors.lift?.set}
                className="w-16"
              />
            </LabeledFieldLayout>

            <label className="flex flex-col gap-1" htmlFor="lift-comment">
              <span>Notes (optional)</span>
              <textarea
                id="lift-comment"
                {...register('lift.comment')}
                className="textarea textarea-bordered w-full"
              />
            </label>
          </section>
          {Object.keys(errors).length > 0 && (
            <p role="alert">
              Complete all required workout fields before saving.
            </p>
          )}
          <div className="bg-slate-100 p-2"></div>
          <div className="flex flex-wrap gap-2 justify-center p-5 pb-10">
            <button className="btn btn-primary" type="submit" value="save">
              {busy
                ? 'Saving...'
                : title === 'Edit'
                  ? 'Save changes'
                  : 'Save workout'}
            </button>
            <button
              className="btn btn-info"
              type="submit"
              name="action"
              value="tags"
            >
              Save and tag
            </button>
            {onDelete && (
              <button
                className="btn btn-error"
                type="button"
                onClick={() => {
                  if (
                    confirm('Delete this saved workout? This cannot be undone.')
                  ) {
                    void onDelete()
                  }
                }}
              >
                Delete workout
              </button>
            )}
          </div>
        </fieldset>
      </form>
    </div>
  )
}
