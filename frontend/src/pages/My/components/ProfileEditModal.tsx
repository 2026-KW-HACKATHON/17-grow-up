import { useState } from 'react'

import { updateNickname } from '../../../api/userApi'
import './ProfileEditModal.css'

interface ProfileEditModalProps {
  currentNickname: string
  onNicknameUpdate: (nickname: string) => void
  onClose: () => void
}

function ProfileEditModal({
  currentNickname,
  onNicknameUpdate,
  onClose,
}: ProfileEditModalProps) {
  const [nickname, setNickname] = useState(currentNickname)
  const [isEditingNickname, setIsEditingNickname] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleNicknameChange = () => {
    setIsEditingNickname(true)
  }

  const handleSave = async () => {
    if (isLoading) return

    if (!isEditingNickname || nickname === currentNickname) {
      onClose()
      return
    }

    try {
      setIsLoading(true)

      const data = await updateNickname({
        nickname,
      })

      onNicknameUpdate(data.nickname)
      onClose()
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'INVALID_NICKNAME') {
          alert('닉네임 형식이 올바르지 않습니다.')
          return
        }

        if (error.message === 'UNAUTHORIZED') {
          alert('로그인이 필요합니다.')
          return
        }

        if (error.message === 'USER_NOT_FOUND') {
          alert('사용자를 찾을 수 없습니다.')
          return
        }
      }

      alert('닉네임 수정에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    onClose()
  }

  return (
    <div className="profile-edit-overlay">
      <div className="profile-edit-modal">
        <h2 className="profile-edit-modal__title">프로필 수정</h2>

        <section className="profile-edit-modal__section">
          <h3 className="profile-edit-modal__label">프로필 사진</h3>

          <div className="profile-edit-modal__photo-row">
            <img
              className="profile-edit-modal__character"
              src="/profile-character.svg"
              alt="프로필 캐릭터"
            />

            <button
              type="button"
              className="profile-edit-modal__change-button"
            >
              사진 변경
            </button>
          </div>
        </section>

        <section className="profile-edit-modal__nickname-section">
          <h3 className="profile-edit-modal__label">닉네임</h3>

          <div className="profile-edit-modal__nickname-row">
            {isEditingNickname ? (
              <input
                type="text"
                className="profile-edit-modal__nickname-input"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                autoFocus
              />
            ) : (
              <span className="profile-edit-modal__nickname">
                {nickname}
              </span>
            )}

            <button
              type="button"
              className="profile-edit-modal__change-button"
              onClick={handleNicknameChange}
            >
              닉네임 변경
            </button>
          </div>
        </section>

        <div className="profile-edit-modal__actions">
          <button
            type="button"
            className="profile-edit-modal__save"
            onClick={handleSave}
            disabled={isLoading}
          >
            저장
          </button>

          <button
            type="button"
            className="profile-edit-modal__cancel"
            onClick={handleCancel}
            disabled={isLoading}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProfileEditModal