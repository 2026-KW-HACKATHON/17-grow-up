import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { signup } from '../../../api/loginApi'
import LoginButton from '../components/LoginButton'
import LoginFooter from '../components/LoginFooter'
import LoginLayout from '../components/LoginLayout'
import './NicknamePage.css'

type NicknameStatus = 'idle' | 'available' | 'unavailable'

function NicknamePage() {
  const navigate = useNavigate()
  const location = useLocation()

  const loginId = location.state?.loginId ?? ''
  const password = location.state?.password ?? ''

  const [nickname, setNickname] = useState('')
  const [status, setStatus] = useState<NicknameStatus>('idle')
  const [isLoading, setIsLoading] = useState(false)

  const handleCheckNickname = () => {
    if (!nickname.trim()) {
      setStatus('unavailable')
      return
    }

    setStatus('available')
  }

  const handleComplete = async () => {
    if (status !== 'available') {
      alert('닉네임을 확인해 주세요.')
      return
    }

    if (!loginId || !password) {
      alert('회원가입 정보를 다시 입력해 주세요.')
      navigate('/signup')
      return
    }

    try {
      setIsLoading(true)

      await signup({
        loginId,
        password,
        nickname,
      })

      navigate('/login', { replace: true })
    } catch (error) {
      if (error instanceof Error) {
        switch (error.message) {
          case 'INVALID_LOGIN_ID':
            alert('이메일 형식이 올바르지 않습니다.')
            break

          case 'INVALID_PASSWORD':
            alert('비밀번호 형식이 올바르지 않습니다.')
            break

          case 'INVALID_NICKNAME':
            alert('닉네임 형식이 올바르지 않습니다.')
            break

          case 'DUPLICATE_LOGIN_ID':
            alert('이미 사용 중인 이메일입니다.')
            break

          default:
            alert('회원가입에 실패했습니다.')
        }
      }
    } finally {
      setIsLoading(false)
    }
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
            사용 가능한 닉네임입니다!
          </p>
        )}

        {status === 'unavailable' && (
          <p className="nickname-page__message nickname-page__message--error">
            사용 불가 닉네임입니다.
          </p>
        )}

        <div className="nickname-page__action">
          <LoginButton onClick={handleComplete}>
            {isLoading ? '가입 중...' : '확인'}
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