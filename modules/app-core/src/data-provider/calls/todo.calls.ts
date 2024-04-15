import { Calls } from './calls.types'

type TodoCalls = {
  fetchTodos: () => Promise<string[]>
  sync: (todos: string[]) => Promise<void>
}

export const todoCalls: Calls<TodoCalls> = ({ url, client }, context) => ({
  fetchTodos: async () => {
    // @todo: extract this to own module/service for better error handling
    try {
      const token = await context.getToken()
      const response = await client.get(`${url}/api/todos`, {
        headers: {
          'Content-Type': 'application/json',
          // @todo fixme
          Authorization: token || '',
        },
        body: undefined,
      })

      console.log(response.status)
      // @todo validate this of course
      return (await response.json()) as string[]
    } catch (e) {
      console.error(e)
    }
    // this is much better than have the app crash
    return []
  },

  sync: async (todos: string[]) => {
    try {
      const token = await context.getToken()
      const result = await client.post(`${url}/api/todos`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify(todos),
      })
      console.log(result.status)
    } catch (e) {
      console.error(e)
    }
  },
})
