import { ScreenConfigFn } from '../../screens.types'

// Define the structure of all screens and their possible navigation targets
export type ScreenConfigs = {
  'screens/auth/login': ScreenConfigFn<
    never,
    {
      login: (creds: { username: string; password: string }) => void
    },
    { t: string }
  >
  'screens/auth/profile': ScreenConfigFn<
    never,
    {
      logout: () => void
      wipe: () => void
    },
    { t: string }
  >
}
