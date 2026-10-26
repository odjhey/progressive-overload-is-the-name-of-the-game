import { createContext, useContext } from 'react'

export type Feedback = {
  kind: 'saved' | 'deleted' | 'imported'
  entryId?: string
}
export type FeedbackContextValue = {
  feedback: Feedback | null
  showFeedback(value: Feedback): void
  dismissFeedback(): void
}
export const FeedbackContext = createContext<FeedbackContextValue | null>(null)

export function useFeedback(): FeedbackContextValue {
  const context = useContext(FeedbackContext)
  if (!context)
    throw new Error('useFeedback must be used inside FeedbackProvider.')
  return context
}
