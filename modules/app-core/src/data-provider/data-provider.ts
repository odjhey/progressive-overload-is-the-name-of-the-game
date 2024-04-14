import { registerCalls } from './calls/calls'
import { Context } from './data-provider.context'
import { HttpClient } from './http-client.types'

type DataProviderConfig = {
  config: {
    url: string
    httpClient: HttpClient
    // @todo add token cache maybe? or straight up localstore
  }
}

export const DataProvider = ({ config }: DataProviderConfig) => {
  let apiUrl = config.url
  const client = config.httpClient
  const context = () => Context({ url: apiUrl, client })

  return {
    setApiUrl: (url: string) => {
      apiUrl = url
    },
    apiUrl: () => apiUrl,
    context,
    calls: () => registerCalls({ url: apiUrl, client }, context()),
  } as const
}

export type Context = ReturnType<typeof DataProvider>['context']
export type Api = ReturnType<typeof DataProvider>['calls']
