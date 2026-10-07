import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import BottomNav from '../../../components/BottomNav/BottomNav'
import { getMyInfo } from '../../../api/userApi'
import './UserInfoPage.css'

function UserInfoPage() {
  const navigate = useNavigate()

  const [loginId, setLoginId] = useState('')

  useEffect(() => {
    const fetchMyInfo = async () => {
      try {
        const data = await getMyInfo()
        setLoginId(data.loginId)
      } catch (error) {
        console.error('내 정보 조회 실패:', error)
      }
    }

    fetchMyInfo()
  }, [])

  const handleBack = () => {
    navigate(-1)
  }

  const handlePasswordChange = () => {
    navigate('/my/user-info/password')
  }

  return (
    <div className="user-info-page">
      <main className="user-info-page__content">
        <button
          type="button"
          className="user-info-page__back"
          onClick={handleBack}
          aria-label="뒤로가기"
        >
          <img src="/chevron-left.svg" alt="" />
        </button>

        <h1 className="user-info-page__title">사용자 정보</h1>

        <section className="user-info-page__info">
          <div className="user-info-page__email">
            <strong className="user-info-page__label">이메일</strong>
            <span className="user-info-page__email-value">
              {loginId}
            </span>
          </div>

          <div className="user-info-page__divider" />

          <button
            type="button"
            className="user-info-page__password"
            onClick={handlePasswordChange}
          >
            <span>비밀번호 변경</span>
            <img src="/edit.svg" alt="" />
          </button>
        </section>
      </main>

      <BottomNav active="my" />
    </div>
  )
}

export default UserInfoPage