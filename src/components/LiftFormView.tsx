import { useNavigate } from 'react-router-dom'
import { defaultStringifySearch } from '../libs/searchParams'
import { useUrlSearchParams } from '../hooks/useUrlSearchParams'
import { LiftRow } from './LiftRow'

type FormValues = {
  lift: {
    date: string
    name: string
    weight: number
    uom: string
    set: number
    rep: number
    comment: string
  }
}

export const LiftFormView = ({ lift }: { lift: FormValues['lift'] }) => {
  const navigate = useNavigate()
  const [search] = useUrlSearchParams()
  const view = search.view === 'history' ? 'history' : 'latest'

  return (
    <LiftRow
      lift={{ ...lift }}
      actions={{
        edit: () => {
          navigate({
            pathname: '/new',
            search: defaultStringifySearch({ title: 'Edit', lift, view }),
          })
        },
        copy: () => {
          navigate({
            pathname: '/new',
            search: defaultStringifySearch({
              title: 'Copy',
              view,
              previousLift: lift,
              lift: {
                ...lift,
                date: new Date().toISOString().substring(0, 16),
              },
            }),
          })
        },
      }}
    ></LiftRow>
  )
}
