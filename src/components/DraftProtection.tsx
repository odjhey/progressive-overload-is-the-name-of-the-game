import { useEffect, useRef } from 'react'

export type DraftGuard = {
  showing: boolean
  pending: boolean
  keep: () => void
  discard: () => void
}

export function DiscardConfirm({ guard }: { guard: DraftGuard }) {
  const keep = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (guard.showing) keep.current?.focus()
  }, [guard.showing])
  if (!guard.showing) return null
  return (
    <section
      className="confirm"
      role="alertdialog"
      aria-label="Unsaved changes"
      aria-describedby="discard-description"
    >
      <p id="discard-description">
        <b>
          {guard.pending
            ? 'A change is still in progress'
            : 'Discard unsaved changes?'}
        </b>
        {guard.pending
          ? 'Stay here until its result is known.'
          : 'Your unsaved values will be lost.'}
      </p>
      <div className="counter-grid">
        <button
          ref={keep}
          type="button"
          className="btn lg"
          onClick={guard.keep}
        >
          Keep editing
        </button>
        <button
          type="button"
          className="btn danger lg"
          disabled={guard.pending}
          onClick={guard.discard}
        >
          Discard
        </button>
      </div>
    </section>
  )
}
