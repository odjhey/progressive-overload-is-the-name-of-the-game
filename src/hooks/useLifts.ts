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
            console.log(d)
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

    return { loading, data, error, saveLifts }
}