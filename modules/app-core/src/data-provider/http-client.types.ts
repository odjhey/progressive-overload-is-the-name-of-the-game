type Response = Readonly<{
  readonly ok: boolean
  readonly status: number
  readonly statusText: string
  readonly json: () => Promise<unknown>
}>
type Request = [
  url: string,
  options?: {
    body: unknown
    headers: {
      Authorization: string
      'Content-Type': 'application/json'
    }
  },
]

export type HttpClient = {
  get: (...args: Request) => Promise<Response>
  post: (...args: Request) => Promise<Response>
}
