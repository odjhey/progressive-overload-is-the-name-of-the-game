import { SubmitHandler, useForm } from 'react-hook-form'
import { useLifts } from '../hooks/useLifts'
import { useTags } from '../hooks/useTags'

type NewTag = {
  name: string
  liftName: string
}

export default function Tags() {
  const lifts = useLifts()
  const tags = useTags()

  const { register, handleSubmit, setValue } = useForm<NewTag>()
  const onSubmit: SubmitHandler<NewTag> = (data) => {
    tags.appendTag(
      { liftName: data.liftName, name: data.name },
      {
        onSuccess: (d) => {
          console.log('success', d)
        },
      }
    )
  }

  return (
    <>
      <div>Tags</div>
      <div>
        {lifts.data.map((d) => {
          return (
            <>
              <div>{d.name}</div>
              {tags.data
                .filter((v) => v.liftName === d.name)
                .map((t) => {
                  return <div>{t.name}</div>
                })}
              <button
                className="btn btn-sm"
                onClick={() => setValue('liftName', d.name)}
              >
                +
              </button>
            </>
          )
        })}
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input {...register('name')} />
        <input {...register('liftName')} />
        <button type="submit" className="btn btn-sm">
          tag
        </button>
      </form>
    </>
  )
}
