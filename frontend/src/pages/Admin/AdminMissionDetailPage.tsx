import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { missions } from '../Mission/data/missionData'
import './AdminMissionDetailPage.css'

function AdminMissionDetailPage() {
  const { missionId } = useParams()
  const navigate = useNavigate()

  const mission = missions.find((item) => item.id === missionId)

  if (!mission) {
    return <Navigate to="/main" replace />
  }

  return (
    <div className="admin-mission-page">
      <main className="admin-mission-page__content">
        <button
          type="button"
          className="admin-mission-page__back"
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
        >
          ‹
        </button>

        <section
          className="admin-mission-page__image-box"
          style={{
            backgroundColor: mission.backgroundColor,
          }}
        >
          <img src={mission.image} alt={mission.title} />
        </section>

        <section className="admin-mission-page__intro">
          <span className="admin-mission-page__category">
            {mission.category}
          </span>

          <h1>{mission.title}</h1>

          <p>{mission.description}</p>
        </section>

        <section className="admin-mission-page__info">
          <div>
            <span>지급 포인트</span>
            <strong>{mission.point}P</strong>
          </div>

          <div>
            <span>탄소 감축량</span>
            <strong>{mission.carbon}gCO₂e</strong>
          </div>

          <div>
            <span>인증 가능 매장</span>
            <strong>{mission.availablePlace}</strong>
          </div>
        </section>

        <button
          type="button"
          className="admin-mission-page__qr-button"
          onClick={() => navigate(`/admin/mission/${mission.id}/qr`)}
        >
          QR 인증 시작하기
        </button>
      </main>
    </div>
  )
}

export default AdminMissionDetailPage
