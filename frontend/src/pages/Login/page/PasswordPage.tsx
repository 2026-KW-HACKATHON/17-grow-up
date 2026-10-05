import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import LoginButton from '../components/LoginButton'
import LoginFooter from '../components/LoginFooter'
import LoginInput from '../components/LoginInput'
import LoginLayout from '../components/LoginLayout'
import './PasswordPage.css'

function PasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const email = location.state?.email ?? ''

  const [password, setPassword] = useState('')
  const [passwordCheck, setPasswordCheck] = useState('')

  const handleNext = () => {
    navigate('/signup/nickname', {
      state: {
        email,
        password,
      },
    })
  }

  return (
    <LoginLayout showBack>
      <div className="password-page">
        <section className="password-page__intro">
          <h1>비밀번호를 설정해 주세요</h1>
          <p>영문과 숫자를 포함해 8자 이상 입력해 주세요.</p>
        </section>

        <div className="password-page__inputs">
          <LoginInput
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={setPassword}
          />

          <LoginInput
            type="password"
            placeholder="비밀번호 확인"
            value={passwordCheck}
            onChange={setPasswordCheck}
          />
        </div>

        <div className="password-page__action">
          <LoginButton onClick={handleNext}>
            다음
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

export default PasswordPage