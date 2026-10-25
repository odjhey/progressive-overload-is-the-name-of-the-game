export function downloadFile(
  filename: string,
  text: string,
  type = 'application/json'
) {
  const url = URL.createObjectURL(
    new Blob([text], { type: `${type};charset=utf-8` })
  )
  const element = document.createElement('a')
  element.href = url
  element.download = filename
  document.body.appendChild(element)
  element.click()
  element.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
