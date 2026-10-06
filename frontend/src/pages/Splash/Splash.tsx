import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Splash.css'

function Splash() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login', { replace: true })
    }, 3000)

    return () => {
      clearTimeout(timer)
    }
  }, [navigate])

  return (
    <main className="splash">
      <img
        className="splash__logo"
        src="/growup-logo.svg"
        alt="그루업"
      />
    </main>
  )
}

export default Splash