import { useState } from 'react'
import { useLifts } from '../hooks/useLifts'
import { LiftFormView } from '../components/LiftFormView'
import { useTags } from '../hooks/useTags'

export default function Latest() {
  const { unique, data } = useLifts()
  const [openList, setOpenList] = useState<string[]>([])
  const { data: tags } = useTags()

  return (
    <>
      {unique.map((lift) => {
        return (
          <div className="flex flex-col items-start gap-2">
            <div>
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => {
                  setOpenList((prev) => {
                    const match = prev.find((v) => v === lift.name)
                    if (match) {
                      return prev.filter((p) => p !== match)
                    }
                    return [...prev, lift.name]
                  })
                }}
                key={lift.name}
              >
                {lift.name}
              </button>
              {tags
                .filter((d) => d.liftName === lift.name)
                .map((t) => {
                  return <span className="badge">{t.name}</span>
                })}
            </div>
            <div
              className={`flex flex-wrap border border-solid border-red-300 ${
                openList.find((o) => lift.name === o) ? '' : 'hidden'
              }`}
            >
              {data
                .filter((d) => d.name === lift.name)
                .map((d) => {
                  return <LiftFormView lift={d}></LiftFormView>
                })}
            </div>
          </div>
        )
      })}
    </>
  )
}
