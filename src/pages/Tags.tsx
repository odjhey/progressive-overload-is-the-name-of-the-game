import { IconArrowLeft } from '@tabler/icons-react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { useTraining } from '../hooks/useTraining'

// Old bookmarks remain useful, but exercise history owns rename and tags now.
export default function Tags() {
  const { document, loading, loadError } = useTraining()
  const [params] = useSearchParams()
  const selected = params.get('exercise')
  if (selected)
    return (
      <Navigate
        replace
        to={`/exercise/${encodeURIComponent(selected)}?editor=tags`}
      />
    )
  return (
    <div className="page">
      <header className="top">
        <Link className="ib" to="/" aria-label="Back to log">
          <IconArrowLeft size={20} aria-hidden="true" />
        </Link>
        <h1>Exercises</h1>
      </header>
      <div className="list">
        {loading && <p role="status">Loading exercises…</p>}
        {loadError && (
          <p className="form-error" role="alert">
            Exercises could not be read: {loadError.message}
          </p>
        )}
        {!loading && !loadError && !document && (
          <p className="form-error" role="alert">
            Import or recover training in Settings before changing exercises.
          </p>
        )}
        {document &&
          [...document.exercises]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((exercise) => (
              <div className="row" key={exercise.id}>
                <Link
                  className="main"
                  to={`/exercise/${encodeURIComponent(exercise.id)}?editor=tags`}
                >
                  <span className="name">{exercise.name}</span>
                  <span className="stat">{exercise.tags.join(' · ')}</span>
                </Link>
              </div>
            ))}
        {document && document.exercises.length === 0 && (
          <p className="form-error">No exercises yet</p>
        )}
      </div>
    </div>
  )
}
