import { AppState } from '../index'
import type { ScreenKeys } from './screens.types'
import { authScreens } from './screens/auth/auth.screen'
import { todoScreens } from './screens/todo/todo'
import { clientSelectorScreens } from './screens/client-selector/client-selector.screen'

export const appUi = (app: AppState) => {
  const screens = {
    ...todoScreens(app),
    ...authScreens(app),
    ...clientSelectorScreens(app),
  } as const

  // type-check workaround since i can't seem to infer the type of screens
  type InferredScreens = typeof screens
  type ValidateScreensCoverage = {
    [K in ScreenKeys]: K extends keyof InferredScreens
      ? InferredScreens[K]
      : never
  }
  // @todo this does not check for "extra" screens, only for missing screens
  // Compile-time validation (won't be used at runtime)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _screen_definition_completeness_check: ValidateScreensCoverage = screens

  return {
    screens,
    globals: {
      hasConnection: () => app.apiConnection.hasConnection(),
      auth: {
        isAuth: () => app.auth.isAuth(),
      },
      timers: {
        timer: () => app.timer.value(),
      },
    },
  }
}
