import { useDbRaw } from '../hooks/useDbRaw'
import { useForm } from 'react-hook-form'

export const UploadRaw = () => {
  const { loading, uploadRaw } = useDbRaw()
  const { register, handleSubmit } = useForm<{
    fileList: FileList
    key: string
  }>()

  if (loading) {
    return <div>loading</div>
  }

  return (
    <div className="flex">
      <div className="mx-auto border border-solid border-secondary p-1">
        <div className="text-lg font-bold">Upload Raw Data</div>
        {loading ? (
          <div>loading</div>
        ) : (
          <form
            onSubmit={handleSubmit(async (v) => {
              const json = JSON.parse(await v.fileList[0].text())
              console.log(json)
              uploadRaw(v.key, json)
            })}
          >
            {
              <div className="flex flex-col gap-2">
                <input
                  className="input input-bordered input-sm"
                  placeholder="key"
                  type="text"
                  {...register('key', { required: true })}
                ></input>
                <input
                  type="file"
                  {...register('fileList', { required: true })}
                ></input>
                <button type="submit" className="btn btn-sm btn-info">
                  upload
                </button>
              </div>
            }
          </form>
        )}
      </div>
    </div>
  )
}
