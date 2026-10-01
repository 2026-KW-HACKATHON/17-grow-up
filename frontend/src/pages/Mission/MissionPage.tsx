import BottomNav from '../../components/BottomNav/BottomNav'
import './MissionPage.css'

function MissionPage() {
  return (
    <div className="mission-page">
      <main className="mission-page__content">
        <h1>미션 목록</h1>
      </main>

      <BottomNav active="mission" />
    </div>
  )
}

export default MissionPage
