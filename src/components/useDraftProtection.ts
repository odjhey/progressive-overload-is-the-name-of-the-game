import { useCallback, useRef, useState } from 'react'
import { useBeforeUnload, useBlocker } from 'react-router-dom'

export function useDraftProtection(dirty: boolean, pending: boolean) {
  const allowed = useRef(false)
  const [closing, setClosing] = useState<{ action: () => void } | null>(null)
  const blocker = useBlocker(() => !allowed.current && (dirty || pending))
  useBeforeUnload(
    useCallback(
      (event) => {
        if (!allowed.current && (dirty || pending)) {
          event.preventDefault()
          event.returnValue = ''
        }
      },
      [dirty, pending]
    )
  )
  return {
    showing: closing !== null || blocker.state === 'blocked',
    pending,
    allow: () => {
      allowed.current = true
    },
    close: (action: () => void) => {
      if (pending || dirty) setClosing({ action })
      else action()
    },
    keep: () => {
      setClosing(null)
      if (blocker.state === 'blocked') blocker.reset()
    },
    discard: () => {
      if (pending) return
      allowed.current = true
      if (blocker.state === 'blocked') blocker.proceed()
      else closing?.action()
      setClosing(null)
    },
  }
}
