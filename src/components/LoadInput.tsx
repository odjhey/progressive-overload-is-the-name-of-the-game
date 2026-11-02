import { useState } from 'react'
import { QTY_UNIT, parseLoad, unitLabel } from './dailyFlow'

// The big load value: shows the stepped number and accepts a typed one.
// Typed text that does not parse stays visible and marked invalid; the
// group keeps its last valid value, and leaving the field restores it.
export function LoadInput({
  value,
  unit,
  label,
  disabled,
  onChange,
}: {
  value: number
  unit: string
  label: string
  disabled: boolean
  onChange: (value: number) => void
}) {
  const [text, setText] = useState<string | null>(null)
  const qty = unit === QTY_UNIT
  const shown = text ?? String(value)
  const invalid = text !== null && parseLoad(text, unit) === null
  return (
    <label className="wnum">
      <input
        className="wnum-input"
        type="text"
        inputMode={qty ? 'numeric' : 'decimal'}
        pattern={qty ? '[0-9]*' : undefined}
        autoComplete="off"
        aria-label={label}
        aria-invalid={invalid || undefined}
        title={qty ? 'Whole number' : 'Number, decimals allowed'}
        size={Math.max(2, shown.length)}
        value={shown}
        disabled={disabled}
        onFocus={(event) => event.target.select()}
        onChange={(event) => {
          setText(event.target.value)
          const parsed = parseLoad(event.target.value, unit)
          if (parsed !== null) onChange(parsed)
        }}
        onBlur={() => setText(null)}
      />
      <small>{unitLabel(unit)}</small>
    </label>
  )
}
