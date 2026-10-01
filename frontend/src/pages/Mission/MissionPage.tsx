import BottomNav from '../../components/BottomNav/BottomNav'
import MissionCard from './components/MissionCard'
import { missions } from './data/missionData'
import './MissionPage.css'

function MissionPage() {
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

        <section className="mission-page__partner">
          <div className="mission-page__partner-icon">
            <img src="/store-image.svg" alt="" />
          </div>

          <div className="mission-page__partner-text">
            <strong>우리 동네 제휴 매장</strong>
            <span>월계1동 제휴 매장</span>
          </div>

          <span className="mission-page__partner-arrow">›</span>
        </section>

        <section className="mission-page__list-section">
          <h2>미션 목록</h2>

          <div className="mission-page__list">
            {missions.map((mission) => (
              <MissionCard key={mission.id} mission={mission} />
            ))}
          </div>
        </section>
      </main>

      <BottomNav active="mission" />
    </div>
  )
}

export default MissionPage
