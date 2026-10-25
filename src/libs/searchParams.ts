// copied from tanstack/router

import { decode, encode } from './qss'

export const defaultParseSearch = parseSearchWith(JSON.parse)
export const defaultStringifySearch = stringifySearchWith(JSON.stringify)

export function parseSearchWith(parser: (str: string) => unknown) {
  return (searchStr: string): Record<string, unknown> => {
    if (searchStr.substring(0, 1) === '?') {
      searchStr = searchStr.substring(1)
    }

    const query: Record<string, unknown> = decode(searchStr)

    // Try to parse any query params that might be json
    for (const key in query) {
      const value = query[key]
      if (typeof value === 'string') {
        try {
          query[key] = parser(value)
        } catch {
          //
          // console.warn(err)
        }
      }
    }

    return query
  }
}

export function stringifySearchWith(stringify: (search: unknown) => string) {
  return (search: Record<string, unknown>) => {
    search = { ...search }

    if (search) {
      Object.keys(search).forEach((key) => {
        const val = search[key]
        if (typeof val === 'undefined' || val === undefined) {
          delete search[key]
        } else if (
          typeof val === 'string' ||
          (val && typeof val === 'object')
        ) {
          try {
            search[key] = stringify(val)
          } catch {
            // silent
          }
        }
      })
    }

    const searchStr = encode(search as Record<string, string>).toString()

    return searchStr ? `?${searchStr}` : ''
  }
}
