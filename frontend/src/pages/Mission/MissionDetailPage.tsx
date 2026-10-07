import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import BottomNav from '../../components/BottomNav/BottomNav'
import MissionProcess from './components/MissionProcess'
import { getMissionById, type Mission } from '../../api/missionApi'
import './MissionDetailPage.css'

const missionImageMap: Record<string, string> = {
  '텀블러 사용하기': '/tumbler.svg',
  '장바구니 사용하기': '/shopping-bag.svg',
  '포장 시 다회용기 사용하기': '/container.svg',
  '음식 안 남기기': '/empty-plate.svg',
  '일회용 수저·포크 사용 안 하기': '/no-disposable.svg',
}

const missionBackgroundMap: Record<string, string> = {
  '텀블러 사용하기': '#E9F4EC',
  '장바구니 사용하기': '#FFF5E0',
  '포장 시 다회용기 사용하기': '#EDF3FC',
  '음식 안 남기기': '#FCE8E5',
  '일회용 수저·포크 사용 안 하기': '#DFE5FB',
}

function MissionDetailPage() {
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

        const selectedMission = await getMissionById(
          Number(missionId),
          accessToken,
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
      <div className="mission-detail-page">
        <main className="mission-detail-page__content">
          <p>미션을 불러오는 중...</p>
        </main>
      </div>
    )
  }

  if (error || !mission) {
    return <Navigate to="/mission" replace />
  }

  const image = missionImageMap[mission.name] ?? '/tumbler.svg'

  const backgroundColor = missionBackgroundMap[mission.name] ?? '#F5F5F5'

  return (
    <div className="mission-detail-page">
      <main className="mission-detail-page__content">
        <section
          className="mission-detail-page__image-box"
          style={{
            backgroundColor,
          }}
        >
          <img src={image} alt={mission.name} />
        </section>

        <section className="mission-detail-page__intro">
          <h1>{mission.name}</h1>

          <p>{mission.description}</p>
        </section>

        <MissionProcess image={image} title={mission.name} />

        <section className="mission-detail-page__info-card">
          <div className="mission-detail-page__info-row">
            <span>획득 포인트</span>
            <strong>{mission.rewardPoints}P</strong>
          </div>

          <div className="mission-detail-page__divider" />

          <div className="mission-detail-page__info-row">
            <span>예상 탄소 감축량</span>
            <strong>{mission.carbonReductionG}gCO₂e</strong>
          </div>

          <div className="mission-detail-page__divider" />

          <div className="mission-detail-page__info-row">
            <span>인증 가능 매장</span>
            <strong>월계1동 제휴 매장</strong>
          </div>
        </section>

        <button
          type="button"
          className="mission-detail-page__qr-button"
          onClick={() => navigate(`/mission/${mission.missionId}/qr`)}
        >
          QR 인증하기
        </button>
      </main>

      <BottomNav active="mission" />
    </div>
  )
}

export default MissionDetailPage
