import { useState } from 'react'
import './ProfileEditModal.css'

interface ProfileEditModalProps {
  onClose: () => void
}

function ProfileEditModal({ onClose }: ProfileEditModalProps) {
  const [nickname, setNickname] = useState('김탄탄')
  const [isEditingNickname, setIsEditingNickname] = useState(false)

  const handleNicknameChange = () => {
    setIsEditingNickname(true)
  }

  const handleSave = () => {
    // 추후 프로필 수정 API 연결
    onClose()
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
          >
            저장
          </button>

          <button
            type="button"
            className="profile-edit-modal__cancel"
            onClick={handleCancel}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProfileEditModal