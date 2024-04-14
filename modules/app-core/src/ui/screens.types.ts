export type ScreenKeys =
  | 'screens/todo/add'
  | 'screens/todo/list'
  | 'screens/auth/login'
  | 'screens/auth/profile'
  | 'screens/client-selector/select'
/* tag: screens-end */

// Navigator definition, targeting specific screens
export type Navigator<TargetScreens extends ScreenKeys> = {
  navigate: (target: TargetScreens) => void
}

// Define a generic Screen type for actions and views
type Screen<Actions, Views> = {
  actions: Actions
  views: Views
}

// Screen configuration function type
export type ScreenConfigFn<TargetScreens extends ScreenKeys, Actions, Views> = (
  navigator: Navigator<TargetScreens>
) => Screen<Actions, Views>
