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
            <div className="flex gap-2 items-center" key={d.name}>
              <div>{d.name}</div>
              {tags.data
                .filter((v) => v.liftName === d.name)
                .map((t) => {
                  return (
                    <div className="badge" key={t.name}>
                      {t.name}
                    </div>
                  )
                })}
              <button
                className="btn btn-xs"
                onClick={() => setValue('liftName', d.name)}
              >
                +
              </button>
            </div>
          )
        })}
      </div>
      <div className="p-2">
        <form
          className="flex gap-2 flex-wrap items-center p-2 border-solid border-primary border"
          onSubmit={handleSubmit(onSubmit)}
        >
          <input className="input input-bordered" {...register('name')} />
          <input className="input input-bordered" {...register('liftName')} />
          <button type="submit" className="btn btn-sm">
            tag
          </button>
        </form>
      </div>
    </>
  )
}
