import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Lift } from '../hooks/useLifts'

type FormValues = { lift: Lift }

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
    <form
      className="lift-form"
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
        <section className="session-effort" aria-labelledby="session-heading">
          <h2 id="session-heading">This session</h2>
          <label className="field-label" htmlFor="lift-name">
            <span>Lift name</span>
            <input
              id="lift-name"
              placeholder="e.g. Back squat"
              {...register('lift.name', { required: true })}
              required
              aria-invalid={!!errors.lift?.name}
              className="input input-bordered w-full"
            />
          </label>
          <div className="number-field weight-field">
            <label className="field-label" htmlFor="lift-weight">
              <span>Weight</span>
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
                className="input input-bordered effort-input"
              />
            </label>
            <div
              className="number-shortcuts"
              role="group"
              aria-label="Adjust weight"
            >
              {[5, 1].map((amount) => (
                <button
                  type="button"
                  key={amount}
                  className="btn btn-outline"
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
                className="btn btn-outline"
                aria-label="Reset weight to zero"
                onClick={() =>
                  setValue('lift.weight', 0, { shouldDirty: true })
                }
              >
                0
              </button>
            </div>
          </div>
          <div className="number-field">
            <label className="field-label" htmlFor="lift-set">
              <span>Sets</span>
              <input
                id="lift-set"
                type="number"
                inputMode="numeric"
                {...register('lift.set', {
                  valueAsNumber: true,
                  required: true,
                })}
                required
                aria-invalid={!!errors.lift?.set}
                className="input input-bordered effort-input"
              />
            </label>
            <div
              className="number-shortcuts"
              role="group"
              aria-label="Choose sets"
            >
              {[3, 4].map((sets) => (
                <button
                  type="button"
                  key={sets}
                  className="btn btn-outline"
                  aria-label={`Set sets to ${sets}`}
                  onClick={() =>
                    setValue('lift.set', sets, { shouldDirty: true })
                  }
                >
                  {sets}
                </button>
              ))}
            </div>
          </div>
          <div className="number-field">
            <label className="field-label" htmlFor="lift-rep">
              <span>Reps per set</span>
              <input
                id="lift-rep"
                type="number"
                inputMode="numeric"
                {...register('lift.rep', {
                  valueAsNumber: true,
                  required: true,
                })}
                required
                aria-invalid={!!errors.lift?.rep}
                className="input input-bordered effort-input"
              />
            </label>
            <div
              className="number-shortcuts"
              role="group"
              aria-label="Choose reps"
            >
              {[6, 8, 10, 12].map((reps) => (
                <button
                  type="button"
                  key={reps}
                  className="btn btn-outline"
                  aria-label={`Set reps to ${reps}`}
                  onClick={() =>
                    setValue('lift.rep', reps, { shouldDirty: true })
                  }
                >
                  {reps}
                </button>
              ))}
            </div>
          </div>
        </section>
        <section
          className="session-details"
          aria-labelledby="session-details-heading"
        >
          <h2 id="session-details-heading">Session details</h2>
          <div className="unit-field">
            <label className="field-label" htmlFor="lift-uom">
              <span>Unit</span>
              <input
                id="lift-uom"
                {...register('lift.uom', { required: true })}
                required
                aria-invalid={!!errors.lift?.uom}
                className="input input-bordered w-full"
              />
            </label>
            <div
              className="number-shortcuts"
              role="group"
              aria-label="Common units"
            >
              {['lbs', 'kg'].map((unit) => (
                <button
                  type="button"
                  key={unit}
                  className="btn btn-outline"
                  aria-label={`Set unit to ${unit}`}
                  onClick={() =>
                    setValue('lift.uom', unit, { shouldDirty: true })
                  }
                >
                  {unit}
                </button>
              ))}
            </div>
          </div>
          <label className="field-label" htmlFor="lift-date">
            <span>Date and time (UTC)</span>
            <input
              id="lift-date"
              {...register('lift.date', { required: true })}
              required
              aria-invalid={!!errors.lift?.date}
              aria-describedby={
                title === 'Copy' ? 'repeat-date-hint' : undefined
              }
              type="datetime-local"
              className="input input-bordered w-full"
            />
          </label>
          {title === 'Copy' && (
            <p className="field-hint" id="repeat-date-hint">
              This is the new session date, not the previous effort. Choose a
              distinct date and time for this lift.
            </p>
          )}
          <label className="field-label" htmlFor="lift-comment">
            <span>
              Notes <span className="muted">(optional)</span>
            </span>
            <textarea
              id="lift-comment"
              {...register('lift.comment')}
              rows={2}
              className="textarea textarea-bordered w-full"
            />
          </label>
        </section>
        {Object.keys(errors).length > 0 && (
          <p role="alert">
            Complete all required workout fields before saving.
          </p>
        )}
        <div className="form-save-actions">
          <button className="btn btn-primary" type="submit" value="save">
            {busy
              ? 'Saving...'
              : title === 'Edit'
                ? 'Save changes'
                : 'Save workout'}
          </button>
          <button
            className="btn btn-outline"
            type="submit"
            name="action"
            value="tags"
          >
            Save and tag
          </button>
        </div>
        {onDelete && (
          <div className="delete-session">
            <p className="muted">Remove only this saved session.</p>
            <button
              className="btn btn-outline btn-error"
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
          </div>
        )}
      </fieldset>
    </form>
  )
}
