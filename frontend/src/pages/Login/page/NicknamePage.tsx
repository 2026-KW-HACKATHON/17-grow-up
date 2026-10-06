import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import LoginButton from '../components/LoginButton'
import LoginFooter from '../components/LoginFooter'
import LoginLayout from '../components/LoginLayout'
import './NicknamePage.css'

type NicknameStatus = 'idle' | 'available' | 'unavailable'

function NicknamePage() {
  const navigate = useNavigate()
  const location = useLocation()

  const email = location.state?.email ?? ''
  const password = location.state?.password ?? ''

  const [nickname, setNickname] = useState('')
  const [status, setStatus] = useState<NicknameStatus>('idle')

  const handleCheckNickname = () => {
    if (!nickname.trim()) {
      setStatus('unavailable')
      return
    }

    setStatus('available')
  }

  const handleComplete = () => {
    navigate('/signup/welcome', {
      state: {
        email,
        password,
        nickname,
      },
    })
  }

  return (
    <LoginLayout showBack>
      <div className="nickname-page">
        <section className="nickname-page__intro">
          <h1>닉네임을 설정해 주세요</h1>
          <p>한글, 영문, 숫자를 사용해 2~10자로 입력해 주세요.</p>
        </section>

        <div className="nickname-page__field">
          <input
            className="nickname-page__input"
            type="text"
            placeholder="닉네임"
            value={nickname}
            maxLength={10}
            onChange={(event) => {
              setNickname(event.target.value)
              setStatus('idle')
            }}
          />

          <button
            className="nickname-page__check"
            type="button"
            onClick={handleCheckNickname}
          >
            중복 확인
          </button>
        </div>

        {status === 'available' && (
          <p className="nickname-page__message nickname-page__message--success">
            사용 가능 닉네임입니다!
          </p>
        )}

        {status === 'unavailable' && (
          <p className="nickname-page__message nickname-page__message--error">
            사용 불가 닉네임입니다.
          </p>
        )}

        <div className="nickname-page__action">
          <LoginButton onClick={handleComplete}>
            확인
          </LoginButton>

          <LoginFooter
            text="이미 계정이 있으신가요?"
            linkText="로그인"
            onClick={() => navigate('/login')}
          />
        </div>
      </div>
    </LoginLayout>
  )
}

export default NicknamePage