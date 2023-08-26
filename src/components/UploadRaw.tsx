import { useDbRaw } from '../hooks/useDbRaw'
import { useForm } from 'react-hook-form'
import { useState, useEffect } from 'react'

export const UploadRaw = () => {
  const { loading, uploadRaw, fetchKeys } = useDbRaw()
  const { register, handleSubmit } = useForm<{
    fileList: FileList
    key: string
  }>()
  const [keys, setKeys] = useState([])
  const [selectedKey, setSelectedKey] = useState('')

  useEffect(() => {
    fetchKeys().then(setKeys)
  }, [])

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
              if (selectedKey) {
                uploadRaw(selectedKey, json)
              } else {
                uploadRaw(v.key, json)
              }
            })}
          >
            {
              <div className="flex flex-col gap-2">
                <select
                  value={selectedKey}
                  onChange={(e) => setSelectedKey(e.target.value)}
                >
                  {keys.map((key, index) => (
                    <option key={index} value={key}>{key}</option>
                  ))}
                </select>
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
