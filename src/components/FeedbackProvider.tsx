import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Link, useLocation } from 'react-router-dom'
import { IconCheck, IconPlayerPlay } from '@tabler/icons-react'
import { Feedback, FeedbackContext } from '../hooks/useFeedback'
import { formatRestTime, useRestTimer } from '../hooks/useRestTimer'

export function FeedbackProvider({ children }: PropsWithChildren) {
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const toastRef = useRef<HTMLDivElement>(null)
  const timer = useRestTimer()
  const location = useLocation()
  const dismissFeedback = useCallback(() => setFeedback(null), [])
  const showFeedback = useCallback(
    (value: Feedback) => setFeedback({ ...value }),
    []
  )
  const value = useMemo(
    () => ({ feedback, showFeedback, dismissFeedback }),
    [feedback, showFeedback, dismissFeedback]
  )

  useEffect(() => {
    if (!feedback) return
    const timeout = window.setTimeout(dismissFeedback, 6000)
    const outside = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !toastRef.current?.contains(event.target)
      )
        dismissFeedback()
    }
    const scroll = (event: Event) => {
      if (
        event.target instanceof Node &&
        toastRef.current?.contains(event.target)
      )
        return
      dismissFeedback()
    }
    document.addEventListener('pointerdown', outside, true)
    document.addEventListener('scroll', scroll, true)
    return () => {
      window.clearTimeout(timeout)
      document.removeEventListener('pointerdown', outside, true)
      document.removeEventListener('scroll', scroll, true)
    }
  }, [feedback, dismissFeedback])

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      {feedback && (
        <div className="toast" ref={toastRef} role="status">
          <IconCheck size={18} aria-hidden="true" className="toast-check" />
          <span className="toast-label">
            {feedback.kind === 'saved'
              ? 'Saved'
              : feedback.kind === 'deleted'
                ? 'Deleted'
                : 'Imported'}
          </span>
          {feedback.kind === 'saved' && (
            <>
              <button
                className="btn sm y"
                type="button"
                disabled={!timer.ready}
                aria-label={`Start rest timer, ${formatRestTime(timer.timer.durationSeconds * 1000)}`}
                onClick={() => {
                  timer.start()
                  dismissFeedback()
                }}
              >
                <IconPlayerPlay size={16} aria-hidden="true" />
                {formatRestTime(timer.timer.durationSeconds * 1000)}
              </button>
              {feedback.entryId && (
                <Link
                  className="btn sm toast-edit"
                  to={`/new?edit=${encodeURIComponent(feedback.entryId)}`}
                  state={{ backgroundLocation: location }}
                  onClick={dismissFeedback}
                >
                  Edit
                </Link>
              )}
            </>
          )}
        </div>
      )}
    </FeedbackContext.Provider>
  )
}
