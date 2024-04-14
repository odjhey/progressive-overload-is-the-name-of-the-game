import { AppModel } from '@odjhey/progressive-overload-app-core'
import { types, Instance, SnapshotOut } from 'mobx-state-tree'

export const RootStoreModel = types.model({
  app: AppModel,
})

/**
 * The RootStore instance.
 */
export type RootStore = Instance<typeof RootStoreModel>
/**
 * The data of a RootStore.
 */
export type RootStoreSnapshot = SnapshotOut<typeof RootStoreModel>
