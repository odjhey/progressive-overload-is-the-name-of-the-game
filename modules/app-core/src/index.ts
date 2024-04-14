import { types, Instance } from 'mobx-state-tree'
import { appUi } from './ui/ui'
import { DataProvider } from './data-provider/data-provider'

const TodoModel = types
  .model({
    todo: types.array(types.string),
  })
  .actions((self) => ({
    setAll(values: string[]) {
      self.todo.clear()
      self.todo.push(...values)
    },
    add(newTodo: string) {
      self.todo.push(newTodo)
    },
    edit(index: number, newTodo: string) {
      self.todo[index] = newTodo
    },
    remove(index: number) {
      self.todo.splice(index, 1)
    },
    get() {
      return self.todo
    },
    getIdx(index: number) {
      return self.todo[index]
    },
    clear() {
      self.todo.clear()
    },
  }))

const Auth = types
  .model({
    isAuth: types.boolean,
  })
  .actions((self) => ({
    logout: () => {
      self.isAuth = false
    },
    login: () => {
      // @todo convert this to flow
      self.isAuth = true
    },
  }))

const Connection = types.model({
  url: types.string,
})

export const AppModel = types
  .model({
    todo: TodoModel,
    timer: types.optional(types.string, ''), // @todo
    auth: types.optional(Auth, { isAuth: true }),
    connection: Connection,
  })
  .actions((self) => ({
    setTimer(value: string) {
      self.timer = value
    },
    setConnection(value: string) {
      self.connection.url = value
    },
  }))

type Deps = {
  // @todo rename this lol
  // @todo these things fail, and we want to handle them, use a ResultType
  // online: Api
  dataProvider: ReturnType<typeof DataProvider>
  notifications: {
    info: (message: string) => void
  }
  plugins: {
    timer: {
      // return cleanup function
      register: (
        cb: (err: Error | undefined, value: string) => void
      ) => () => void
    }
    autoKick: {
      // return cleanup function
      register: (
        cb: (err: Error | undefined, value: string) => void
      ) => () => void
    }
  }
}

// think dataProvider and navigationProvider and notificationsProvider
// @todo maybe we don't need to expose this?
// @todo add kick (like when not auth or expired token)
export const appCore = ({ deps }: { deps: Deps }) => {
  let _appState: ReturnType<typeof appState>

  return {
    configure: (model: Instance<typeof AppModel>) => {
      _appState = appState(model, deps)
      return {
        globals: {
          register: () => _appState.plugins.register(),
          unregister: () => _appState.plugins.unregister(),
          timer: {
            get: _appState.timer.value,
          },
          auth: {
            isAuth: () => _appState.auth.isAuth(),
          },
        },
      }
    },
    // @todo we could cache this in a ref
    appUi: () => appUi(_appState),
  }
}

const appState = (model: Instance<typeof AppModel>, deps: Deps) => {
  // @todo add uid
  const cleanupFns: (() => void)[] = []
  const calls = deps.dataProvider.calls

  return {
    wipe: () => {
      model.todo.clear()
      model.setConnection('')
      model.auth.logout()
    },
    apiConnection: {
      hasConnection: () => model.connection.url !== '',
      setConnection: ({ url }: { url: string }) => {
        // @todo use this hack to rerender for now
        model.setConnection(url)
        deps.dataProvider.setApiUrl(url)
      },
    },
    config: {
      setApiSeed: (seed: string) => {
        // @todo validate etc
        deps.dataProvider.setApiUrl(seed)
      },
    },
    plugins: {
      // @todo add a way to register individual
      register: () => {
        console.info('registering plugins', cleanupFns)
        const cleanup = deps.plugins.timer.register((err, v) => {
          console.log('timer ticked!')
          // @todo check err
          model.setTimer(v)
        })
        cleanupFns.push(cleanup)

        // kick after 20s
        const cleanupKick = deps.plugins.autoKick.register(() => {
          console.log('autokick ticked!')
          // @todo check err
          model.auth.logout()
        })
        cleanupFns.push(cleanupKick)
      },

      // @todo add a way to unregister individual
      unregister: () => {
        console.info('un-registering plugins')
        cleanupFns.forEach((cleanup) => cleanup())
      },
    },
    timer: {
      value: () => model.timer,
    },
    auth: {
      isAuth: () => model.auth.isAuth,
      logout: () => model.auth.logout(),
      login: () => {
        model.auth.login()
      },
    },
    todo: {
      fetch: async () => {
        const todos = await calls().fetchTodos()
        model.todo.setAll(todos)
        deps.notifications.info('Done Refetch!')
      },
      sync: async () => {
        await calls().sync(model.todo.todo)
        deps.notifications.info('Synced!')
      },
      add: (newTodo: string, effects?: { after: () => void }) => {
        model.todo.add(newTodo)

        if (effects && typeof effects.after === 'function') {
          effects.after()
        }
      },
      edit: (index: number, newTodo: string) => {
        model.todo.edit(index, newTodo)
      },
      remove: (index: number) => {
        model.todo.remove(index)
      },
      syncOnline: () => {
        // POST to server
      },
      get: () => model.todo.todo,
      getIdx: (index: number) => model.todo.getIdx(index),
      clear: () => model.todo.clear(),
    },
  }
}

export type AppState = ReturnType<typeof appState>
export { DataProvider }
