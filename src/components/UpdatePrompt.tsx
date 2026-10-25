import { useRef, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

export const UpdatePrompt = () => {
  const reloadApproved = useRef(false)
  const reloading = useRef(false)
  const reload = () => {
    if (!reloading.current) {
      reloading.current = true
      window.location.reload()
    }
  }
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onNeedReload() {
      if (reloadApproved.current) {
        reload()
      } else {
        setNeedRefresh(true)
      }
    },
  })
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')

  if (!needRefresh) return null

  const update = async () => {
    if (
      !window.confirm(
        'Updating reloads the app. Save any unfinished workout first. Reload now?'
      )
    ) {
      return
    }
    reloadApproved.current = true
    setUpdating(true)
    setError('')
    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (!registration?.active) throw new Error('No active worker')
      const waiting = registration.waiting
      if (!waiting) {
        reload()
        return
      }
      const activated = () => {
        if (waiting.state === 'activated') {
          waiting.removeEventListener('statechange', activated)
          if (reloadApproved.current) reload()
        } else if (waiting.state === 'redundant') {
          waiting.removeEventListener('statechange', activated)
          reloadApproved.current = false
          setError(
            'The update was superseded. Keep this app open and try again.'
          )
          setUpdating(false)
        }
      }
      waiting.addEventListener('statechange', activated)
      try {
        await updateServiceWorker(true)
      } catch (cause) {
        waiting.removeEventListener('statechange', activated)
        throw cause
      }
    } catch {
      reloadApproved.current = false
      setError(
        'The update could not be applied. Keep this app open and try again.'
      )
      setUpdating(false)
    }
  }

  return (
    <aside
      aria-label="App update"
      className="fixed bottom-20 left-2 right-2 z-50 mx-auto max-w-lg rounded border border-primary bg-base-100 p-3 shadow-lg"
    >
      <p role="status">
        An update is ready. Save your workout before reloading.
      </p>
      {error && <p role="alert">{error}</p>}
      <div className="mt-2 flex gap-2">
        <button
          className="btn btn-sm btn-primary"
          disabled={updating}
          onClick={update}
        >
          {updating ? 'Updating…' : 'Update now'}
        </button>
        <button
          className="btn btn-sm"
          disabled={updating}
          onClick={() => setNeedRefresh(false)}
        >
          Later
        </button>
      </div>
    </aside>
  )
}
