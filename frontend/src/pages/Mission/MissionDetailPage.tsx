import { Navigate, useNavigate, useParams } from 'react-router-dom'
import BottomNav from '../../components/BottomNav/BottomNav'
import MissionProcess from './components/MissionProcess'
import { missions } from './data/missionData'
import './MissionDetailPage.css'

function MissionDetailPage() {
  const { missionId } = useParams()
  const navigate = useNavigate()

  const mission = missions.find((item) => item.id === missionId)

  if (!mission) {
    return <Navigate to="/mission" replace />
  }

  return (
    <div className="mission-detail-page">
      <main className="mission-detail-page__content">
        <section
          className="mission-detail-page__image-box"
          style={{
            backgroundColor: mission.backgroundColor,
          }}
        >
          <img src={mission.image} alt={mission.title} />
        </section>

        <section className="mission-detail-page__intro">
          <h1>{mission.title}</h1>

          <p>{mission.description}</p>
        </section>

        <MissionProcess image={mission.image} title={mission.title} />

        <section className="mission-detail-page__info-card">
          <div className="mission-detail-page__info-row">
            <span>획득 포인트</span>
            <strong>{mission.point}P</strong>
          </div>

          <div className="mission-detail-page__divider" />

          <div className="mission-detail-page__info-row">
            <span>예상 탄소 감축량</span>
            <strong>{mission.carbon}gCO₂e</strong>
          </div>

          <div className="mission-detail-page__divider" />

          <div className="mission-detail-page__info-row">
            <span>인증 가능 매장</span>
            <strong>{mission.availablePlace}</strong>
          </div>
        </section>

        <button
          type="button"
          className="mission-detail-page__qr-button"
          onClick={() => navigate(`/mission/${mission.id}/qr`)}
        >
          QR 인증하기
        </button>
      </main>

      <BottomNav active="mission" />
    </div>
  )
}

export default MissionDetailPage
