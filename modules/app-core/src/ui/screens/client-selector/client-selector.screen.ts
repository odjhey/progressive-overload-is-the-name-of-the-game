import type { AppState } from '../../../index'
import { ScreenConfigs } from './client-selector.types'

// Main function to generate screen configurations
export const clientSelectorScreens = (
  app: AppState
): {
  [K in keyof ScreenConfigs]: ScreenConfigs[K]
} => ({
  'screens/client-selector/select': () => ({
    actions: {
      setSeed: ({ seed }) => {
        // @todo need to check a connection url etc etc etc
        console.log('seed', seed)
        app.apiConnection.setConnection({ url: seed })
      },
    },
    // @todo replace me
    views: {
      message: 'Welcome, please input required unique code from administrator',
    },
  }),
})
