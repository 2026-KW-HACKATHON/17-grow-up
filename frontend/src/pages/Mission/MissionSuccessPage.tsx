import { Navigate, useNavigate, useParams } from 'react-router-dom'
import BottomNav from '../../components/BottomNav/BottomNav'
import { missions } from './data/missionData'
import './MissionSuccessPage.css'

function MissionSuccessPage() {
  const { missionId } = useParams()
  const navigate = useNavigate()

  const mission = missions.find((item) => item.id === missionId)

  if (!mission) {
    return <Navigate to="/mission" replace />
  }

  return (
    <div className="mission-success-page">
      <main className="mission-success-page__content">
        <section className="mission-success-page__header">
          <h1>실천 완료!</h1>

          <p>
            오늘도 초록빛 실천을
            <br />
            완료했어요.
          </p>
        </section>

        <section
          className="mission-success-page__character-box"
          style={{
            backgroundColor: mission.backgroundColor,
          }}
        >
          <img src={mission.image} alt={mission.title} />
        </section>

        <section className="mission-success-page__result">
          <div className="mission-success-page__result-item">
            <span>획득 포인트</span>

            <strong className="mission-success-page__point">
              +{mission.point}P
            </strong>
          </div>

          <div className="mission-success-page__divider" />

          <div className="mission-success-page__result-item">
            <span>탄소 감축량</span>

            <strong>+{mission.carbon}g CO₂e</strong>
          </div>
        </section>

        <section className="mission-success-page__streak">
          <span className="mission-success-page__fire">🔥</span>

          <div>
            <strong>
              <em>5일</em> 연속 실천 중이에요!
            </strong>

            <span>내일도 함께 실천해 봐요.</span>
          </div>
        </section>

        <button
          type="button"
          className="mission-success-page__button"
          onClick={() => navigate('/mission')}
        >
          미션 목록으로
        </button>
      </main>

      <BottomNav active="mission" />
    </div>
  )
}

export default MissionSuccessPage
