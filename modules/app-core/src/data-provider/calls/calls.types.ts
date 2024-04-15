import { DataProviderContext } from '../data-provider.context'
import { HttpClient } from '../http-client.types'

export type Calls<T> = (
  { url, client }: { url: string; client: HttpClient },
  context: DataProviderContext
) => T
