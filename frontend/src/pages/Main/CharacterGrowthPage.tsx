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
type CharacterType =
  'tumbler' | 'shopping-bag' | 'empty-plate' | 'no-disposable' | 'container'

function getCharacterImage(type: CharacterType, level: number) {
  if (level === 1) {
    return '/init-character.svg'
  }

  return `/${type}-character${level}.svg`
}

const characterNames: Record<CharacterType, string> = {
  tumbler: '텀블러',
  'shopping-bag': '장바구니',
  'empty-plate': '음식물',
  'no-disposable': '일회용품',
  container: '다회용기',
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
const chartColors: Record<string, string> = {
  tumbler: '#36a85f',
  'shopping-bag': '#fdca61',
  container: '#669ced',
  'empty-plate': '#fb6a6a',
  'no-disposable': '#ab70f8',
}
const currentCarbon = 12800
const currentLevelStart = 6900
const nextLevelCarbon = 20700

function CharacterGrowthPage() {
  const navigate = useNavigate()
  const currentCharacter: CharacterType = 'tumbler'
  const currentLevel = 2

  const characterImage = getCharacterImage(currentCharacter, currentLevel)
  const characterName = characterNames[currentCharacter]
  const progress =
    ((currentCarbon - currentLevelStart) /
      (nextLevelCarbon - currentLevelStart)) *
    100

  const remainingCarbon = nextLevelCarbon - currentCarbon

  const totalCount = missionStats.reduce(
    (sum, mission) => sum + mission.count,
    0,
  )

  let accumulatedPercent = 0

  const chartSegments = missionStats.map((mission) => {
    const start = accumulatedPercent
    const end = start + mission.percent
    const middle = start + mission.percent / 2

    accumulatedPercent = end

    return {
      ...mission,
      start,
      end,
      middle,
    }
  })

  const chartBackground = `conic-gradient(
  ${chartSegments
    .map(
      (mission) =>
        `${chartColors[mission.id]} ${mission.start}% ${mission.end}%`,
    )
    .join(', ')}
)`

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

          <img
            className="growth-page__character"
            src={characterImage}
            alt="성장 캐릭터"
          />
        </section>

        <section className="growth-page__sheet">
          <div className="growth-page__level-badge">Lv. {currentLevel}</div>

          <h1>{characterName} 새싹 그루</h1>

          <p className="growth-page__carbon">
            지금까지 <strong>12.8kgCO₂e</strong>를 줄였어요!
          </p>

          <div className="growth-page__progress-section">
            <div className="growth-page__progress-row">
              <strong>Lv. {currentLevel}</strong>

              <div className="growth-page__progress-bar">
                <div
                  className="growth-page__progress-value"
                  style={{ width: `${progress}%` }}
                />

                <span className="growth-page__progress-percent">
                  {Math.round(progress)}%
                </span>

                <img
                  className="growth-page__sprout"
                  src="/carbon-icon-white.svg"
                  alt=""
                  style={{ left: `${progress}%` }}
                />
              </div>

              <strong>Lv. {currentLevel + 1}</strong>
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
              <div
                className="growth-page__chart"
                style={{ background: chartBackground }}
              >
                {chartSegments.map((mission) => {
                  const angle = (mission.middle / 100) * 360
                  const radian = (angle * Math.PI) / 180

                  const radius = 38

                  const left = 50 + radius * Math.sin(radian)
                  const top = 50 - radius * Math.cos(radian)

                  return (
                    <span
                      key={mission.id}
                      className="growth-page__chart-percent"
                      style={{
                        left: `${left}%`,
                        top: `${top}%`,
                      }}
                    >
                      {mission.percent}%
                    </span>
                  )
                })}

                <div className="growth-page__chart-hole">
                  <span>총 실천 횟수</span>
                  <strong>{totalCount}회</strong>
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
        </section>
      </main>

      <BottomNav active="home" />
    </div>
  )
}

export default CharacterGrowthPage
