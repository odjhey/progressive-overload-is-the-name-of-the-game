import { ReactNode, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const openSheets: HTMLElement[] = []
const focusableSelector =
  'a[href], button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), summary, [tabindex]:not([tabindex="-1"])'

type SheetProps = {
  title: string
  children: ReactNode
  onClose: () => void
  className?: string
  initialFocus?: string
  returnFocus?: HTMLElement | null
}

export function Sheet({
  title,
  children,
  onClose,
  className = '',
  initialFocus,
  returnFocus,
}: SheetProps) {
  const [host] = useState(() => document.createElement('div'))
  const sheetRef = useRef<HTMLElement>(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose
  const initialFocusRef = useRef(initialFocus)
  const returnFocusRef = useRef(returnFocus)

  useLayoutEffect(() => {
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    const focusTarget = returnFocusRef.current ?? previousFocus
    host.className = 'sheet-layer'
    document.body.append(host)
    const sheet = sheetRef.current!
    openSheets.push(sheet)
    const background = Array.from(document.body.children)
      .filter(
        (element): element is HTMLElement =>
          element instanceof HTMLElement && element !== host
      )
      .map((element) => ({
        element,
        inert: element.getAttribute('inert'),
        hidden: element.getAttribute('aria-hidden'),
      }))
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // Focus the container by default: opening Repeat must not summon a keyboard.
    let target: HTMLElement | null = null
    if (initialFocusRef.current) {
      try {
        target = sheet.querySelector<HTMLElement>(initialFocusRef.current)
      } catch {
        /* Invalid selectors fall back to the sheet. */
      }
    }
    ;(target ?? sheet).focus({ preventScroll: true })
    background.forEach(({ element }) => {
      element.setAttribute('inert', '')
      element.setAttribute('aria-hidden', 'true')
    })
    const focusable = () =>
      Array.from(sheet.querySelectorAll<HTMLElement>(focusableSelector)).filter(
        (element) =>
          element.tabIndex >= 0 &&
          element.getClientRects().length > 0 &&
          !element.closest('[inert], [hidden]')
      )
    const onKeyDown = (event: KeyboardEvent) => {
      if (openSheets[openSheets.length - 1] !== sheet) return
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        closeRef.current()
      } else if (event.key === 'Tab') {
        const targets = focusable()
        const first = targets[0]
        const last = targets[targets.length - 1]
        if (!first) {
          event.preventDefault()
          sheet.focus()
        } else if (
          event.shiftKey &&
          (document.activeElement === first || document.activeElement === sheet)
        ) {
          event.preventDefault()
          last.focus()
        } else if (
          !event.shiftKey &&
          (document.activeElement === last || document.activeElement === sheet)
        ) {
          event.preventDefault()
          first.focus()
        }
      }
    }
    const onFocus = (event: FocusEvent) => {
      if (
        openSheets[openSheets.length - 1] === sheet &&
        event.target instanceof Node &&
        !sheet.contains(event.target)
      ) {
        sheet.focus({ preventScroll: true })
      }
    }
    document.addEventListener('keydown', onKeyDown, true)
    document.addEventListener('focusin', onFocus)
    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      document.removeEventListener('focusin', onFocus)
      openSheets.splice(openSheets.indexOf(sheet), 1)
      background.forEach(({ element, inert, hidden }) => {
        if (inert === null) element.removeAttribute('inert')
        else element.setAttribute('inert', inert)
        if (hidden === null) element.removeAttribute('aria-hidden')
        else element.setAttribute('aria-hidden', hidden)
      })
      document.body.style.overflow = overflow
      host.remove()
      if (focusTarget?.isConnected) focusTarget.focus({ preventScroll: true })
    }
  }, [host])

  return createPortal(
    <>
      <div
        className="scrim"
        aria-hidden="true"
        onClick={() => closeRef.current()}
      />
      <section
        ref={sheetRef}
        className={`sheet ${className}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
      >
        <div className="handle" aria-hidden="true" />
        {children}
      </section>
    </>,
    host
  )
}
