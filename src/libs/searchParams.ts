// copied from tanstack/router

import { decode, encode } from './qss'

export const defaultParseSearch = parseSearchWith(JSON.parse)
export const defaultStringifySearch = stringifySearchWith(JSON.stringify)

// incrementally update this
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface AnySearchSchema {
}

export function parseSearchWith(parser: (str: string) => any) {
    return (searchStr: string): AnySearchSchema => {
        if (searchStr.substring(0, 1) === '?') {
            searchStr = searchStr.substring(1)
        }

        const query: Record<string, unknown> = decode(searchStr)

        // Try to parse any query params that might be json
        console.log({ query })
        for (const key in query) {
            const value = query[key]
            console.log('--value', typeof value, query[key])
            if (typeof value === 'string') {
                try {
                    console.log('--parsed v1', value)
                    query[key] = parser(value)
                    console.log('--parsed value', query[key])
                } catch (err) {
                    //
                    console.error(err)
                }
            }
        }

        return query
    }
}

export function stringifySearchWith(stringify: (search: any) => string) {
    return (search: Record<string, any>) => {
        search = { ...search }

        if (search) {
            Object.keys(search).forEach((key) => {
                const val = search[key]
                if (typeof val === 'undefined' || val === undefined) {
                    delete search[key]
                } else if (val && typeof val === 'object' && val !== null) {
                    try {
                        search[key] = stringify(val)
                    } catch (err) {
                        // silent
                    }
                }
            })
        }

        const searchStr = encode(search as Record<string, string>).toString()

        return searchStr ? `?${searchStr}` : ''
    }
}
