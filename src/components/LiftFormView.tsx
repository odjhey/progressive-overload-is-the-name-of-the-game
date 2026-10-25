import { useNavigate } from 'react-router-dom'
import { defaultStringifySearch } from '../libs/searchParams'
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

  return (
    <LiftRow
      lift={{ ...lift }}
      actions={{
        edit: () => {
          navigate({
            pathname: '/new',
            search: defaultStringifySearch({ title: 'Edit', lift }),
          })
        },
        copy: () => {
          navigate({
            pathname: '/new',
            search: defaultStringifySearch({
              title: 'Copy',
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
