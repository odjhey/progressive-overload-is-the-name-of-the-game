import { test, expect } from 'vitest'
import { getUiStore } from './fixtures/stores'

test('users should be able to view lifts at home', () => {
  const store = getUiStore()

  expect.assertions(1)
  expect(store.vLifts()).toEqual([
    {
      name: 'bench',
      date: '1/2/2023',
      rep: '8',
      set: '4',
      weight: '120.5',
      uom: 'lbs',
      tags: ['chest', 'compound'],
      comment: '',
    },
    {
      name: 'bench incline',
      date: '2/4/2023',
      rep: '8',
      set: '4',
      weight: '130.5',
      uom: 'lbs',
      tags: ['chest'],
      comment: '',
    },
    {
      name: 'squat',
      date: '1/2/2023',
      rep: '8',
      set: '4',
      weight: '150',
      uom: 'lbs',
      tags: ['leg'],
      comment: '',
    },
  ])
})

test('users should be able to view lifts at home with filters', () => {
  const store = getUiStore()

  expect.assertions(4)
  store.filterByName('bench')
  expect(store.vLifts()).toEqual([
    {
      name: 'bench',
      date: '1/2/2023',
      rep: '8',
      set: '4',
      weight: '120.5',
      uom: 'lbs',
      tags: ['chest', 'compound'],
      comment: '',
    },
    {
      name: 'bench incline',
      date: '2/4/2023',
      rep: '8',
      set: '4',
      weight: '130.5',
      uom: 'lbs',
      tags: ['chest'],
      comment: '',
    },
  ])

  store.filterByTag('compound')
  expect(store.vLifts()).toEqual([
    {
      name: 'bench',
      date: '1/2/2023',
      rep: '8',
      set: '4',
      weight: '120.5',
      uom: 'lbs',
      tags: ['chest', 'compound'],
      comment: '',
    },
  ])

  store.resetFilters()
  store.filterByDate('2/4/2023')
  expect(store.vLifts()).toEqual([
    {
      name: 'bench incline',
      date: '2/4/2023',
      rep: '8',
      set: '4',
      weight: '130.5',
      uom: 'lbs',
      tags: ['chest'],
      comment: '',
    },
  ])

  store.resetFilters()
  store.filterByName('squat')
  expect(store.vLifts()).toEqual([
    {
      name: 'squat',
      date: '1/2/2023',
      rep: '8',
      set: '4',
      weight: '150',
      uom: 'lbs',
      tags: ['leg'],
      comment: '',
    },
  ])
})
