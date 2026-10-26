import { IconX } from '@tabler/icons-react'
import { useRef, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { Sheet } from './Sheet'

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
  const [confirming, setConfirming] = useState(false)

  if (!needRefresh) return null

  const update = async () => {
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
    <>
      <aside aria-label="App update" className="update-prompt">
        <p role="status">Update ready</p>
        {error && (
          <p className="recovery-error" role="alert">
            {error}
          </p>
        )}
        <div className="recovery-actions">
          <button
            type="button"
            className="btn y"
            disabled={updating}
            onClick={() => setConfirming(true)}
          >
            {updating ? 'Updating…' : 'Update now'}
          </button>
          <button
            type="button"
            className="btn"
            disabled={updating}
            onClick={() => setNeedRefresh(false)}
          >
            Later
          </button>
        </div>
      </aside>
      {confirming && (
        <Sheet
          title="Reload to update?"
          onClose={() => {
            if (!updating) setConfirming(false)
          }}
        >
          <header className="sh-h">
            <h2>Reload to update?</h2>
            <button
              className="ib ghost"
              type="button"
              aria-label="Close update confirmation"
              disabled={updating}
              onClick={() => setConfirming(false)}
            >
              <IconX className="ic" aria-hidden="true" />
            </button>
          </header>
          <div className="confirm">
            <p>
              <b>Save unfinished entries first.</b>Updating reloads the app.
              Unsaved changes can be lost; stored history is not cleared.
            </p>
            {error && (
              <p className="recovery-error" role="alert">
                {error}
              </p>
            )}
            <div className="recovery-actions">
              <button
                type="button"
                className="btn lg"
                disabled={updating}
                onClick={() => setConfirming(false)}
              >
                Keep working
              </button>
              <button
                type="button"
                className="btn lg y"
                disabled={updating}
                onClick={update}
              >
                {updating ? 'Updating…' : 'Reload now'}
              </button>
            </div>
          </div>
        </Sheet>
      )}
    </>
  )
}
