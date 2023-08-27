import { types } from 'mobx-state-tree'

export const TagModel = types.model({
  tag: types.identifier,
})

export const TaggingByLiftName = types.model({
  id: types.identifier,
  tag: types.reference(TagModel),
  // TODO: do we create "lift groups model" or do we separate "lift vs liftEntry"?
  name: types.string,
})

export const LiftModel = types
  .model({
    id: types.identifier,
    date: types.Date,
    name: types.string,
    weight: types.number,
    uom: types.string,
    set: types.number,
    rep: types.number,
    comment: types.string,
  })
  .actions((self) => ({
    update: ({
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
      self.date = date
      self.name = name
      self.weight = weight
      self.uom = uom
      self.set = set
      self.rep = rep
      self.comment = comment
    },
  }))
