import { useLocation, useNavigate } from 'react-router-dom'

import LoginButton from '../components/LoginButton'
import LoginLayout from '../components/LoginLayout'
import './WelcomePage.css'

function WelcomePage() {
  const navigate = useNavigate()
  const location = useLocation()

  const nickname = location.state?.nickname ?? '사용자'

  return (
    <LoginLayout>
      <div className="welcome-page">
        <section className="welcome-page__intro">
          <h1>
            반가워요, <span>{nickname}님</span>
          </h1>

          <p>오늘부터 작은 실천을 하나씩 심어 봐요!</p>
        </section>

        <div className="welcome-page__character">
          <img
            src="/qr-success-character.svg"
            alt="그루 캐릭터"
          />
        </div>

        <div className="welcome-page__action">
          <LoginButton
            onClick={() => navigate('/main', { replace: true })}
          >
            홈으로
          </LoginButton>
        </div>
      </div>
    </LoginLayout>
  )
}

export default WelcomePage