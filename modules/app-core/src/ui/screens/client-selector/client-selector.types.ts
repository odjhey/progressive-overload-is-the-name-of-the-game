import { ScreenConfigFn } from '../../screens.types'

// Define the structure of all screens and their possible navigation targets
export type ScreenConfigs = {
  // @todo replace me
  'screens/client-selector/select': ScreenConfigFn<
    never,
    {
      setSeed: (params: { seed: string }) => void
    },
    { message: string }
  >
}
