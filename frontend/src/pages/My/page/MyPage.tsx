
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import BottomNav from '../../../components/BottomNav/BottomNav'
import { getMyInfo } from '../../../api/userApi'
import MyMenuItem from '../components/MyMenuItem'
import LogoutModal from '../components/LogoutModal'
import ProfileEditModal from '../components/ProfileEditModal'
import './MyPage.css'

function MyPage() {
  const navigate = useNavigate()

  const [nickname, setNickname] = useState('')
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [isProfileEditModalOpen, setIsProfileEditModalOpen] =
    useState(false)

  useEffect(() => {
    const fetchMyInfo = async () => {
      try {
        const data = await getMyInfo()
        setNickname(data.nickname)
      } catch (error) {
        console.error('내 정보 조회 실패:', error)
      }
    }

    fetchMyInfo()
  }, [])

  const handleUserInfoClick = () => {
    navigate('/my/user-info')
  }

  const handleRecordClick = () => {
    navigate('/record')
  }

  const handleFriendClick = () => {
    navigate('/record/friend-add')
  }

  const handleProfileEditClick = () => {
    setIsProfileEditModalOpen(true)
  }

  const handleProfileEditClose = () => {
    setIsProfileEditModalOpen(false)
  }

  const handleNicknameUpdate = (newNickname: string) => {
    setNickname(newNickname)
  }

  const handleLogoutClick = () => {
    setIsLogoutModalOpen(true)
  }

  const handleLogoutCancel = () => {
    setIsLogoutModalOpen(false)
  }

  const handleLogoutConfirm = () => {
    localStorage.removeItem('accessToken')
    setIsLogoutModalOpen(false)
    navigate('/login', { replace: true })
  }

  return (
    <div className="my-page">
      <main className="my-page__content">
        <section className="my-page__profile">
          <img
            className="my-page__character"
            src="/profile-character.svg"
            alt="프로필 캐릭터"
          />

          <div className="my-page__profile-info">
            <strong className="my-page__name">{nickname}</strong>

            <button
              type="button"
              className="my-page__edit-button"
              onClick={handleProfileEditClick}
            >
              프로필 수정
            </button>
          </div>
        </section>

        <section className="my-page__settings">
          <h1 className="my-page__settings-title">MY 설정</h1>

          <div className="my-page__settings-card">
            <MyMenuItem
              icon="/user.svg"
              label="사용자 정보"
              onClick={handleUserInfoClick}
            />

            <MyMenuItem
              icon="/friend.svg"
              label="친구 관리"
              onClick={handleFriendClick}
            />

            <MyMenuItem
              icon="/history.svg"
              label="나의 기록"
              onClick={handleRecordClick}
            />

            <MyMenuItem
              icon="/logout.svg"
              label="로그아웃"
              onClick={handleLogoutClick}
              isLast
            />
          </div>
        </section>
      </main>

      <BottomNav active="my" />

      {isProfileEditModalOpen && (
        <ProfileEditModal
          currentNickname={nickname}
          onNicknameUpdate={handleNicknameUpdate}
          onClose={handleProfileEditClose}
        />
      )}

      {isLogoutModalOpen && (
        <LogoutModal
          onConfirm={handleLogoutConfirm}
          onCancel={handleLogoutCancel}
        />
      )}
    </div>
  )
}

export default MyPage
