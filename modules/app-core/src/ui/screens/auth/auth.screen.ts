import type { AppState } from '../../../index'
import { ScreenConfigs } from './auth.types'

// Main function to generate screen configurations
export const authScreens = (
  app: AppState
): {
  [K in keyof ScreenConfigs]: ScreenConfigs[K]
} => ({
  'screens/auth/login': () => ({
    actions: {
      login: () => {
        app.auth.login()
      },
    },
    views: { t: 'string' },
  }),
  'screens/auth/profile': () => ({
    actions: {
      logout: () => {
        app.auth.logout()
      },
      wipe: () => {
        app.wipe()
      },
    },
    views: { t: 'string' },
  }),
})
