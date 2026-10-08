import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import BottomNav from '../../components/BottomNav/BottomNav'
import { getMyGrowth } from '../../api/growth'
import type { GrowthData } from '../../api/growth'

import './CharacterGrowthPage.css'

type CharacterType =
  'tumbler' | 'shopping-bag' | 'empty-plate' | 'no-disposable' | 'container'

interface MissionStat {
  id: string
  name: string
  count: number
  percent: number
  image: string
}

const characterNames: Record<CharacterType, string> = {
  tumbler: '텀블러',
  'shopping-bag': '장바구니',
  'empty-plate': '음식물',
  'no-disposable': '일회용품',
  container: '다회용기',
}

const chartColors: Record<string, string> = {
  tumbler: '#36a85f',
  'shopping-bag': '#fdca61',
  container: '#669ced',
  'empty-plate': '#fb6a6a',
  'no-disposable': '#ab70f8',
}

// 캐릭터 이미지
function getCharacterImage(type: CharacterType, level: number) {
  if (level === 1) {
    return '/init-character.svg'
  }

  return `/${type}-character${level}.svg`
}

// 백엔드 캐릭터 타입과 프론트 캐릭터 타입 연결
const characterTypeMap: Record<string, CharacterType> = {
  TREE_A: 'tumbler',
  TREE_B: 'shopping-bag',
  TREE_C: 'empty-plate',
  TREE_D: 'no-disposable',
  TREE_E: 'container',
}

// 미션 이름으로 차트 ID 찾기
function getMissionId(name: string): string {
  if (name.includes('텀블러')) {
    return 'tumbler'
  }

  if (name.includes('장바구니')) {
    return 'shopping-bag'
  }

  if (name.includes('다회용기')) {
    return 'container'
  }

  if (name.includes('음식') || name.includes('잔반')) {
    return 'empty-plate'
  }

  if (
    name.includes('일회용품') ||
    name.includes('일회용 수저') ||
    name.includes('빨대')
  ) {
    return 'no-disposable'
  }

  return 'unknown'
}

function CharacterGrowthPage() {
  const navigate = useNavigate()

  const [growth, setGrowth] = useState<GrowthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const fetchGrowth = async () => {
      try {
        setLoading(true)
        setError(null)

        const data = await getMyGrowth()

        if (active) {
          setGrowth(data)
        }
      } catch (err) {
        console.error('캐릭터 성장 조회 실패:', err)

        if (active) {
          setError('성장 정보를 불러오지 못했습니다.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void fetchGrowth()

    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return (
      <div className="growth-page">
        <main className="growth-page__content">
          <p>성장 정보를 불러오는 중...</p>
        </main>

        <BottomNav active="home" />
      </div>
    )
  }

  if (error || !growth) {
    return (
      <div className="growth-page">
        <main className="growth-page__content">
          <p>{error ?? '성장 정보가 없습니다.'}</p>

          <button type="button" onClick={() => window.location.reload()}>
            다시 시도
          </button>
        </main>

        <BottomNav active="home" />
      </div>
    )
  }

  // 캐릭터 정보
  const currentCharacter: CharacterType =
    characterTypeMap[growth.characterType] ?? 'tumbler'

  const currentLevel = growth.characterLevel

  const characterImage = getCharacterImage(currentCharacter, currentLevel)

  const characterName = characterNames[currentCharacter]

  // 탄소 감축량 및 성장률
  const currentCarbon = growth.totalCarbonG

  const remainingCarbon = growth.remainingCarbonG

  const progress = Math.min(100, Math.max(0, growth.progressPercent))

  // 미션 통계
  const missionStats: MissionStat[] = growth.missionStats.map((mission) => {
    const id = getMissionId(mission.missionName)

    return {
      id,
      name: mission.missionName,
      count: mission.count,
      percent: mission.percentage,
      image: `/${id}.svg`,
    }
  })

  const totalCount = growth.totalMissionCount

  // 원형 차트 계산
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

  const chartBackground =
    totalCount > 0
      ? `conic-gradient(${chartSegments
          .map(
            (mission) =>
              `${chartColors[mission.id] ?? '#aaaaaa'} ${mission.start}% ${mission.end}%`,
          )
          .join(', ')})`
      : '#e5e5e5'

  return (
    <div className="growth-page">
      <main className="growth-page__content">
        {/* 캐릭터 이미지 영역 */}
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

        {/* 성장 정보 */}
        <section className="growth-page__sheet">
          <div className="growth-page__level-badge">Lv. {currentLevel}</div>

          <h1>{characterName} 새싹 그루</h1>

          <p className="growth-page__carbon">
            지금까지 <strong>{(currentCarbon / 1000).toFixed(1)}kgCO₂e</strong>
            를 줄였어요!
          </p>

          {/* 성장 진행률 */}
          <div className="growth-page__progress-section">
            <div className="growth-page__progress-row">
              <strong>Lv. {currentLevel}</strong>

              <div className="growth-page__progress-bar">
                <div
                  className="growth-page__progress-value"
                  style={{
                    width: `${progress}%`,
                  }}
                />

                <span className="growth-page__progress-percent">
                  {Math.round(progress)}%
                </span>

                <img
                  className="growth-page__sprout"
                  src="/carbon-icon-white.svg"
                  alt=""
                  style={{
                    left: `${progress}%`,
                  }}
                />
              </div>

              <strong>Lv. {currentLevel + 1}</strong>
            </div>

            <p>
              다음 성장까지{' '}
              <strong>{(remainingCarbon / 1000).toFixed(1)}kgCO₂e</strong>{' '}
              남았어요
            </p>
          </div>

          {/* 미션별 실천 현황 */}
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
                style={{
                  background: chartBackground,
                }}
              >
                {chartSegments.map((mission, index) => {
                  if (mission.percent <= 0) {
                    return null
                  }

                  const angle = (mission.middle / 100) * 360

                  const radian = (angle * Math.PI) / 180

                  const radius = 38

                  const left = 50 + radius * Math.sin(radian)

                  const top = 50 - radius * Math.cos(radian)

                  return (
                    <span
                      key={`${mission.id}-${index}`}
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

              {/* 미션별 범례 */}
              <div className="growth-page__legend">
                {missionStats.map((mission, index) => (
                  <div
                    key={`${mission.id}-${index}`}
                    className="growth-page__legend-item"
                  >
                    <span
                      className={`growth-page__dot growth-page__dot--${mission.id}`}
                      style={{
                        backgroundColor: chartColors[mission.id] ?? '#aaaaaa',
                      }}
                    />

                    <div>
                      <strong>{mission.name}</strong>

                      <span>{mission.count}회</span>
                    </div>

                    <em>{mission.percent}%</em>
                  </div>
                ))}

                {missionStats.length === 0 && (
                  <p>아직 완료한 미션이 없습니다.</p>
                )}
              </div>
            </div>
          </section>

          {/* 하단 안내 문구 - 이미지 없이 텍스트만 */}
          <div className="growth-page__recommend">
            <p>더 많은 실천이 필요해요!</p>
          </div>
        </section>
      </main>

      <BottomNav active="home" />
    </div>
  )
}

export default CharacterGrowthPage
