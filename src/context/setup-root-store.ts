/**
 * This file is where we do "rehydration" of your RootStore from AsyncStorage.
 * This lets you persist your state between app launches.
 *
 * Navigation state persistence is handled in navigationUtilities.tsx.
 *
 * Note that Fast Refresh doesn't play well with this file, so if you edit this,
 * do a full refresh of your app instead.
 *
 * @refresh reset
 */
import { applySnapshot, IDisposer, onSnapshot } from 'mobx-state-tree'
import { RootStore, RootStoreSnapshot } from './rootstore'
import localforage from 'localforage'

const storage = {
  load: localforage.getItem,
  save: localforage.setItem,
}

/**
 * The key we'll be saving our state as within async storage.
 */
const ROOT_STATE_STORAGE_KEY = 'root-v1'

/**
 * Setup the root state.
 */
let _disposer: IDisposer | undefined
export async function setupRootStore(rootStore: RootStore) {
  console.log('setting up')
  let restoredState: RootStoreSnapshot | undefined | null

  const local = await storage.load(ROOT_STATE_STORAGE_KEY)
  console.log({ local })

  try {
    // load the last known state from AsyncStorage
    restoredState = (local ?? {
      app: {
        connection: { url: '' },
        todo: { todo: [] },
      },
    }) as RootStoreSnapshot
    applySnapshot(rootStore, restoredState)
  } catch (e) {
    // if there's any problems loading, then inform the dev what happened
    if (e instanceof Error) console.error(e.message)
  }

  // stop tracking state changes if we've already setup
  if (_disposer) _disposer()

  // track changes & save to AsyncStorage
  _disposer = onSnapshot(rootStore, (snapshot) =>
    storage.save(ROOT_STATE_STORAGE_KEY, snapshot)
  )

  const unsubscribe = () => {
    _disposer?.()
    _disposer = undefined
  }

  return { rootStore, restoredState, unsubscribe }
}
