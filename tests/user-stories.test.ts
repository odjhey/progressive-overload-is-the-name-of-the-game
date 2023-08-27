import { expect, test } from 'vitest'
import { RootStore } from '../src/models/root-store'

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
