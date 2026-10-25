import { Lift, useLifts } from '../hooks/useLifts'
import { LiftForm } from '../components/LiftForm'
import { useLocation, useNavigate } from 'react-router-dom'
import { useUrlSearchParams } from '../hooks/useUrlSearchParams'
import { defaultStringifySearch } from '../libs/searchParams'

export default function New() {
  const [liftInSearch] = useUrlSearchParams()
  const { data, error, loadError, loading, saving, upsertLift, deleteLift } =
    useLifts()
  const navigate = useNavigate()
  const location = useLocation()

  if (loading) {
    return <div role="status">Loading workouts...</div>
  }
  if (loadError) {
    return (
      <div role="alert">
        Workouts could not be loaded: {loadError.message} Saving is unavailable
        until history can be read. Your stored history has not been replaced.
      </div>
    )
  }

  const supplied = liftInSearch.lift as Lift | undefined
  const title =
    supplied && liftInSearch.title === 'Edit'
      ? 'Edit'
      : supplied && liftInSearch.title === 'Copy'
        ? 'Copy'
        : 'New'
  const original =
    title === 'Edit' && supplied
      ? { name: supplied.name, date: supplied.date }
      : undefined
  const existing = original
    ? data.find(
        (lift) => lift.name === original.name && lift.date === original.date
      )
    : undefined
  const defaults = supplied ?? {
    date: new Date().toISOString().substring(0, 16),
    name: '',
    rep: 0,
    set: 0,
    uom: 'lbs',
    weight: 0,
    comment: '',
  }
  const missingOriginal = title === 'Edit' && !existing

  return (
    <>
      {error && (
        <p role="alert">
          Could not save this change: {error.message} Your form values are still
          here. Correct the problem and try again.
        </p>
      )}
      {missingOriginal && (
        <p role="alert">
          This workout is no longer in saved history. Return Home and choose an
          existing workout to edit.
        </p>
      )}
      <LiftForm
        key={location.key}
        title={title}
        lift={{ ...defaults, comment: defaults.comment ?? '' }}
        saving={saving}
        disabled={missingOriginal}
        onDelete={
          existing && original
            ? () => deleteLift(original, { onSuccess: () => navigate('/') })
            : undefined
        }
        onSubmit={(lift) =>
          upsertLift(lift, {
            original,
            onSuccess: (saved) =>
              navigate({
                pathname: '/',
                search: defaultStringifySearch({
                  selected: saved.date,
                  selectedName: saved.name,
                }),
              }),
          })
        }
        onSaveAndTag={(lift) =>
          upsertLift(lift, {
            original,
            onSuccess: (saved) =>
              navigate({
                pathname: '/tags',
                search: defaultStringifySearch({ liftName: saved.name }),
              }),
          })
        }
      />
    </>
  )
}
