import {
  appCore,
  DataProvider,
  AppModel,
} from '@odjhey/progressive-overload-app-core'
import { observer } from 'mobx-react-lite'
import { types } from 'mobx-state-tree'
import React from 'react'

const App = types.model({
  app: AppModel,
})

const dataProvider = DataProvider({
  config: {
    httpClient: {
      get: () => Promise.resolve(undefined) as any,
      post: () => Promise.resolve(undefined) as any,
    },
    url: '',
  },
})

const __core = appCore({
  deps: {
    dataProvider: dataProvider,
    notifications: {
      info: (...args) => {
        console.info(args)
      },
    },
    plugins: {
      autoKick: {
        register: () => () => undefined,
      },
      timer: {
        register: () => () => undefined,
      },
    },
  },
})

const __ui = __core.appUi
const __rootStore = App.create({
  app: { connection: { url: '' }, todo: { todo: [] } },
})
__core.configure(__rootStore.app)
const AppContext = React.createContext(__core)

const Main = () => {
  return (
    <AppContext.Provider value={__core}>
      <V2></V2>
    </AppContext.Provider>
  )
}

const V2 = observer(function V2() {
  const { views } = __ui().screens['screens/todo/list']({
    navigate: (target) => {
      console.log(target)
    },
  })

  const addScreen = __ui().screens['screens/todo/add']({
    navigate: (target) => {
      console.log(target)
    },
  })

  return (
    <div>
      <div>v2</div>
      <div>
        {views.todos().map((todo, idx) => (
          <div key={idx}>{todo}</div>
        ))}
      </div>
      <div>
        <button onClick={() => addScreen.actions.add('hello asdf')}>
          Add addd
        </button>
      </div>
    </div>
  )
})

export default Main
