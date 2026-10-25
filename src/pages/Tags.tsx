import { useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTraining } from '../hooks/useTraining'
import type { Exercise } from '../libs/trainingTypes'

export default function Tags() {
  const { document, loading, loadError } = useTraining()
  const [params] = useSearchParams()
  const selectedId = params.get('exercise')
  const date = params.get('date')
  const view = params.get('view') === 'history' ? 'history' : 'latest'
  const selected = params.get('selected')
  const back = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? `/calendar?${new URLSearchParams({ date, month: date.slice(0, 7) })}` : `/?${new URLSearchParams({ view, ...(selected ? { selected } : {}) })}`
  if (loading) return <p role="status">Loading exercises…</p>
  if (loadError) return <p role="alert">Exercises could not be read: {loadError.message}</p>
  if (!document) return <p role="alert">Import or recover training in Settings before changing exercises.</p>
  const ordered = [...document.exercises].sort((a, b) => Number(b.id === selectedId) - Number(a.id === selectedId) || a.name.localeCompare(b.name))
  return (
    <div className="tags-page training-page">
      <Link className="back-link" to={back}>← Back to {date ? 'calendar' : 'workouts'}</Link>
      <header className="page-heading"><h1>Exercises &amp; tags</h1><p className="muted">Rename an exercise here to keep all its history and tags together. Editing the exercise on a single entry moves only that entry.</p></header>
      {selectedId !== null && !document.exercises.some((exercise) => exercise.id === selectedId) && <p role="alert">The requested exercise was not found. Choose an existing exercise below.</p>}
      {ordered.length === 0 && <p>No exercises yet. <Link className="back-link" to="/new">Save a training entry</Link> to create one.</p>}
      <div className="tag-groups">{ordered.map((exercise) => <ExerciseEditor key={exercise.id} exercise={exercise} selected={exercise.id === selectedId} count={document.entries.filter((entry) => entry.exerciseId === exercise.id).length} />)}</div>
    </div>
  )
}

function ExerciseEditor({ exercise, count, selected }: { exercise: Exercise; count: number; selected: boolean }) {
  const { renameExercise, setExerciseTags, saving } = useTraining()
  const [name, setName] = useState(exercise.name)
  const [tag, setTag] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const inFlight = useRef(false)
  const busy = pending || saving
  const mutate = async (action: () => Promise<void>, success: string, clearTag = false) => {
    if (inFlight.current) return
    inFlight.current = true
    setPending(true)
    setError('')
    setStatus('')
    try {
      await action()
      if (clearTag) setTag('')
      setStatus(success)
    } catch (cause) {
      setError(`Change could not be confirmed: ${cause instanceof Error ? cause.message : String(cause)} Your typed values are still here.`)
    } finally {
      inFlight.current = false
      setPending(false)
    }
  }
  return (
    <section className={`exercise-editor${selected ? ' is-selected' : ''}`} aria-labelledby={`exercise-${exercise.id}`}>
      <h2 id={`exercise-${exercise.id}`}>{exercise.name}</h2>
      <p className="muted">{count === 0 ? 'No saved entries — exercise and tags retained' : `${count} saved ${count === 1 ? 'entry' : 'entries'}`}{selected ? ' · Selected exercise' : ''}</p>
      {error && <p role="alert">{error}</p>}{status && <p role="status">{status}</p>}
      <details className="exercise-rename"><summary>Rename exercise</summary>
        <form aria-busy={busy} onSubmit={(event) => { event.preventDefault(); void mutate(() => renameExercise(exercise.id, name), 'Exercise renamed. Its history and tags are unchanged.') }}>
          <fieldset className="training-actions" disabled={busy}><legend className="sr-only">Rename {exercise.name}</legend><label className="field-label" htmlFor={`rename-${exercise.id}`}><span>Exercise name</span><input id={`rename-${exercise.id}`} className="input input-bordered" required value={name} onChange={(event) => setName(event.target.value)} /></label><button className="btn btn-outline" type="submit" disabled={name === exercise.name}>Rename all history</button></fieldset>
        </form>
      </details>
      {exercise.tags.length > 0 ? <ul className="exercise-tags" aria-label={`Tags for ${exercise.name}`}>{exercise.tags.map((value) => <li key={value}><span>{value}</span><button className="btn btn-outline" type="button" disabled={busy} aria-label={`Remove ${value} tag from ${exercise.name}`} onClick={() => {
        if (confirm(`Remove "${value}" from "${exercise.name}"?`)) void mutate(() => setExerciseTags(exercise.id, exercise.tags.filter((item) => item !== value)), `Removed ${value}.`)
      }}>Remove</button></li>)}</ul> : <p className="muted">No tags</p>}
      <form aria-busy={busy} onSubmit={(event) => {
        event.preventDefault()
        if (!tag.trim()) { setError('Enter a non-empty tag.'); return }
        if (exercise.tags.includes(tag)) { setError('This exercise already has that exact tag.'); return }
        void mutate(() => setExerciseTags(exercise.id, [...exercise.tags, tag]), `Added ${tag}.`, true)
      }}><fieldset className="training-actions" disabled={busy}><legend className="sr-only">Add tag to {exercise.name}</legend><label className="field-label" htmlFor={`tag-${exercise.id}`}><span>New tag</span><input id={`tag-${exercise.id}`} className="input input-bordered" required value={tag} onChange={(event) => setTag(event.target.value)} /></label><button className="btn btn-primary" type="submit">Add tag</button></fieldset></form>
    </section>
  )
}
