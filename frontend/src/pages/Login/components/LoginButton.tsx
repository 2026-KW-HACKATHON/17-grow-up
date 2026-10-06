import type { ReactNode } from 'react'
import './LoginButton.css'

interface LoginButtonProps {
  children: ReactNode
  onClick?: () => void
}

function LoginButton({ children, onClick }: LoginButtonProps) {
  return (
    <button
      className="login-button"
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export default LoginButton