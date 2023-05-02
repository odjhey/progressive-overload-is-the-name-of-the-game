import localforage from "localforage"
import { useEffect, useState } from "react"


// TODO: add version support
// TODO: fix typescript
const lskey = 'ZLDKSJF'
export const useLifts = () => {

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error>()
    const [data, setData] = useState<unknown[]>([])

    const reloadItem = () => {
        return localforage.getItem(lskey).then((d: any) => {
            const defaultLifts: any[] = []
            if (d && d.lifts) {
                return d.lifts
            }
            return defaultLifts
        }).then(d => {
            setData(d)
        })
    }

    useEffect(() => {
        setLoading(true)
        reloadItem()
            .catch(e => {
                setError(e)
            }).finally(() => {
                setLoading(false)
            })
    }, [])

    const saveLifts = (lifts: any[]) => {
        setLoading(true)
        return localforage.setItem(lskey, { lifts })
            .catch(e => {
                setError(e)
            }).then(() => {
                // reload
                return reloadItem()
            }).finally(() => { setLoading(false) })
    }

    const appendLift = (lift: any, options?: {
        onSuccess: (lift: any) => void
    }) => {
        setLoading(true)
        return localforage.setItem(lskey, { lifts: [...data, lift] })
            .catch(e => {
                setError(e)
            }).then((_) => {
                // reload
                reloadItem()
                if (options && typeof options.onSuccess === 'function') {
                    options.onSuccess(lift)
                }
            }).finally(() => { setLoading(false) })

    }

    return { loading, data, error, saveLifts, appendLift }
}