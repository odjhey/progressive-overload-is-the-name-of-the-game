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
    'm/lifts': types.map(LiftModel),
    'm/tags': types.map(TagModel),
    'm/taggingByLiftNameList': types.array(TaggingByLiftName),
  })
  .views((self) => {
    const vTagsByLiftName = (liftName: string) => {
      const tags = [
        ...self['m/taggingByLiftNameList']
          .filter((tbn) => tbn.name === liftName)
          .values(),
      ].map((t) => t.tag.tag)
      return tags
    }

    return {
      vTagsByLiftName,
      vLifts: () => {
        return [...self['m/lifts'].values()].map((l) => {
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
      vLiftsByName: (nameSearchTerm: string) => {
        return [...self['m/lifts'].values()]
          .filter((l) => l.name.includes(nameSearchTerm))
          .map((l) => {
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
      vLiftsByTag: (tagSearchTerm: string) => {
        const liftNames = self['m/taggingByLiftNameList']
          .filter((tbn) => tbn.tag.tag === tagSearchTerm)
          .map((t) => t.name)

        console.log('-----', liftNames)

        return [...self['m/lifts'].values()]
          .filter((l) => liftNames.includes(l.name))
          .map((l) => {
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
        self['m/lifts'].set(id, {
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
        const match = self['m/lifts'].get(id)
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
        self['m/lifts'].delete(id)
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
        const match = self['m/lifts'].get(baseId)
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

        self['m/lifts'].set(id, {
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
      tagLift: (name: string, tag: string) => {
        self['m/taggingByLiftNameList'].push({
          id: newTaggingByLiftNameId(name, tag),
          tag: tag,
          name: name,
        })
      },
      untagLift: (name: string, tag: string): { ok: true } | { ok: false } => {
        const matchIdx = self['m/taggingByLiftNameList'].findIndex(
          (tbn) => tbn.name === name && tbn.tag.tag === tag
        )
        if (matchIdx < 0) {
          return { ok: false }
        }
        self['m/taggingByLiftNameList'].splice(matchIdx, 1)
        return { ok: true }
      },
    }
  })
