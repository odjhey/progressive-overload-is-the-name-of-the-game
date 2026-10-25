import { useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

export const UpdatePrompt = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()
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
    setUpdating(true)
    setError('')
    try {
      await updateServiceWorker(true)
    } catch {
      setError('The update could not be applied. Keep this app open and try again.')
      setUpdating(false)
    }
  }

  return (
    <aside
      aria-label="App update"
      className="fixed bottom-20 left-2 right-2 z-50 mx-auto max-w-lg rounded border border-primary bg-base-100 p-3 shadow-lg"
    >
      <p role="status">An update is ready. Save your workout before reloading.</p>
      {error && <p role="alert">{error}</p>}
      <div className="mt-2 flex gap-2">
        <button className="btn btn-sm btn-primary" disabled={updating} onClick={update}>
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
