import { observer } from 'mobx-react-lite'
import { AppContext, __core } from '../context/app-core-context'

const Main = () => {
  return (
    <AppContext.Provider value={__core}>
      <V2></V2>
    </AppContext.Provider>
  )
}

const V2 = observer(function V2() {
  const ui = __core.appUi()
  const { views } = ui.screens['screens/todo/list']({
    navigate: (target) => {
      console.log(target)
    },
  })

  const addScreen = ui.screens['screens/todo/add']({
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
