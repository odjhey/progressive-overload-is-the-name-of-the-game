import { IconCheck, IconPlus } from '@tabler/icons-react'
import { withTypedTag } from './dailyFlow'

export function TagPicker({
  tags,
  knownTags,
  value,
  onValueChange,
  disabled = false,
  onChange,
}: {
  tags: string[]
  knownTags: string[]
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
  onChange: (tags: string[]) => Promise<boolean> | boolean
}) {
  const choices = [...new Set([...tags, ...knownTags])].sort(
    (a, b) =>
      Number(tags.includes(b)) - Number(tags.includes(a)) || a.localeCompare(b)
  )
  const add = async () => {
    const next = withTypedTag(tags, choices, value)
    if (next === tags || (await onChange(next))) onValueChange('')
  }
  return (
    <div className="tag-picker">
      <div className="chips tag-choices">
        {choices.map((tag) => (
          <button
            key={tag}
            type="button"
            className={`chip${tags.includes(tag) ? ' on' : ''}`}
            aria-pressed={tags.includes(tag)}
            disabled={disabled}
            onClick={() => {
              void onChange(
                tags.includes(tag)
                  ? tags.filter((item) => item !== tag)
                  : [...tags, tag]
              )
            }}
          >
            {tags.includes(tag) && <IconCheck size={16} aria-hidden="true" />}
            {tag}
          </button>
        ))}
      </div>
      <div className="entry-tools">
        <input
          className="field"
          aria-label="New tag"
          placeholder="New tag"
          value={value}
          disabled={disabled}
          onChange={(event) => onValueChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              void add()
            }
          }}
        />
        <button
          type="button"
          className="ib"
          aria-label="Add tag"
          disabled={disabled || !value.trim()}
          onClick={() => {
            void add()
          }}
        >
          <IconPlus size={20} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
