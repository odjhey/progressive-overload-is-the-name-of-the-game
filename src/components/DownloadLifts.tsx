import { useLifts } from '../hooks/useLifts'

export const DownloadLifts = () => {
  const { data, loading } = useLifts()

  if (loading) {
    return <div>loading</div>
  }

  return (
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
  )
}
