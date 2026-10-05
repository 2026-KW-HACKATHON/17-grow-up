import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import './LoginLayout.css'

interface LoginLayoutProps {
  children: ReactNode
  showBack?: boolean
}

function LoginLayout({
  children,
  showBack = false,
}: LoginLayoutProps) {
  const navigate = useNavigate()

  return (
    <main className="login-layout">
      {showBack && (
        <button
          className="login-layout__back"
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
        >
          <img
            src="/chevron-left.svg"
            alt=""
          />
        </button>
      )}

      <div className="login-layout__content">
        {children}
      </div>

      <img
        className="login-layout__logo"
        src="/growup-logo.svg"
        alt="그루업"
      />
    </main>
  )
}

export default LoginLayout