import type { AppState } from '../../../index'
import { ScreenConfigs } from './todo.types'

// Main function to generate screen configurations
export const todoScreens = (
  app: AppState
): {
  [K in keyof ScreenConfigs]: ScreenConfigs[K]
} => ({
  'screens/todo/add': (navigator) => ({
    actions: {
      add: (value: string) => {
        app.todo.add(value, {
          after: () => {
            navigator.navigate('screens/todo/list')
          },
        })
      },
      random: () => {
        return { value: Math.random().toString() }
      },
    },
    views: { t: 'string' },
  }),

  'screens/todo/list': (navigator) => ({
    actions: {
      add: () => navigator.navigate('screens/todo/add'),
      clear: () => app.todo.clear(),
      refresh: () => app.todo.fetch(),
      sync: () => app.todo.sync(),
    },
    views: {
      todos: () => app.todo.get(),
    },
  }),

  'screens/todo/single': (navigator) => ({
    actions: {
      list: () => navigator.navigate('screens/todo/list'),
    },
    views: {
      todo: (idx: number) => app.todo.getIdx(idx),
    },
  }),
})
