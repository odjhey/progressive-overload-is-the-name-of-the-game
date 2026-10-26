import { useEffect, useRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'

export function StepButton({
  onStep,
  children,
  ...props
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> & {
  onStep: () => void
}) {
  const delay = useRef<number>()
  const interval = useRef<number>()
  const held = useRef(false)
  const action = useRef(onStep)
  action.current = onStep
  const stop = () => {
    clearTimeout(delay.current)
    clearInterval(interval.current)
  }
  useEffect(() => stop, [])
  useEffect(() => {
    if (props.disabled) stop()
  }, [props.disabled])
  return (
    <button
      {...props}
      type="button"
      onPointerDown={(event) => {
        if (event.button !== 0) return
        held.current = true
        action.current()
        event.currentTarget.setPointerCapture(event.pointerId)
        delay.current = window.setTimeout(() => {
          action.current()
          interval.current = window.setInterval(() => action.current(), 120)
        }, 400)
      }}
      onPointerUp={stop}
      onPointerCancel={stop}
      onLostPointerCapture={stop}
      onContextMenu={(event) => event.preventDefault()}
      onClick={(event) => {
        if (event.detail === 0 || !held.current) action.current()
        held.current = false
      }}
    >
      {children}
    </button>
  )
}
