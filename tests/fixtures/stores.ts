import { RootStore } from '../../src/models/root-store'

export const getCrudStore = () => {
  return RootStore.create({
    'm/tags': {
      push: { tag: 'push' },
      pull: { tag: 'pull' },
      leg: { tag: 'leg' },
      chest: { tag: 'chest' },
      compound: { tag: 'compound' },
    },
    'm/lifts': {
      'lift/bench_1672617600000': {
        id: 'lift/bench_1672617600000',
        date: new Date('2023-01-02T00:00:00.000Z'),
        name: 'bench',
        weight: 120.5,
        uom: 'lbs',
        set: 4,
        rep: 8,
        comment: '',
      },
      'lift/squat_1672617600000': {
        id: 'lift/squat_1672617600000',
        date: new Date('2023-01-02T00:00:00.000Z'),
        name: 'squat',
        weight: 150,
        uom: 'lbs',
        set: 4,
        rep: 8,
        comment: '',
      },
    },
  })
}
