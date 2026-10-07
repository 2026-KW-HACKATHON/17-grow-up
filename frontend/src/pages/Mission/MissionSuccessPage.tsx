import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import BottomNav from '../../components/BottomNav/BottomNav'
import { getMissions, type Mission } from '../../api/missionApi'
import './MissionSuccessPage.css'

function MissionSuccessPage() {
  const { missionId } = useParams()
  const navigate = useNavigate()

  const [mission, setMission] = useState<Mission | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchMission = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken')

        if (!accessToken) {
          setError('로그인이 필요합니다.')
          return
        }

        const missions = await getMissions(accessToken)

        const selectedMission = missions.find(
          (item) => item.missionId === Number(missionId),
        )

        if (!selectedMission) {
          setError('미션을 찾을 수 없습니다.')
          return
        }

        setMission(selectedMission)
      } catch {
        setError('미션 정보를 불러오지 못했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMission()
  }, [missionId])

  if (isLoading) {
    return (
      <div className="mission-success-page">
        <main className="mission-success-page__content">
          <p>미션 정보를 불러오는 중...</p>
        </main>
      </div>
    )
  }

  if (error || !mission) {
    return <Navigate to="/mission" replace />
  }

  return (
    <div className="mission-success-page">
      <main className="mission-success-page__content">
        <section className="mission-success-page__header">
          <h1>실천 완료!</h1>
          <p>오늘도 슬기롭게 변화를 만들었어요</p>
        </section>

        <section className="mission-success-page__character-box">
          <img src="/qr-success-character.svg" alt="미션 완료 캐릭터" />
        </section>

        <section className="mission-success-page__result">
          <div className="mission-success-page__result-item">
            <img
              className="mission-success-page__result-icon"
              src="/point-coin.svg"
              alt=""
            />

            <div className="mission-success-page__result-text">
              <span>획득 포인트</span>
              <strong>+{mission.rewardPoints}P</strong>
            </div>
          </div>

          <div className="mission-success-page__divider" />

          <div className="mission-success-page__result-item">
            <img
              className="mission-success-page__result-icon"
              src="/carbon-icon.svg"
              alt=""
            />

            <div className="mission-success-page__result-text">
              <span>탄소 감축량</span>
              <strong>+{mission.carbonReductionG}g CO₂e</strong>
            </div>
          </div>
        </section>

        <section className="mission-success-page__streak">
          <span className="mission-success-page__fire">🔥</span>

          <div>
            <strong>
              <em>5일</em> 연속 실천 중이에요!
            </strong>

            <span>꾸준한 실천이 멋져요!</span>
          </div>
        </section>

        <button
          type="button"
          className="mission-success-page__button"
          onClick={() => navigate('/mission')}
        >
          목록으로
        </button>
      </main>

      <BottomNav active="mission" />
    </div>
  )
}

export default MissionSuccessPage
