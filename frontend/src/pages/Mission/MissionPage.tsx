import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import BottomNav from '../../components/BottomNav/BottomNav'
import MissionCard from './components/MissionCard'
import { getMissions, type Mission } from '../../api/missionApi'

import './MissionPage.css'

function MissionPage() {
  const navigate = useNavigate()

  const [missions, setMissions] = useState<Mission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken')

        if (!accessToken) {
          setError('로그인이 필요합니다.')
          return
        }

        const missionList = await getMissions(accessToken)

        setMissions(missionList)
      } catch {
        setError('미션 목록을 불러오지 못했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMissions()
  }, [])

  return (
    <div className="mission-page">
      <main className="mission-page__content">
        <header className="mission-page__header">
          <h1>
            오늘도
            <br />
            초록빛 실천을 해볼까요?
          </h1>
        </header>

        <button
          type="button"
          className="mission-page__partner"
          onClick={() => navigate('/stores')}
        >
          <div className="mission-page__partner-icon">
            <img src="/store-image.svg" alt="" />
          </div>

          <div className="mission-page__partner-text">
            <strong>우리 동네 제휴 매장</strong>
            <span>월계1동 제휴 매장</span>
          </div>

          <span className="mission-page__partner-arrow">›</span>
        </button>

        <section className="mission-page__list-section">
          <h2>미션 목록</h2>

          {isLoading && (
            <p className="mission-page__message">미션을 불러오는 중...</p>
          )}

          {error && <p className="mission-page__message">{error}</p>}

          {!isLoading && !error && (
            <div className="mission-page__list">
              {missions.map((mission) => (
                <MissionCard key={mission.missionId} mission={mission} />
              ))}
            </div>
          )}
        </section>
      </main>

      <BottomNav active="mission" />
    </div>
  )
}

export default MissionPage
