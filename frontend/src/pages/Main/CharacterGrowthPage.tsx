import { useNavigate } from 'react-router-dom'
import BottomNav from '../../components/BottomNav/BottomNav'
import './CharacterGrowthPage.css'

interface MissionStat {
  id: string
  name: string
  count: number
  percent: number
  image: string
}

const missionStats: MissionStat[] = [
  {
    id: 'tumbler',
    name: '텀블러 사용',
    count: 38,
    percent: 38,
    image: '/tumbler.svg',
  },
  {
    id: 'shopping-bag',
    name: '장바구니 사용',
    count: 22,
    percent: 22,
    image: '/shopping-bag.svg',
  },
  {
    id: 'container',
    name: '다회용기 포장',
    count: 18,
    percent: 18,
    image: '/container.svg',
  },
  {
    id: 'empty-plate',
    name: '음식 안 남기기',
    count: 14,
    percent: 14,
    image: '/empty-plate.svg',
  },
  {
    id: 'no-disposable',
    name: '일회용품 받지 않기',
    count: 8,
    percent: 8,
    image: '/no-disposable.svg',
  },
]

const currentCarbon = 12800
const currentLevelStart = 6900
const nextLevelCarbon = 20700

function CharacterGrowthPage() {
  const navigate = useNavigate()

  const progress =
    ((currentCarbon - currentLevelStart) /
      (nextLevelCarbon - currentLevelStart)) *
    100

  const remainingCarbon = nextLevelCarbon - currentCarbon

  return (
    <div className="growth-page">
      <main className="growth-page__content">
        <section className="growth-page__hero">
          <button
            type="button"
            className="growth-page__back"
            onClick={() => navigate(-1)}
            aria-label="뒤로가기"
          >
            ‹
          </button>

          <img
            className="growth-page__hero-background"
            src="/background.svg"
            alt=""
          />

          {/* <img
            className="growth-page__character"
            src="/characters/tumbler-level2.png"
            alt="텀블러 새싹 그루"
          /> */}
          <div className="growth-page__character-placeholder">
            <span>🌱</span>
          </div>
        </section>

        <section className="growth-page__sheet">
          <div className="growth-page__level-badge">Lv. 2</div>

          <h1>텀블러 새싹 그루</h1>

          <p className="growth-page__carbon">
            지금까지 <strong>12.8kgCO₂e</strong>를 줄였어요!
          </p>

          <div className="growth-page__progress-section">
            <div className="growth-page__progress-row">
              <strong>Lv. 2</strong>

              <div className="growth-page__progress-bar">
                <div
                  className="growth-page__progress-value"
                  style={{ width: `${progress}%` }}
                />

                <span
                  className="growth-page__progress-percent"
                  style={{ left: `${progress / 2}%` }}
                >
                  {Math.round(progress)}%
                </span>

                <img
                  className="growth-page__sprout"
                  src="/carbon-icon-white.svg"
                  alt=""
                  style={{ left: `${progress}%` }}
                />
              </div>

              <strong>Lv. 3</strong>
            </div>

            <p>
              다음 성장까지{' '}
              <strong>{(remainingCarbon / 1000).toFixed(1)}kgCO₂e</strong>
              남았어요
            </p>
          </div>

          <section className="growth-page__status">
            <h2>
              <img
                className="growth-page__status-icon"
                src="/carbon-icon-white.svg"
                alt=""
              />
              미션별 실천 현황
            </h2>

            <div className="growth-page__status-content">
              <div className="growth-page__chart">
                <div className="growth-page__chart-hole">
                  <span>총 실천 횟수</span>
                  <strong>100회</strong>
                </div>
              </div>

              <div className="growth-page__legend">
                {missionStats.map((mission) => (
                  <div key={mission.id} className="growth-page__legend-item">
                    <span
                      className={`growth-page__dot growth-page__dot--${mission.id}`}
                    />

                    <div>
                      <strong>{mission.name}</strong>
                      <span>{mission.count}회</span>
                    </div>

                    <em>{mission.percent}%</em>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="growth-page__recommend">
            <div className="growth-page__recommend-text">
              <span>지금처럼 실천하면</span>

              <strong>텀블러 그루로 성장할 가능성이 가장 높아요!</strong>

              <p>텀블러 사용을 가장 많이 실천하고 있어요.</p>
            </div>

            <div className="growth-page__recommend-image">
              <img src="/tumbler.svg" alt="텀블러" />
            </div>
          </section>
        </section>
      </main>

      <BottomNav active="home" />
    </div>
  )
}

export default CharacterGrowthPage
