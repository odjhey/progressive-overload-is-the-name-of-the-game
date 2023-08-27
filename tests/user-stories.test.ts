import { expect, test } from 'vitest'
import { RootStore } from '../src/models/root-store'
import { getCrudStore } from './fixtures/stores'

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

  expect.assertions(2)
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
      tags: [],
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
      tags: [],
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
      tags: [],
    },
  ])
})

test('users should be able to update lift entries', () => {
  const store = getCrudStore()

  expect.assertions(1)
  // update all, ala POST
  store.updateLift('lift/squat_1672617600000', {
    date: new Date('2023-01-02T00:00:00.000Z'),
    weight: 160,
    rep: 10,
    comment: 'tough',
    name: 'iskwat',
    uom: 'lbs',
    set: 4,
  })

  // update individual fields, ala PATCH
  store.updateLift('lift/bench_1672617600000', {
    weight: 140,
    rep: 8,
    comment: '9-8-8',
  })

  expect(store.vLifts()).toEqual([
    {
      id: 'lift/bench_1672617600000',
      date: '1/2/2023, 8:00:00 AM',
      name: 'bench',
      weight: 140,
      uom: 'lbs',
      set: 4,
      rep: 8,
      comment: '9-8-8',
      tags: [],
    },
    {
      id: 'lift/squat_1672617600000',
      date: '1/2/2023, 8:00:00 AM',
      name: 'iskwat',
      weight: 160,
      uom: 'lbs',
      set: 4,
      rep: 10,
      comment: 'tough',
      tags: [],
    },
  ])
})

test('users should be able to delete lift entries', () => {
  const store = getCrudStore()

  store.removeLift('lift/bench_1672617600000')

  expect.assertions(1)
  expect(store.vLifts()).toEqual([
    {
      id: 'lift/squat_1672617600000',
      date: '1/2/2023, 8:00:00 AM',
      name: 'squat',
      weight: 150,
      uom: 'lbs',
      set: 4,
      rep: 8,
      comment: '',
      tags: [],
    },
  ])
})

test('users should be able to create lift entries from previous sessions', () => {
  const store = getCrudStore()

  // must be able to carry tags during copy
  store.tagLift('bench', 'push')

  const { ok } = store.copyLift('lift/bench_1672617600000', {
    date: new Date('2023-01-05T00:00:00.000Z'),
    weight: 140,
    rep: 8,
    comment: '9-8-8',
  })

  expect.assertions(2)
  expect(ok).toBe(true)
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
      tags: ['push'],
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
      tags: [],
    },
    {
      id: 'lift/bench_1672876800000',
      date: '1/5/2023, 8:00:00 AM',
      name: 'bench',
      weight: 140,
      uom: 'lbs',
      set: 4,
      rep: 8,
      comment: '9-8-8',
      tags: ['push'],
    },
  ])
})

test('users should be able to tag lift entries', () => {
  const store = getCrudStore()

  store.copyLift('lift/bench_1672617600000', {
    date: new Date('2023-10-10')
  })
  store.tagLift('bench', 'push')
  store.tagLift('bench', 'chest')

  expect.assertions(1)
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
      tags: ['push', 'chest'],
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
      tags: [],
    },
    {
      id: 'lift/bench_1696896000000',
      date: '10/10/2023, 8:00:00 AM',
      name: 'bench',
      weight: 120.5,
      uom: 'lbs',
      set: 4,
      rep: 8,
      comment: '',
      tags: ['push', 'chest'],
    },
  ])
})

test('users should be able to untag', () => {
  const store = getCrudStore()

  store.tagLift('bench', 'push')
  store.tagLift('bench', 'chest')
  store.tagLift('bench', 'compound')

  expect.assertions(2)
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
      tags: ['push', 'chest', 'compound'],
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
      tags: [],
    },
  ])

  store.untagLift('bench', 'chest')
  store.untagLift('bench', 'compound')
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
      tags: ['push'],
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
      tags: [],
    },
  ])
})
