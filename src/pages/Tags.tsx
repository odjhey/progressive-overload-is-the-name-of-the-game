import { SubmitHandler, useForm } from 'react-hook-form'
import { Lift, useLifts } from '../hooks/useLifts'
import { useTags } from '../hooks/useTags'
import { useMemo } from 'react'
import { useUrlSearchParams } from '../hooks/useUrlSearchParams'

type NewTag = {
  name: string
  liftName: string
}

export default function Tags() {
  const [liftInSearch] = useUrlSearchParams()
  const lifts = useLifts()
  const tags = useTags()
  console.log({ liftInSearch })

  const { register, handleSubmit, setValue, setFocus, getValues } =
    useForm<NewTag>()
  const onSubmit: SubmitHandler<NewTag> = (data) => {
    tags.appendTag(
      { liftName: data.liftName, name: data.name },
      {
        onSuccess: (d) => {
          console.log('success', d)
        },
      }
    )
    window.scrollTo({ top: 0 })
  }

  const uniqueLifts = useMemo<typeof lifts.data>(() => {
    const orderedData = lifts.data.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    const keys = new Set(orderedData.map((d) => d.name))
    const isLift = (item: Lift | undefined): item is Lift => item !== undefined
    return [...keys.values()]
      .map((k) => orderedData.find((d) => d.name === k))
      .filter(isLift)
  }, [lifts.data])

  return (
    <>
      <div>Tags</div>
      <div className="p-2">
        <form
          className="flex gap-2 flex-wrap items-center p-2 border-solid border-primary border"
          onSubmit={handleSubmit(onSubmit)}
        >
          <input
            className="input input-bordered"
            {...register('name', { required: true })}
          />
          <input
            className="input input-bordered"
            {...register('liftName', { required: true })}
            defaultValue={
              liftInSearch &&
              (liftInSearch as any).liftName &&
              (liftInSearch as any).liftName.replaceAll('+', ' ')
            }
          />
          <button type="submit" className="btn btn-sm">
            tag
          </button>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => {
              if (confirm('Are you sure you want to delete?')) {
                tags.deleteTag(
                  { name: getValues('name'), liftName: getValues('liftName') },
                  {
                    onSuccess: (t) => {
                      console.log('success delete', t.liftName, t.name)
                    },
                  }
                )
              }
            }}
          >
            delete tag entry
          </button>
        </form>
      </div>
      <div>
        {uniqueLifts.map((d) => {
          return (
            <div className="flex flex-wrap space-x-1 items-center" key={d.name}>
              <div>{d.name}</div>
              {tags.data
                .filter((v) => v.liftName === d.name)
                .map((t) => {
                  return (
                    <div className="badge" key={t.name}>
                      {t.name}
                      <button
                        className="btn btn-xs"
                        onClick={() => {
                          tags.deleteTag(t)
                        }}
                      >
                        x
                      </button>
                    </div>
                  )
                })}
              <button
                className="btn btn-xs"
                onClick={() => {
                  setValue('liftName', d.name)
                  setFocus('name')
                }}
              >
                +
              </button>
            </div>
          )
        })}
      </div>
    </>
  )
}
