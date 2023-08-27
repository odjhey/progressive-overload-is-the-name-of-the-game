import { types } from 'mobx-state-tree'

const TagModel = types.model({
  tag: types.identifier,
})

const TaggingByLiftName = types.model({
  id: types.identifier,
  tag: types.reference(TagModel),
  // TODO: do we create "lift groups model" or do we separate "lift vs liftEntry"?
  name: types.string,
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

export const RootStore = types
  .model({
    lifts: types.map(LiftModel),
    tags: types.map(TagModel),
    taggingByLiftNameList: types.array(TaggingByLiftName),
  })
  .views((self) => {
    const vTagsByLiftName = (liftName: string) => {
      const tags = [
        ...self.taggingByLiftNameList
          .filter((tbn) => tbn.name === liftName)
          .values(),
      ].map((t) => t.tag.tag)
      return tags
    }

    return {
      vTagsByLiftName,
      vLifts: () => {
        return [...self.lifts.values()].map((l) => {
          const tags = vTagsByLiftName(l.name)
          return {
            id: l.id,
            date: l.date.toLocaleString(),
            name: l.name,
            rep: l.rep,
            set: l.set,
            uom: l.uom,
            weight: l.weight,
            comment: l.comment,
            tags,
          }
        })
      },
    }
  })
  .actions((self) => {
    const newLiftId = (name: string, date: Date) =>
      `lift/${encodeURIComponent(name)}_${encodeURIComponent(date.valueOf())}`
    const newTaggingByLiftNameId = (name: string, tag: string) =>
      `taggingByLiftName/${encodeURIComponent(name)}_${encodeURIComponent(tag)}`

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
        })
        return { ok: true }
      },
      tagLift: (id: string, tag: string): { ok: false } | { ok: true } => {
        const match = self.lifts.get(id)
        if (!match) {
          // TODO: still unsure if we should be throwing here, or use a "state" to store errors
          return { ok: false }
        }
        self.taggingByLiftNameList.push({
          id: newTaggingByLiftNameId(match.name, tag),
          tag: tag,
          name: match.name,
        })
        return { ok: true }
      },
    }
  })
