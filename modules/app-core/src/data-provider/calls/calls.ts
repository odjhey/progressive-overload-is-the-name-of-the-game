import { DataProviderContext } from '../data-provider.context'
import { HttpClient } from '../http-client.types'
import { todoCalls } from './todo.calls'

export const registerCalls = (
  client: { url: string; client: HttpClient },
  context: DataProviderContext
) => {
  return { ...todoCalls(client, context) }
}
