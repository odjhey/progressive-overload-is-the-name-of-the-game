import { useForm } from 'react-hook-form'
import { Lift, useLifts } from '../hooks/useLifts'

export const UploadLifts = () => {
  const { loading, massUpsertLift } = useLifts()
  const { register, handleSubmit } = useForm<{ fileList: FileList }>()

  if (loading) {
    return <div>loading</div>
  }

  return (
    <div>
      <form
        onSubmit={handleSubmit(async (v) => {
          const values = (await v.fileList[0].text())
            .split('\n')
            .filter((v) => v !== '')
          const header = values[0].split(',')
          const items = values
            .slice(1)
            .map((s) => s.split(','))
            .map((v): Lift => {
              return {
                name: v[0],
                weight: parseInt(v[1]),
                rep: parseInt(v[2]),
                set: parseInt(v[3]),
                date: v[4],
                uom: '', // TODO
                comment: '', // TODO
              }
            })

          console.log({ header, items })

          await massUpsertLift(items)
        })}
      >
        <input
          type="file"
          {...register('fileList', { required: true })}
        ></input>
        <button className="btn btn-sm btn-info" type="submit">
          upload
        </button>
      </form>
    </div>
  )
}
