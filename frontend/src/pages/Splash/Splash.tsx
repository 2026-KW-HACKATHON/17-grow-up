import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import './Splash.css'

function Splash() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      const accessToken = localStorage.getItem('accessToken')

      if (accessToken) {
        navigate('/main', { replace: true })
      } else {
        navigate('/login', { replace: true })
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="splash">
      <img
        className="splash__logo"
        src="/growup-logo.svg"
        alt="그루업"
      />
    </div>
  )
}

export default Splash