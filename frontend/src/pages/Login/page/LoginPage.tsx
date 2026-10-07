import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { login, partnerLogin } from '../../../api/loginApi'
import LoginButton from '../components/LoginButton'
import LoginFooter from '../components/LoginFooter'
import LoginInput from '../components/LoginInput'
import LoginLayout from '../components/LoginLayout'
import './LoginPage.css'

function LoginPage() {
  const navigate = useNavigate()

  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    if (isLoading) return

    if (!loginId.trim() || !password) {
      alert('아이디 또는 이메일과 비밀번호를 입력해 주세요.')
      return
    }

    try {
      setIsLoading(true)

      try {
        const data = await login({
          loginId,
          password,
        })

        localStorage.setItem('accessToken', data.accessToken)

        navigate('/signup/welcome', {
          replace: true,
          state: {
            nickname: data.user.nickname,
          },
        })

        return
      } catch (error) {
        if (!(error instanceof Error) || error.message !== 'INVALID_LOGIN') {
          throw error
        }
      }

      const partnerData = await partnerLogin({
        loginId,
        password,
      })

      localStorage.setItem('accessToken', partnerData.accessToken)

      navigate('/main', {
        replace: true,
      })
    } catch (error) {
      if (
        error instanceof Error &&
        (
          error.message === 'INVALID_LOGIN' ||
          error.message === 'INVALID_PARTNER_LOGIN'
        )
      ) {
        alert('아이디 또는 이메일, 비밀번호를 확인해 주세요.')
      } else if (
        error instanceof Error &&
        error.message === 'INACTIVE_PARTNER_ACCOUNT'
      ) {
        alert('비활성화된 제휴처 직원 계정입니다.')
      } else {
        alert('로그인에 실패했습니다.')
      }
    } finally {
      setIsLoading(false)
    }
  }

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
            placeholder="아이디 또는 이메일"
            value={loginId}
            onChange={setLoginId}
          />

          <LoginInput
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={setPassword}
          />
        </div>

        <div className="login-page__action">
          <LoginButton onClick={handleLogin}>
            {isLoading ? '로그인 중...' : '로그인'}
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