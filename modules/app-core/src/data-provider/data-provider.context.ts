import { HttpClient } from './http-client.types'

export type DataProviderContext = {
  getToken: () => Promise<string>
}

export const Context = ({
  url,
  client,
}: {
  url: string
  client: HttpClient
}): DataProviderContext => {
  return {
    // @todo what if from localstore?
    // @todo should be a result type?
    getToken: async () => {
      try {
        const result = await client.post(`${url}/public/login`)
        // @todo check payload
        const body = await result.json()
        console.log({ body })
        return (body as { token: string }).token
      } catch (e) {
        console.error(e)
        return ''
      }
    },
  }
}
