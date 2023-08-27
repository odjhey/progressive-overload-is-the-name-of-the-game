import { expect, test } from 'vitest'

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

const RootStore = types
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

test('users should be able to create lift entries', () => {
  const store = RootStore.create()

  store.newLift({
    date: new Date('2023-01-02T00:00:00.000Z'),
    name: 'bench',
    weight: 120.5,
    uom: 'lbs',
    set: 4,
    rep: 8,
    comment: '',
  })

  // single
  expect(store.vLifts()).toEqual([
    {
      id: 'lift/bench_1672617600000',
      date: '1/2/2023, 8:00:00 AM',
      name: 'bench',
      weight: 120.5,
      uom: 'lbs',
      set: 4,
      rep: 8,
      comment: '',
    },
  ])

  store.newLift({
    date: new Date('2023-01-02T00:00:00.000Z'),
    name: 'squat',
    weight: 150,
    uom: 'lbs',
    set: 4,
    rep: 8,
    comment: '',
  })
  // multi
  expect(store.vLifts()).toEqual([
    {
      id: 'lift/bench_1672617600000',
      date: '1/2/2023, 8:00:00 AM',
      name: 'bench',
      weight: 120.5,
      uom: 'lbs',
      set: 4,
      rep: 8,
      comment: '',
    },
    {
      id: 'lift/squat_1672617600000',
      date: '1/2/2023, 8:00:00 AM',
      name: 'squat',
      weight: 150,
      uom: 'lbs',
      set: 4,
      rep: 8,
      comment: '',
    },
  ])
})
