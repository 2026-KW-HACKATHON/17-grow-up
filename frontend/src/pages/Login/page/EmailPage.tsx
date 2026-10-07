import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import LoginButton from '../components/LoginButton'
import LoginFooter from '../components/LoginFooter'
import LoginInput from '../components/LoginInput'
import LoginLayout from '../components/LoginLayout'
import './EmailPage.css'

function EmailPage() {
  const navigate = useNavigate()
  const [loginId, setLoginId] = useState('')

  const handleNext = () => {
    navigate('/signup/password', {
      state: { loginId },
    })
  }

  return (
    <LoginLayout>
      <div className="email-page">
        <section className="email-page__intro">
          <h1>이메일을 입력해 주세요</h1>
          <p>로그인 및 회원가입에 쓰일 예정이에요.</p>
        </section>

        <LoginInput
          placeholder="이메일"
          value={loginId}
          onChange={setLoginId}
        />

        <div className="email-page__action">
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

export default EmailPage