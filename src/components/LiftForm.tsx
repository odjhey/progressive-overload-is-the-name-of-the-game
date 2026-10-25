import { useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { newId } from '../libs/trainingModel'
import type { EntryInput, Exercise } from '../libs/trainingTypes'

export const LiftForm = ({
  initial,
  exercises,
  editing,
  saving,
  onSubmit,
  onDelete,
  onDirtyChange,
}: {
  initial: EntryInput
  exercises: Exercise[]
  editing: boolean
  saving: boolean
  onSubmit: (input: EntryInput, tag: boolean) => Promise<void>
  onDelete?: () => Promise<void>
  onDirtyChange: (dirty: boolean) => void
}) => {
  const { register, control, handleSubmit, setValue, getValues, formState: { errors, isDirty, isSubmitting } } = useForm<EntryInput>({ defaultValues: initial })
  const { fields, append, remove } = useFieldArray({ control, name: 'groups', keyName: 'fieldKey' })
  const busy = saving || isSubmitting
  useEffect(() => onDirtyChange(isDirty), [isDirty, onDirtyChange])

  return (
    <form className="lift-form training-form" aria-busy={busy} onSubmit={handleSubmit((input, event) => {
      const submitter = (event?.nativeEvent as SubmitEvent | undefined)?.submitter
      return onSubmit(input, submitter instanceof HTMLButtonElement && submitter.value === 'tags')
    })}>
      <fieldset disabled={busy}>
        <legend className="sr-only">Actual training details</legend>
        <div className="training-identity">
          <label className="field-label" htmlFor="entry-name">
            <span>Exercise</span>
            <input id="entry-name" className="input input-bordered" list="exercise-options" required {...register('exerciseName', { required: true, validate: (value) => value.trim().length > 0 })} aria-invalid={!!errors.exerciseName} />
          </label>
          <datalist id="exercise-options">{exercises.map((exercise) => <option key={exercise.id} value={exercise.name} />)}</datalist>
          <label className="field-label" htmlFor="entry-date">
            <span>Training date</span>
            <input id="entry-date" className="input input-bordered" type="date" required {...register('trainingDate', { required: true })} aria-invalid={!!errors.trainingDate} />
          </label>
        </div>
        <p className="field-hint">Choose when you trained. Saving records actual work, not a plan.</p>
        {editing && <p className="field-hint">Changing the exercise here moves only this entry. To rename its whole history, use Exercises &amp; tags.</p>}
        <div className="set-group-list">
          {fields.map((field, index) => (
            <fieldset className="set-group" key={field.fieldKey}>
              <legend>Group {index + 1}</legend>
              <div className="set-group-fields">
                <label className="field-label" htmlFor={`weight-${field.fieldKey}`}>
                  <span>Weight</span>
                  <input id={`weight-${field.fieldKey}`} className="input input-bordered" type="number" inputMode="decimal" step="any" required {...register(`groups.${index}.weight`, { required: true, valueAsNumber: true, validate: Number.isFinite })} aria-invalid={!!errors.groups?.[index]?.weight} />
                </label>
                <label className="field-label" htmlFor={`unit-${field.fieldKey}`}>
                  <span>Unit</span>
                  <input id={`unit-${field.fieldKey}`} className="input input-bordered" list="training-units" required {...register(`groups.${index}.unit`, { required: true, validate: (value) => value.trim().length > 0 })} aria-invalid={!!errors.groups?.[index]?.unit} />
                </label>
                <label className="field-label" htmlFor={`sets-${field.fieldKey}`}>
                  <span>Sets</span>
                  <input id={`sets-${field.fieldKey}`} className="input input-bordered" type="number" inputMode="numeric" min={Math.min(1, field.sets)} step={Number.isInteger(field.sets) ? 1 : 'any'} required {...register(`groups.${index}.sets`, { required: true, valueAsNumber: true, validate: Number.isFinite })} aria-invalid={!!errors.groups?.[index]?.sets} />
                </label>
                <label className="field-label" htmlFor={`reps-${field.fieldKey}`}>
                  <span>Reps per set</span>
                  <input id={`reps-${field.fieldKey}`} className="input input-bordered" type="number" inputMode="numeric" min={Math.min(1, field.reps)} step={Number.isInteger(field.reps) ? 1 : 'any'} required {...register(`groups.${index}.reps`, { required: true, valueAsNumber: true, validate: Number.isFinite })} aria-invalid={!!errors.groups?.[index]?.reps} />
                </label>
              </div>
              <div className="training-actions group-shortcuts">
                <button type="button" className="btn btn-outline" aria-label={`Add 1 to group ${index + 1} weight`} onClick={() => {
                  const weight = Number(getValues(`groups.${index}.weight`))
                  if (Number.isFinite(weight)) setValue(`groups.${index}.weight`, Math.round((weight + 1) * 100) / 100, { shouldDirty: true })
                }}>Weight +1</button>
                <button type="button" className="btn btn-outline" aria-label={`Set group ${index + 1} to 3 sets`} onClick={() => setValue(`groups.${index}.sets`, 3, { shouldDirty: true })}>3 sets</button>
                <button type="button" className="btn btn-outline" disabled={fields.length === 1} aria-label={`Remove group ${index + 1}`} onClick={() => remove(index)}>Remove</button>
              </div>
            </fieldset>
          ))}
        </div>
        <datalist id="training-units"><option value="lbs" /><option value="kg" /></datalist>
        <button type="button" className="btn btn-outline" onClick={() => {
          const previous = getValues('groups').at(-1)
          append({ id: newId(), sets: 3, reps: 8, weight: 0, unit: previous?.unit || 'lbs' })
        }}>+ Add set group</button>
        <label className="field-label training-notes" htmlFor="entry-notes">
          <span>Notes <span className="muted">(optional)</span></span>
          <textarea id="entry-notes" className="textarea textarea-bordered" rows={2} {...register('notes')} />
        </label>
        {Object.keys(errors).length > 0 && <p role="alert">Check the exercise, date and each set group. Values must be finite numbers; sets and reps must be at least 1 for new groups.</p>}
        <div className="form-save-actions">
          <button type="submit" className="btn btn-primary" value="save">{busy ? 'Saving…' : editing ? 'Save changes' : 'Save entry'}</button>
          <button type="submit" className="btn btn-outline" value="tags">Save and tag</button>
        </div>
        {onDelete && <div className="delete-session">
          <span className="muted">Delete only this saved entry.</span>
          <button type="button" className="btn btn-outline btn-error" onClick={() => {
            if (confirm('Delete this saved entry? This cannot be undone.')) void onDelete()
          }}>Delete entry</button>
        </div>}
      </fieldset>
    </form>
  )
}
