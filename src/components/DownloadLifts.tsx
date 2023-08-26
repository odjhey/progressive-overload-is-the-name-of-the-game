import { useEffect } from 'react'
import { useDbRaw } from '../hooks/useDbRaw'
import { useLifts } from '../hooks/useLifts'

export const DownloadLifts = () => {
  const { data, loading } = useLifts()
  const dbRaw = useDbRaw()

  useEffect(() => {
    dbRaw.getKeys()
  }, [])

  if (loading) {
    return <div>loading</div>
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <button
          className="btn btn-sm btn-info"
          type="button"
          onClick={() => {
            const delimited = data
              .map((lift) => {
                return `${lift.name},${lift.weight},${lift.rep},${lift.set},${lift.date}`
              })
              .join('\n')

            const header = 'name,weight,rep,set,date'

            const b = new File(
              [[header, delimited].join('\n')],
              'export-lifts.csv',
              {
                type: 'text/csv;charset=utf-8',
              }
            )
            window.open(window.URL.createObjectURL(b))
          }}
        >
          download
        </button>
      </div>

      <div className="mx-auto border border-solid border-secondary p-1">
        <div className="text-lg font-bold">Raw Data</div>
        {dbRaw.loading ? (
          <div>loading</div>
        ) : (
          dbRaw.keys.map((key) => {
            return (
              <div key={key} className="flex justify-between w-80 pt-1">
                <div>{key}</div>
                <button
                  type="button"
                  className="btn btn-sm btn-info"
                  onClick={() => {
                    dbRaw.getValues(key).then((values) => {
                      const b = new File([values], `values-${key}.txt`, {
                        // lol text/plain no work in PWA
                        type: 'text/csv;charset=utf-8',
                      })
                      window.open(
                        window.URL.createObjectURL(b),
                        '_blank',
                        'noopener,noreferrer'
                      )
                    })
                  }}
                >
                  download
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
