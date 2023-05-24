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
            search: `${defaultStringifySearch({
              lift: {
                name: lift.name,
                date: lift.date,
                rep: lift.rep,
                set: lift.set,
                weight: lift.weight,
                uom: lift.uom,
              },
            })}`,
          })
        },
        copy: () => {
          navigate({
            pathname: '/new',
            search: `${defaultStringifySearch({
              lift: {
                name: lift.name,
                date: new Date().toISOString().substring(0, 16),
                rep: lift.rep,
                set: lift.set,
                weight: lift.weight,
                uom: lift.uom,
              },
            })}`,
          })
        },
      }}
    ></LiftRow>
  )
}
