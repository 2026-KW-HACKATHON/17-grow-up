import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../../../components/BottomNav/BottomNav'
import './PasswordChangePage.css'

function PasswordChangePage() {
  const navigate = useNavigate()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  const handleSave = () => {
    // 추후 비밀번호 변경 API 연결 후
    // 변경 성공 시 비밀번호 변경 페이지를 히스토리에서 제거하고
    // 사용자 정보 페이지로 이동
    navigate('/my/user-info', { replace: true })
  }

  return (
    <div className="password-change-page">
      <main className="password-change-page__content">
        <button
          type="button"
          className="password-change-page__back"
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
        >
          <img src="/chevron-left.svg" alt="" />
        </button>

        <h1 className="password-change-page__title">
          비밀번호 변경
        </h1>

        <section className="password-change-page__form">
          <div className="password-change-page__field">
            <label
              className="password-change-page__label"
              htmlFor="current-password"
            >
              현재 비밀번호
            </label>

            <div className="password-change-page__input-row">
              <input
                id="current-password"
                className="password-change-page__input"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />

              <button
                type="button"
                className="password-change-page__eye"
                onClick={() =>
                  setShowCurrentPassword((prev) => !prev)
                }
                aria-label={
                  showCurrentPassword
                    ? '현재 비밀번호 숨기기'
                    : '현재 비밀번호 보기'
                }
              >
                <img src="/eye.svg" alt="" />
              </button>
            </div>
          </div>

          <div className="password-change-page__field">
            <label
              className="password-change-page__label"
              htmlFor="new-password"
            >
              새 비밀번호
            </label>

            <div className="password-change-page__input-row">
              <input
                id="new-password"
                className="password-change-page__input"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />

              <button
                type="button"
                className="password-change-page__eye"
                onClick={() =>
                  setShowNewPassword((prev) => !prev)
                }
                aria-label={
                  showNewPassword
                    ? '새 비밀번호 숨기기'
                    : '새 비밀번호 보기'
                }
              >
                <img src="/eye.svg" alt="" />
              </button>
            </div>
          </div>

          <button
            type="button"
            className="password-change-page__save"
            onClick={handleSave}
          >
            저장
          </button>
        </section>
      </main>

      <BottomNav active="my" />
    </div>
  )
}

export default PasswordChangePage