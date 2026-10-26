import {
  IconCalendar,
  IconChevronDown,
  IconHash,
  IconMinus,
  IconNotes,
  IconPencil,
  IconPlus,
  IconTrash,
  IconX,
} from '@tabler/icons-react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { newId } from '../libs/trainingModel'
import type {
  EntryInput,
  Exercise,
  SetGroup,
  TrainingEntry,
} from '../libs/trainingTypes'
import { usePreferences } from '../hooks/usePreferences'
import {
  dateLabel,
  loadLabel,
  matchingExercises,
  newestFirst,
  unitLabel,
  withTypedTag,
} from './dailyFlow'
import { StepButton } from './StepButton'
import { TagPicker } from './TagPicker'

export function LiftForm({
  initial,
  exercises,
  entries,
  source,
  editing,
  saving,
  error,
  confirmation,
  onSubmit,
  onDelete,
  onClose,
  onEditReference,
  onExerciseRecognized,
  onDirtyChange,
}: {
  initial: EntryInput
  exercises: Exercise[]
  entries: TrainingEntry[]
  source?: TrainingEntry
  editing: boolean
  saving: boolean
  error: string
  confirmation: ReactNode
  onSubmit: (input: EntryInput, tags: string[]) => Promise<void>
  onDelete?: () => Promise<void>
  onClose: () => void
  onEditReference: (id: string) => void
  onExerciseRecognized: () => void
  onDirtyChange: (dirty: boolean) => void
}) {
  const preferences = usePreferences()
  const [draft, setDraft] = useState(initial)
  const [reference, setReference] = useState(source)
  const [tags, setTags] = useState(
    () =>
      exercises.find((exercise) => exercise.id === initial.exerciseId)?.tags ??
      []
  )
  const [tagDraft, setTagDraft] = useState('')
  const [baseline] = useState(() =>
    JSON.stringify({
      draft: initial,
      tags:
        exercises.find((exercise) => exercise.id === initial.exerciseId)
          ?.tags ?? [],
    })
  )
  const [openGroup, setOpenGroup] = useState(initial.groups[0].id)
  const [notesOpen, setNotesOpen] = useState(editing && !!initial.notes)
  const [tagsOpen, setTagsOpen] = useState(editing && tags.length > 0)
  const [deleting, setDeleting] = useState(false)
  const keep = useRef<HTMLButtonElement>(null)
  const closeControl = useRef<HTMLButtonElement>(null)
  const busy = saving || deleting
  const knownTags = exercises.flatMap((exercise) => exercise.tags)
  useLayoutEffect(
    () =>
      onDirtyChange(
        !!tagDraft.trim() || JSON.stringify({ draft, tags }) !== baseline
      ),
    [draft, tags, tagDraft, baseline, onDirtyChange]
  )
  useEffect(() => {
    if (deleting) keep.current?.focus()
  }, [deleting])
  const updateGroup = (id: string, update: (group: SetGroup) => SetGroup) =>
    setDraft((current) => ({
      ...current,
      groups: current.groups.map((group) =>
        group.id === id ? update(group) : group
      ),
    }))
  const recognize = (value: string) => {
    const matches = matchingExercises(exercises, value)
    if (value.trim() && matches.length === 1) {
      const exercise = matches[0]
      const last = entries
        .filter((entry) => entry.exerciseId === exercise.id)
        .sort(newestFirst)[0]
      const groups = last
        ? last.groups.map((group) => ({ ...group, id: newId() }))
        : draft.groups
      setDraft((current) => ({
        ...current,
        exerciseName: exercise.name,
        exerciseId: exercise.id,
        groups,
        notes: '',
      }))
      setOpenGroup(groups[0].id)
      setReference(last)
      setTags(exercise.tags)
      onExerciseRecognized()
      closeControl.current?.focus()
    } else
      setDraft((current) => ({
        ...current,
        exerciseName: value,
        exerciseId: undefined,
      }))
  }
  return (
    <form
      className="entry-form"
      data-draft-id={initial.id}
      aria-busy={saving}
      onSubmit={(event) => {
        event.preventDefault()
        if (!busy && draft.exerciseName.trim())
          void onSubmit(draft, withTypedTag(tags, knownTags, tagDraft))
      }}
    >
      <div className="sh-h">
        {editing || draft.exerciseId ? (
          <h2>{draft.exerciseName}</h2>
        ) : (
          <input
            className="field"
            id="entry-name"
            aria-label="Exercise name"
            placeholder="Exercise name"
            value={draft.exerciseName}
            disabled={busy}
            onChange={(event) =>
              setDraft({ ...draft, exerciseName: event.target.value })
            }
            onBlur={(event) => recognize(event.target.value)}
            onKeyDown={(event) => {
              if (
                event.key === 'Enter' &&
                matchingExercises(exercises, draft.exerciseName).length === 1
              ) {
                event.preventDefault()
                recognize(draft.exerciseName)
              }
            }}
          />
        )}
        {onDelete && (
          <button
            type="button"
            className={`ib ib-36 ghost danger${deleting ? ' on' : ''}`}
            aria-label="Delete entry"
            disabled={saving}
            onClick={() => setDeleting(!deleting)}
          >
            <IconTrash size={20} aria-hidden="true" />
          </button>
        )}
        <button
          ref={closeControl}
          type="button"
          className="ib ib-36 ghost"
          aria-label="Close"
          disabled={saving}
          onClick={onClose}
        >
          <IconX size={20} aria-hidden="true" />
        </button>
      </div>
      <div className="sub">
        {editing ? (
          <span className="chip on">EDIT</span>
        ) : (
          <span>{draft.exerciseId ? 'New entry' : 'New exercise'}</span>
        )}
        <label className="chip date date-control">
          <IconCalendar size={16} aria-hidden="true" />
          {dateLabel(draft.trainingDate)}
          <IconChevronDown size={14} aria-hidden="true" />
          <input
            type="date"
            aria-label="Training date"
            required
            value={draft.trainingDate}
            disabled={busy}
            onChange={(event) => {
              if (event.target.value)
                setDraft({ ...draft, trainingDate: event.target.value })
            }}
          />
        </label>
      </div>
      <div className="entry-scroll">
        {!editing && reference && (
          <div
            className="last"
            data-source-id={reference.id}
            aria-label="Repeat source, read only"
          >
            <span className="lbl">Last</span>
            <b>
              {loadLabel(reference.groups[0].weight, reference.groups[0].unit)}
            </b>
            <span>
              {reference.groups[0].sets} × {reference.groups[0].reps}
            </span>
            {reference.groups.length > 1 && (
              <span className="more">+{reference.groups.length - 1}</span>
            )}
            <time dateTime={reference.trainingDate}>
              {dateLabel(reference.trainingDate, true)}
            </time>
            {reference.notes && (
              <IconNotes
                size={16}
                role="img"
                aria-label="Source has notes; new notes start blank"
              />
            )}
            <button
              className="ib ib-36 ghost"
              type="button"
              aria-label="Edit source entry"
              disabled={saving}
              onClick={() => onEditReference(reference.id)}
            >
              <IconPencil size={18} aria-hidden="true" />
            </button>
          </div>
        )}
        <fieldset disabled={busy}>
          <legend className="sr-only">Entry values</legend>
          {draft.groups.map((group, index) =>
            group.id !== openGroup ? (
              <button
                type="button"
                className="grow"
                data-group-id={group.id}
                key={group.id}
                aria-label={`Open group ${index + 1}`}
                onClick={() => setOpenGroup(group.id)}
              >
                <span className="k">{index + 1}</span>
                <b>{loadLabel(group.weight, group.unit)}</b>
                <span>
                  {group.sets} × {group.reps}
                </span>
                <IconChevronDown size={18} aria-hidden="true" />
              </button>
            ) : (
              <section
                className="grp"
                data-group-id={group.id}
                key={group.id}
                aria-label={`Set group ${index + 1}`}
              >
                <div className="hd">
                  {draft.groups.length > 1 && (
                    <span className="k">{index + 1}</span>
                  )}
                  <span className="lbl">Weight</span>
                  <div
                    className="seg sm"
                    role="group"
                    aria-label={`Group ${index + 1} unit`}
                  >
                    {group.unit !== 'kg' && group.unit !== 'lbs' && (
                      <button type="button" className="on" aria-pressed="true">
                        {group.unit}
                      </button>
                    )}
                    {(['kg', 'lbs'] as const).map((unit) => (
                      <button
                        key={unit}
                        type="button"
                        className={group.unit === unit ? 'on' : ''}
                        aria-pressed={group.unit === unit}
                        onClick={() =>
                          updateGroup(group.id, (current) => ({
                            ...current,
                            unit,
                          }))
                        }
                      >
                        {unitLabel(unit)}
                      </button>
                    ))}
                  </div>
                  {index > 0 && (
                    <button
                      type="button"
                      className="ib ib-36 ghost"
                      aria-label={`Remove group ${index + 1}`}
                      onClick={() => {
                        setDraft({
                          ...draft,
                          groups: draft.groups.filter(
                            (item) => item.id !== group.id
                          ),
                        })
                        setOpenGroup(draft.groups[index - 1].id)
                      }}
                    >
                      <IconX size={18} aria-hidden="true" />
                    </button>
                  )}
                </div>
                <output
                  className="wnum"
                  aria-live="polite"
                  aria-label={`Group ${index + 1} weight`}
                >
                  {group.weight}
                  <small>{unitLabel(group.unit)}</small>
                </output>
                <div className="steps">
                  {[
                    [-4, -2, -1],
                    [1, 2, 4],
                  ].map((multipliers, side) => (
                    <div className={`half${side ? ' up' : ''}`} key={side}>
                      {multipliers.map((multiplier) => {
                        const delta = multiplier * preferences.weightStep
                        return (
                          <StepButton
                            key={multiplier}
                            disabled={busy}
                            aria-label={`${delta < 0 ? 'Minus' : 'Plus'} ${Math.abs(delta)} weight`}
                            onStep={() =>
                              updateGroup(group.id, (current) => {
                                const weight = Math.max(
                                  0,
                                  current.weight + delta
                                )
                                return Number.isFinite(weight)
                                  ? { ...current, weight }
                                  : current
                              })
                            }
                          >
                            {delta < 0 ? '−' : '+'}
                            {Math.abs(delta)}
                          </StepButton>
                        )
                      })}
                    </div>
                  ))}
                </div>
                <div className="counter-grid">
                  {(['sets', 'reps'] as const).map((field) => (
                    <div key={field}>
                      <span className="lbl">
                        {field === 'sets' ? 'Sets' : 'Reps'}
                      </span>
                      <div className="step">
                        <StepButton
                          className="ib"
                          disabled={busy}
                          aria-label={`One ${field === 'sets' ? 'set' : 'rep'} fewer`}
                          onStep={() =>
                            updateGroup(group.id, (current) => ({
                              ...current,
                              [field]: Math.max(1, current[field] - 1),
                            }))
                          }
                        >
                          <IconMinus size={20} aria-hidden="true" />
                        </StepButton>
                        <output
                          className="v"
                          aria-live="polite"
                          aria-label={`Group ${index + 1} ${field}`}
                        >
                          {group[field]}
                        </output>
                        <StepButton
                          className="ib plus"
                          disabled={busy}
                          aria-label={`One ${field === 'sets' ? 'set' : 'rep'} more`}
                          onStep={() =>
                            updateGroup(group.id, (current) =>
                              Number.isFinite(current[field] + 1)
                                ? { ...current, [field]: current[field] + 1 }
                                : current
                            )
                          }
                        >
                          <IconPlus size={20} aria-hidden="true" />
                        </StepButton>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="entry-tools">
                  <button
                    type="button"
                    className="btn sm ghost"
                    onClick={() => {
                      const added = { ...group, id: newId() }
                      setDraft({ ...draft, groups: [...draft.groups, added] })
                      setOpenGroup(added.id)
                    }}
                  >
                    <IconPlus size={16} aria-hidden="true" />
                    Group
                  </button>
                  <button
                    type="button"
                    className={`ib ib-36 ghost${notesOpen ? ' on' : ''}`}
                    aria-label="Notes"
                    aria-expanded={notesOpen}
                    onClick={() => setNotesOpen(!notesOpen)}
                  >
                    <IconNotes size={20} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className={`ib ib-36 ghost${tagsOpen ? ' on' : ''}`}
                    aria-label="Tags"
                    aria-expanded={tagsOpen}
                    onClick={() => setTagsOpen(!tagsOpen)}
                  >
                    <IconHash size={20} aria-hidden="true" />
                  </button>
                </div>
                {notesOpen && (
                  <textarea
                    className="field"
                    aria-label="Entry notes"
                    value={draft.notes}
                    onChange={(event) =>
                      setDraft({ ...draft, notes: event.target.value })
                    }
                  />
                )}
                {tagsOpen && (
                  <TagPicker
                    tags={tags}
                    knownTags={knownTags}
                    value={tagDraft}
                    onValueChange={setTagDraft}
                    disabled={busy}
                    onChange={(values) => {
                      setTags(values)
                      return true
                    }}
                  />
                )}
              </section>
            )
          )}
        </fieldset>
        {preferences.error && (
          <p className="form-error" role="alert">
            Preferences could not be read or saved: {preferences.error}
          </p>
        )}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
      </div>
      {confirmation}
      {deleting && source ? (
        <section
          className="confirm"
          role="alertdialog"
          aria-label="Delete this entry?"
          aria-describedby="delete-description"
        >
          <p id="delete-description">
            <b>Delete this entry?</b>
            {initial.exerciseName}, {dateLabel(source.trainingDate, true)}:{' '}
            {source.groups
              .map(
                (group) =>
                  `${loadLabel(group.weight, group.unit)}, ${group.sets} × ${group.reps}`
              )
              .join(' | ')}
            . Its notes go too. This cannot be undone. Other entries and
            attendance marks on this day stay.
          </p>
          <div className="counter-grid">
            <button
              ref={keep}
              type="button"
              className="btn lg"
              disabled={saving}
              onClick={() => setDeleting(false)}
            >
              Keep
            </button>
            <button
              type="button"
              className="btn danger fill lg"
              disabled={saving}
              onClick={() => {
                void onDelete?.()
              }}
            >
              Delete
            </button>
          </div>
        </section>
      ) : (
        <div className="entry-save">
          <button
            type="submit"
            className="btn y lg"
            disabled={saving || !draft.exerciseName.trim()}
          >
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Save'}
          </button>
        </div>
      )}
    </form>
  )
}
