import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import BottomNav from '../../../components/BottomNav/BottomNav'
import { updatePassword } from '../../../api/userApi'
import './PasswordChangePage.css'

function PasswordChangePage() {
  const navigate = useNavigate()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('')

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showNewPasswordConfirm, setShowNewPasswordConfirm] =
    useState(false)

  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    if (isLoading) return

    if (!currentPassword || !newPassword || !newPasswordConfirm) {
      alert('비밀번호를 모두 입력해 주세요.')
      return
    }

    if (newPassword !== newPasswordConfirm) {
      alert('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.')
      return
    }

    try {
      setIsLoading(true)

      await updatePassword({
        currentPassword,
        newPassword,
        newPasswordConfirm,
      })

      alert('비밀번호가 변경되었습니다.')
      navigate('/my/user-info', { replace: true })
    } catch (error) {
      console.error('비밀번호 변경 실패:', error)

      if (error instanceof Error) {
        if (error.message === 'CURRENT_PASSWORD_MISMATCH') {
          alert('현재 비밀번호가 일치하지 않습니다.')
          return
        }

        if (error.message === 'PASSWORD_CONFIRM_MISMATCH') {
          alert('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.')
          return
        }

        if (error.message === 'SAME_AS_OLD_PASSWORD') {
          alert('새 비밀번호는 기존 비밀번호와 다르게 설정해 주세요.')
          return
        }

        if (error.message === 'VALIDATION_ERROR') {
          alert('비밀번호 형식이 올바르지 않습니다.')
          return
        }
      }

      alert('비밀번호 변경에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
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

          <div className="password-change-page__field">
            <label
              className="password-change-page__label"
              htmlFor="new-password-confirm"
            >
              새 비밀번호 확인
            </label>

            <div className="password-change-page__input-row">
              <input
                id="new-password-confirm"
                className="password-change-page__input"
                type={showNewPasswordConfirm ? 'text' : 'password'}
                value={newPasswordConfirm}
                onChange={(e) =>
                  setNewPasswordConfirm(e.target.value)
                }
                autoComplete="new-password"
              />

              <button
                type="button"
                className="password-change-page__eye"
                onClick={() =>
                  setShowNewPasswordConfirm((prev) => !prev)
                }
                aria-label={
                  showNewPasswordConfirm
                    ? '새 비밀번호 확인 숨기기'
                    : '새 비밀번호 확인 보기'
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
            disabled={isLoading}
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