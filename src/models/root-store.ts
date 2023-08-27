import { types } from 'mobx-state-tree'

const LiftModel = types.model({
  id: types.identifier,
  date: types.Date,
  name: types.string,
  weight: types.number,
  uom: types.string,
  set: types.number,
  rep: types.number,
  comment: types.string,
})

export const RootStore = types
  .model({
    lifts: types.map(LiftModel),
  })
  .views((self) => ({
    vLifts: () => {
      return [...self.lifts.values()].map((l) => ({
        ...l,
        date: l.date.toLocaleString(),
      }))
    },
  }))
  .actions((self) => ({
    newLift: ({
      date,
      name,
      weight,
      uom,
      set,
      rep,
      comment,
    }: {
      date: Date
      name: string
      weight: number
      uom: string
      set: number
      rep: number
      comment: string
    }) => {
      // TODO: update to a human readable ID
      const id = `lift/${encodeURIComponent(name)}_${encodeURIComponent(
        date.valueOf()
      )}`
      // TODO: verify that date tz
      self.lifts.set(id, {
        id,
        date,
        name,
        weight,
        uom,
        set,
        rep,
        comment,
      })
    },
  }))
