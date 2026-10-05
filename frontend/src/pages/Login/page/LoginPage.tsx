import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import LoginButton from '../components/LoginButton'
import LoginFooter from '../components/LoginFooter'
import LoginInput from '../components/LoginInput'
import LoginLayout from '../components/LoginLayout'
import './LoginPage.css'

function LoginPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <LoginLayout>
      <div className="login-page">
        <section className="login-page__intro">
          <h1>
            우리 동네를 바꾸는 <span>작은 실천,</span>
            <br />
            시작해볼까요?
          </h1>

          <p>
            일상 속 탄소중립 실천을 인증하고,
            <br />
            포인트를 모아 나만의 그루를 키워보세요.
          </p>
        </section>

        <div className="login-page__inputs">
          <LoginInput
            placeholder="이메일"
            value={email}
            onChange={setEmail}
          />

          <LoginInput
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={setPassword}
          />
        </div>

        <div className="login-page__action">
          <LoginButton onClick={() => navigate('/main')}>
            로그인
          </LoginButton>

          <LoginFooter
            text="아직 계정이 없으신가요?"
            linkText="회원가입"
            onClick={() => navigate('/signup')}
          />
        </div>
      </div>
    </LoginLayout>
  )
}

export default LoginPage