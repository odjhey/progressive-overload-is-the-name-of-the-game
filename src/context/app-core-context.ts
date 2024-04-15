import {
  appCore,
  DataProvider,
  AppModel,
} from '@odjhey/progressive-overload-app-core'
import { types } from 'mobx-state-tree'
import React from 'react'
import { setupRootStore } from './setup-root-store'

const App = types.model({
  app: AppModel,
})

const __rootStore = App.create({
  app: { connection: { url: '' }, todo: { todo: [] } },
})
setupRootStore(__rootStore)

const dataProvider = DataProvider({
  config: {
    httpClient: {
      get: () => Promise.resolve(undefined) as any,
      post: () => Promise.resolve(undefined) as any,
    },
    url: '',
  },
})

export const __core = appCore({
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

__core.configure(__rootStore.app)

export const AppContext = React.createContext(__core)
