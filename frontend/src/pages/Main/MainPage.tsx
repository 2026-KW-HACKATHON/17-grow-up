import BottomNav from '../../components/BottomNav/BottomNav'
import './MainPage.css'

interface Mission {
  id: number
  title: string
  category: string
  point: number
  image: string
  imageBackgroundColor: string
  recommended?: boolean
}

interface Activity {
  id: number
  title: string
  place: string
  point: number
  time: string
  image: string
}

const missions: Mission[] = [
  {
    id: 1,
    title: '텀블러 사용하기',
    category: '카페',
    point: 50,
    image: '/tumbler.svg',
    imageBackgroundColor: '#E9F4EC',
    recommended: true,
  },
  {
    id: 2,
    title: '장바구니 사용하기',
    category: '마트·편의점',
    point: 50,
    image: '/shopping-bag.svg',
    imageBackgroundColor: '#FFF5E0',
  },
  {
    id: 3,
    title: '포장용기 사용하기',
    category: '음식점',
    point: 50,
    image: '/container.svg',
    imageBackgroundColor: '#EDF3FC',
  },
  {
    id: 4,
    title: '음식 남기지 않기',
    category: '음식점',
    point: 50,
    image: '/empty-plate.svg',
    imageBackgroundColor: '#FCE8E5',
  },
  {
    id: 5,
    title: '일회용품 사용 줄이기',
    category: '생활',
    point: 50,
    image: '/no-disposable.svg',
    imageBackgroundColor: '#DFE5FB',
  },
]

const weekdays = [
  { label: '월', completed: true },
  { label: '화', completed: true },
  { label: '수', completed: true },
  { label: '목', completed: true },
  { label: '금', completed: true },
  { label: '토', completed: false },
  { label: '일', completed: false },
]

const activities: Activity[] = [
  {
    id: 1,
    title: '텀블러 사용하기',
    place: '월계동 그린커피',
    point: 50,
    time: '오늘 14:32',
    image: '/tumbler.svg',
  },
]

function MainPage() {
  return (
    <div className="main-page">
      <main className="main-page__content">
        <header className="main-page__header">
          <img
            className="main-page__logo"
            src="/growup-logo.svg"
            alt="그루업"
          />

          <button type="button" className="main-page__profile-button">
            <img src="/profile-character.svg" alt="프로필 캐릭터" />
          </button>
        </header>

        <section className="main-page__growth-card">
          <img
            className="main-page__growth-background"
            src="/home-header.svg"
            alt=""
          />

          <div className="main-page__growth-text">
            <span className="main-page__level">Lv.2</span>

            <h1>
              조금씩, 더 푸르게
              <br />
              성장하는 중이에요!
            </h1>

            <div className="main-page__progress">
              <div className="main-page__progress-bar">
                <div className="main-page__progress-value" />
              </div>

              <span>다음 성장까지 120P</span>
            </div>
          </div>
        </section>
        <section className="main-page__summary">
          <button type="button" className="main-page__summary-card">
            <img src="/point-coin.svg" alt="" />

            <div>
              <span>보유 포인트</span>
              <strong>1,230 P</strong>
            </div>

            <span className="main-page__chevron">›</span>
          </button>

          <button type="button" className="main-page__summary-card">
            <img src="/carbon-icon.svg" alt="" />

            <div>
              <span>누적 탄소 감축량</span>
              <strong>
                12.8
                <small> kg CO₂e</small>
              </strong>
            </div>

            <span className="main-page__chevron">›</span>
          </button>
        </section>

        <section className="main-page__streak-card">
          <div className="main-page__streak-header">
            <div>
              <span className="main-page__fire">🔥</span>

              <strong>
                <em>5일</em> 연속 실천 중이에요!
              </strong>
            </div>

            <button type="button">
              이번 주 5일 실천했어요
              <span>›</span>
            </button>
          </div>

          <div className="main-page__week">
            {weekdays.map((day) => (
              <div key={day.label} className="main-page__weekday">
                <span>{day.label}</span>

                <div
                  className={`main-page__day-check ${
                    day.completed ? 'main-page__day-check--completed' : ''
                  }`}
                >
                  {day.completed ? '✓' : ''}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="main-page__section">
          <div className="main-page__section-header">
            <h2>오늘의 미션</h2>

            <button type="button">
              전체 보기
              <span>›</span>
            </button>
          </div>

          <div className="main-page__mission-list">
            {missions.slice(0, 2).map((mission) => (
              <button
                type="button"
                key={mission.id}
                className="main-page__mission-card"
              >
                <div
                  className="main-page__mission-image-box"
                  style={{
                    backgroundColor: mission.imageBackgroundColor,
                  }}
                >
                  {mission.recommended && (
                    <span className="main-page__recommend">추천</span>
                  )}

                  <img src={mission.image} alt="" />
                </div>

                <div className="main-page__mission-info">
                  <strong>{mission.title}</strong>
                  <span>{mission.category}</span>
                </div>

                <div className="main-page__mission-bottom">
                  <span>🟡 {mission.point}</span>
                  <span>›</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="main-page__section">
          <div className="main-page__section-header">
            <h2>최근 활동</h2>

            <button type="button">
              전체 보기
              <span>›</span>
            </button>
          </div>

          <div className="main-page__activity-list">
            {activities.map((activity) => (
              <div key={activity.id} className="main-page__activity-item">
                <div className="main-page__activity-icon">
                  <img src={activity.image} alt="" />
                </div>

                <div className="main-page__activity-info">
                  <strong>{activity.title}</strong>
                  <span>{activity.place}</span>
                </div>

                <div className="main-page__activity-point">
                  <strong>+{activity.point}P</strong>
                  <span>{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <BottomNav active="home" />
    </div>
  )
}

export default MainPage
