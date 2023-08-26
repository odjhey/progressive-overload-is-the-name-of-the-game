import { Lift, useLifts } from '../hooks/useLifts'
import { LiftForm } from '../components/LiftForm'
import { useNavigate } from 'react-router-dom'
import { useUrlSearchParams } from '../hooks/useUrlSearchParams'
import { defaultStringifySearch } from '../libs/searchParams'

export default function New() {
  const [liftInSearch] = useUrlSearchParams()

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
      title={liftInSearch && (liftInSearch as any).title}
      lift={{
        ...defaults,
        name: String(defaults.name).replaceAll('+', ' '),
        comment: defaults.comment
          ? String(defaults.comment).replaceAll('+', ' ')
          : '',
      }}
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
      goToTag={(pl) =>
        navigate({
          pathname: '/tags',
          search: `${defaultStringifySearch({
            liftName: pl.name,
          })}`,
        })
      }
    ></LiftForm>
  )
}
