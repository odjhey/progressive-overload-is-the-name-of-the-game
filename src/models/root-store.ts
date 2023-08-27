import { types } from 'mobx-state-tree'

const TagModel = types.model({
  tag: types.identifier,
})

const LiftModel = types
  .model({
    id: types.identifier,
    date: types.Date,
    name: types.string,
    weight: types.number,
    uom: types.string,
    set: types.number,
    rep: types.number,
    comment: types.string,
    tags: types.array(types.reference(TagModel)),
  })
  .actions((self) => ({
    tag: (tag: string) => {
      // TODO: make this list unique, so not repeatable
      self.tags.push(tag)
    },
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

export const RootStore = types
  .model({
    lifts: types.map(LiftModel),
    tags: types.map(TagModel),
  })
  .views((self) => ({
    vLifts: () => {
      return [...self.lifts.values()].map((l) => ({
        id: l.id,
        date: l.date.toLocaleString(),
        name: l.name,
        rep: l.rep,
        set: l.set,
        uom: l.uom,
        weight: l.weight,
        comment: l.comment,
        tags: [...l.tags.values()].map((t) => t.tag),
      }))
    },
  }))
  .actions((self) => {
    const newLiftId = (name: string, date: Date) =>
      `lift/${encodeURIComponent(name)}_${encodeURIComponent(date.valueOf())}`

    return {
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
        const id = newLiftId(name, date)
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
      updateLift: (
        id: string,
        {
          date,
          name,
          weight,
          uom,
          set,
          rep,
          comment,
        }: {
          date?: Date
          name?: string
          weight?: number
          uom?: string
          set?: number
          rep?: number
          comment?: string
        }
      ) => {
        const match = self.lifts.get(id)
        match?.update({
          date: date === undefined ? match.date : date,
          name: name === undefined ? match.name : name,
          weight: weight === undefined ? match.weight : weight,
          uom: uom === undefined ? match.uom : uom,
          set: set === undefined ? match.set : set,
          rep: rep === undefined ? match.rep : rep,
          comment: comment === undefined ? match.comment : comment,
        })
      },
      removeLift: (id: string) => {
        self.lifts.delete(id)
      },
      copyLift: (
        baseId: string,
        {
          date,
          name,
          weight,
          uom,
          set,
          rep,
          comment,
        }: {
          date?: Date
          name?: string
          weight?: number
          uom?: string
          set?: number
          rep?: number
          comment?: string
        }
      ): { ok: true } | { ok: false } => {
        const match = self.lifts.get(baseId)
        if (!match) {
          // TODO: still unsure if we should be throwing here, or use a "state" to store errors
          return { ok: false }
        }
        const id = newLiftId(
          name === undefined ? match.name : name,
          date === undefined ? match.date : date
        )

        // TODO: should we check for id "uniqueness" to avoid possible overwrites during copy?
        if (id === baseId) {
          return { ok: false }
        }

        self.lifts.set(id, {
          id,
          date: date === undefined ? match.date : date,
          name: name === undefined ? match.name : name,
          weight: weight === undefined ? match.weight : weight,
          uom: uom === undefined ? match.uom : uom,
          set: set === undefined ? match.set : set,
          rep: rep === undefined ? match.rep : rep,
          comment: comment === undefined ? match.comment : comment,
          tags: [...match.tags.values()].map((t) => t.tag),
        })
        return { ok: true }
      },
      tagLift: (id: string, tag: string): { ok: false } | { ok: true } => {
        const match = self.lifts.get(id)
        if (!match) {
          // TODO: still unsure if we should be throwing here, or use a "state" to store errors
          return { ok: false }
        }
        match.tag(tag)
        return { ok: true }
      },
    }
  })
