import { ScreenConfigFn } from '../../screens.types'

// Define the structure of all screens and their possible navigation targets
export type ScreenConfigs = {
  'screens/todo/add': ScreenConfigFn<
    'screens/todo/list',
    {
      add: (value: string) => void
      random: () => { value: string }
    },
    { t: string }
  >
  'screens/todo/list': ScreenConfigFn<
    'screens/todo/add',
    {
      add: () => void
      clear: () => void
      refresh: () => void
      sync: () => void
    },
    {
      todos: () => string[]
    }
  >
  'screens/todo/single': ScreenConfigFn<
    'screens/todo/list',
    {
      list: () => void
    },
    {
      todo: (idx: number) => string
    }
  >
}
