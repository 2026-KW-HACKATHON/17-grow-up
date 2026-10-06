import Button from '../../../components/Button/Button'
import './LogoutModal.css'

interface LogoutModalProps {
  onConfirm: () => void
  onCancel: () => void
}

function LogoutModal({ onConfirm, onCancel }: LogoutModalProps) {
  return (
    <div className="logout-modal-overlay">
      <div className="logout-modal">
        <h2 className="logout-modal__title">로그아웃 하시겠어요?</h2>

        <div className="logout-modal__buttons">
          <div className="logout-modal__button logout-modal__button--confirm">
            <Button onClick={onConfirm}>로그아웃</Button>
          </div>

          <div className="logout-modal__button logout-modal__button--cancel">
            <Button onClick={onCancel}>취소</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LogoutModal