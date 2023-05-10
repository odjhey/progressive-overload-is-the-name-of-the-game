import {
  PropsWithChildren,
  createContext,
  useCallback,
  useEffect,
  useState,
} from 'react'
import { Link } from 'react-router-dom'
import * as Toast from '@radix-ui/react-toast'

export const ToastContext = createContext()

const useToast = () => {}

const ToastWrapper = ({ children }: PropsWithChildren) => {
  const [messages, setMessages] = useState<{ message: string }[]>([])

  const toast = useCallback(
    (message: string) => {
      setMessages((prev) => [...prev, { message }])
    },
    [setMessages]
  )

  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        setMessages((prev) => prev.slice(1))
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [messages])

  return (
    <ToastContext.Provider value={{ toast }}>
      <Toast.Provider swipeDirection="right">
        {children}
        {messages.map((m) => {
          return (
            <Toast.Root open={true}>
              <Toast.Title>{m.message}</Toast.Title>
              <Toast.Description asChild>{m.message}</Toast.Description>
            </Toast.Root>
          )
        })}
        <Toast.Viewport className="fixed bottom-5 flex flex-col w-full items-center"></Toast.Viewport>
      </Toast.Provider>
    </ToastContext.Provider>
  )
}

export default function Nav({ children }: PropsWithChildren) {
  return (
    <>
      <div>
        <nav>
          <ol className="flex gap-4 p-2 bg-primary">
            <li className="text-primary-content">
              <Link to="/">Home</Link>
            </li>
            <li className="text-primary-content">
              <Link to="/latest">Lasts</Link>
            </li>
            <li className="text-primary-content">
              <Link to="/search">Search</Link>
            </li>
            <li className="text-primary-content">
              <Link to="/new">New</Link>
            </li>
            <li className="text-primary-content">
              <Link to="/tags">Tags</Link>
            </li>
            <li className="text-primary-content">
              <Link to="/about">About</Link>
            </li>
          </ol>
        </nav>
      </div>

      <ToastWrapper>{children}</ToastWrapper>
    </>
  )
}
