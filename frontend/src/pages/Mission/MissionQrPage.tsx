import { Navigate, useNavigate, useParams } from 'react-router-dom'
import BottomNav from '../../components/BottomNav/BottomNav'
import MissionInfoCard from './components/MissionInfoCard'
import { missions } from './data/missionData'
import './MissionQrPage.css'

function MissionQrPage() {
  const { missionId } = useParams()
  const navigate = useNavigate()

  const mission = missions.find((item) => item.id === missionId)

  if (!mission) {
    return <Navigate to="/mission" replace />
  }

  return (
    <div
      className="mission-qr-page"
      style={{
        backgroundColor: mission.backgroundColor,
      }}
    >
      <main className="mission-qr-page__content">
        <button
          type="button"
          className="mission-qr-page__close"
          onClick={() => navigate(-1)}
          aria-label="닫기"
        >
          ×
        </button>

        <header className="mission-qr-page__header">
          <h1>미션 QR 인증</h1>

          <p className="mission-qr-page__guide">
            매장 직원에게
            <br />
            QR코드를 보여주세요
          </p>

          <span className="mission-qr-page__description">
            스캔 후 자동으로 인증됩니다.
          </span>
        </header>

        <section className="mission-qr-page__qr-section">
          <div className="mission-qr-page__qr-box">
            <img src="/qr-placeholder.png" alt="미션 인증 QR 코드" />
          </div>

          <div className="mission-qr-page__timer">
            <span>◷</span>
            <span>04:57</span>
          </div>
        </section>

        <section className="mission-qr-page__mission">
          <MissionInfoCard mission={mission} />
        </section>

        <button
          type="button"
          className="mission-qr-page__success-test"
          onClick={() => navigate(`/mission/${mission.id}/success`)}
        >
          인증 완료 테스트
        </button>
      </main>

      <BottomNav active="mission" />
    </div>
  )
}

export default MissionQrPage
