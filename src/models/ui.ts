import { types } from 'mobx-state-tree'
import { RootStore } from './root-store'
import dayjs from 'dayjs'

export const UiStore = types
  .model({
    data: RootStore,
    filterTerms: types.model({
      tag: types.string,
      liftName: types.string,
      date: types.string,
    }),
  })
  .actions((self) => {
    return {
      filterByName: (name: string) => {
        self.filterTerms.liftName = name
      },
      filterByDate: (date: string) => {
        self.filterTerms.date = date
      },
      filterByTag: (tag: string) => {
        self.filterTerms.tag = tag
      },
      resetFilters: () => {
        self.filterTerms = {
          tag: '',
          liftName: '',
          date: '',
        }
      },
    }
  })
  .views((self) => {
    return {
      // TODO: add pagination > { page }: { page: number } = { page: 1 }
      vLifts: () => {
        return [...self.data['m/lifts'].values()]
          .filter((l) => {
            return l.name.includes(self.filterTerms.liftName)
          })
          .map((l) => {
            return {
              name: l.name,
              date: l.date.toLocaleDateString(),
              weight: `${l.weight}`,
              set: `${l.set}`,
              rep: `${l.rep}`,
              uom: l.uom,
              // sinceLastInDays
              // sinceLastOverloadInDays
              tags: self.data.vTagsByLiftName(l.name),
              comment: l.comment,
            }
          })
          .filter((l) => {
            return (
              self.filterTerms.tag === '' ||
              l.tags.includes(self.filterTerms.tag)
            )
          })
          .filter((l) => {
            return (
              self.filterTerms.date === '' ||
              dayjs(l.date).isSame(self.filterTerms.date, 'day')
            )
          })
      },
    }
  })
