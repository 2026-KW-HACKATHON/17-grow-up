import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import BottomNav from '../../components/BottomNav/BottomNav'
import MissionInfoCard from './components/MissionInfoCard'
import { getMissions, type Mission } from '../../api/missionApi'
import './MissionQrPage.css'

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

function MissionQrPage() {
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
      <div className="mission-qr-page">
        <main className="mission-qr-page__content">
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
    <div
      className="mission-qr-page"
      style={{
        backgroundColor,
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
          <MissionInfoCard
            mission={mission}
            image={image}
            backgroundColor={backgroundColor}
          />
        </section>

        <button
          type="button"
          className="mission-qr-page__success-test"
          onClick={() => navigate(`/mission/${mission.missionId}/success`)}
        >
          인증 완료 테스트
        </button>
      </main>

      <BottomNav active="mission" />
    </div>
  )
}

export default MissionQrPage
