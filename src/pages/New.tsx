import { Lift, useLifts } from '../hooks/useLifts'
import { LiftForm } from '../components/LiftForm'
import { useNavigate } from 'react-router-dom'
import { useUrlSearchParams } from '../hooks/useUrlSearchParams'
import { defaultStringifySearch } from '../libs/searchParams'

export default function New() {
  const [liftInSearch] = useUrlSearchParams()
  console.log({ liftInSearch })

  const { error, loading, upsertLift, deleteLift } = useLifts()
  const navigate = useNavigate()

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>{error.message}</div>
  }

  const defaults = (liftInSearch && (liftInSearch as any).lift) ?? {
    date: new Date().toISOString().substring(0, 16),
    name: '',
    rep: 0,
    set: 0,
    uom: 'lbs',
    weight: 0,
  }

  // we have the %20 issue about spaces and + sign
  return (
    <LiftForm
      lift={{ ...defaults, name: String(defaults.name).replaceAll('+', ' ') }}
      onDelete={(k) =>
        deleteLift(k, {
          onSuccess: (_) =>
            navigate({
              pathname: '/',
            }),
        })
      }
      onSubmit={(lift: Lift) =>
        upsertLift(lift, {
          onSuccess: (d) =>
            navigate({
              pathname: '/',
              search: `${defaultStringifySearch({ selected: d.date })}`,
            }),
        })
      }
    ></LiftForm>
  )
}
