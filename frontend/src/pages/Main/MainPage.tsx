import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import BottomNav from '../../components/BottomNav/BottomNav'
import { getHome, type HomeData } from '../../api/homeApi'
import { missions as missionDesignData } from '../Mission/data/missionData'

import './MainPage.css'

const weekdayLabels = ['월', '화', '수', '목', '금', '토', '일']

function formatCarbon(carbonG: number) {
  if (carbonG >= 1000) {
    return {
      value: Number((carbonG / 1000).toFixed(1)),
      unit: 'kg CO₂e',
    }
  }

  return {
    value: carbonG,
    unit: 'g CO₂e',
  }
}

// 백엔드의 시간대 없는 날짜 문자열은 한국 시간으로 해석
function formatCompletedAt(completedAt: string) {
  const datePart = completedAt.slice(0, 10)

  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())

  const date = new Date(
    /(?:Z|[+-]\d{2}:\d{2})$/.test(completedAt)
      ? completedAt
      : `${completedAt}+09:00`,
  )

  if (Number.isNaN(date.getTime())) return '-'

  const time = date.toLocaleTimeString('ko-KR', {
    timeZone: 'Asia/Seoul',
    hour: '2-digit',
    minute: '2-digit',
  })

  if (datePart === today) {
    return `오늘 ${time}`
  }

  return date.toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function MainPage() {
  const navigate = useNavigate()

  const [homeData, setHomeData] = useState<HomeData | null>(null)

  const [randomMissionIds, setRandomMissionIds] = useState<number[]>([])

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const fetchMainData = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken')

        if (!accessToken) {
          if (!cancelled) {
            setError('로그인이 필요합니다.')
          }
          return
        }

        const data = await getHome(accessToken)

        if (cancelled) return

        setHomeData(data)

        // 새로고침할 때 미션 2개 랜덤 선택
        const shuffled = [...(data.todayMissions ?? [])]

        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))

          ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }

        setRandomMissionIds(
          shuffled.slice(0, 2).map((mission) => mission.missionId),
        )
      } catch (error) {
        if (!cancelled) {
          console.error('홈 정보 조회 실패:', error)
          setError('홈 정보를 불러오지 못했습니다.')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void fetchMainData()

    return () => {
      cancelled = true
    }
  }, [])

  const todayMissions = randomMissionIds.flatMap((id) => {
    const mission = homeData?.todayMissions?.find(
      (item) => item.missionId === id,
    )

    return mission ? [mission] : []
  })

  const weeklyPractices = homeData?.streak?.weeklyPractices ?? []

  const weeklyPracticeCount = weeklyPractices.filter(
    (day) => day.completed,
  ).length

  const currentStreak = homeData?.streak?.currentStreak ?? 0

  const carbon = formatCarbon(homeData?.totalCarbonG ?? 0)

  // 실제 홈 API의 progressPercent는 0~100 범위
  const progressPercent = Math.min(
    100,
    Math.max(0, homeData?.characterGrowth?.progressPercent ?? 0),
  )

  if (isLoading) {
    return (
      <div className="main-page">
        <main className="main-page__content">
          <p>홈 정보를 불러오는 중...</p>
        </main>
        <BottomNav active="home" />
      </div>
    )
  }

  if (error || !homeData) {
    return (
      <div className="main-page">
        <main className="main-page__content">
          <p>{error || '홈 정보를 불러오지 못했습니다.'}</p>
        </main>
        <BottomNav active="home" />
      </div>
    )
  }

  return (
    <div className="main-page">
      <main className="main-page__content">
        {/* 상단 헤더 */}
        <header className="main-page__header">
          <div className="main-page__brand">
            <img
              className="main-page__logo"
              src="/growup-logo.svg"
              alt="그루업"
            />

            <p className="main-page__description">
              오늘의 작은 실천이,
              <br />
              월계1동의 초록 일상을 키워요
            </p>
          </div>

          <div className="main-page__header-actions">
            <button
              type="button"
              className="main-page__alarm-button"
              onClick={() => navigate('/alarm')}
              aria-label="알림창으로 이동"
            >
              <img src="/alarm-icon.svg" alt="" />
            </button>

            <button
              type="button"
              className="main-page__profile-button"
              onClick={() => navigate('/my')}
              aria-label="마이페이지로 이동"
            >
              <img src="/profile-character.svg" alt="프로필 캐릭터" />
            </button>
          </div>
        </header>

        {/* 캐릭터 성장 카드 */}
        <section className="main-page__growth-card">
          <img
            className="main-page__growth-background"
            src="/home-header.svg"
            alt=""
          />

          <div className="main-page__growth-text">
            <span className="main-page__level">
              Lv. {homeData.characterGrowth.level}
            </span>

            <h1>
              조금씩, 더 푸르게
              <br />
              성장하는 중이에요!
            </h1>

            <div className="main-page__progress">
              <div className="main-page__progress-row">
                <div className="main-page__progress-icon">
                  <img src="/carbon-icon-white.svg" alt="" />
                </div>

                <div className="main-page__progress-bar">
                  <div
                    className="main-page__progress-value"
                    style={{
                      width: `${progressPercent}%`,
                    }}
                  />
                </div>
              </div>

              <span>
                누적 탄소 감축량 {homeData.totalCarbonG.toLocaleString()}g
              </span>
            </div>
          </div>
        </section>

        {/* 포인트 및 탄소 감축량 */}
        <section className="main-page__summary">
          <button
            type="button"
            className="main-page__summary-card"
            onClick={() => navigate('/point')}
          >
            <img src="/point-coin.svg" alt="" />

            <div>
              <span>보유 포인트</span>
              <strong>{homeData.availablePoints.toLocaleString()} P</strong>
            </div>

            <span className="main-page__chevron">›</span>
          </button>

          <button
            type="button"
            className="main-page__summary-card"
            onClick={() => navigate('/growth')}
          >
            <img src="/carbon-icon.svg" alt="" />

            <div>
              <span>누적 탄소 감축량</span>
              <strong>
                {carbon.value} <small>{carbon.unit}</small>
              </strong>
            </div>

            <span className="main-page__chevron">›</span>
          </button>
        </section>

        {/* 연속 실천 및 이번 주 현황 */}
        <section className="main-page__streak-card">
          <div className="main-page__streak-header">
            <div className="main-page__streak-title">
              <span className="main-page__fire">🔥</span>

              <strong>
                {currentStreak > 0 ? (
                  <>
                    <em>{currentStreak}일</em> 연속 실천 중이에요!
                  </>
                ) : (
                  '오늘 첫 실천을 시작해 보세요!'
                )}
              </strong>
            </div>

            <button type="button" onClick={() => navigate('/record')}>
              이번 주 {weeklyPracticeCount}일 실천했어요
              <span>›</span>
            </button>
          </div>

          <div className="main-page__week">
            {weekdayLabels.map((label, index) => {
              const practice = weeklyPractices[index]

              return (
                <div key={label} className="main-page__weekday">
                  <span>{label}</span>

                  <div
                    className={`main-page__day-check ${
                      practice?.completed
                        ? 'main-page__day-check--completed'
                        : ''
                    }`}
                  >
                    {practice?.completed ? '✓' : ''}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* 오늘의 미션 */}
        <section className="main-page__section">
          <div className="main-page__section-header">
            <h2>오늘의 미션</h2>

            <button type="button" onClick={() => navigate('/mission')}>
              전체 보기 <span>›</span>
            </button>
          </div>

          <div className="main-page__mission-list">
            {todayMissions.length > 0 ? (
              todayMissions.map((mission, index) => {
                // SVG, 색상, 한글 명칭은 디자인 데이터에서 가져옴
                const display = missionDesignData.find(
                  (item) => item.missionId === mission.missionId,
                )

                return (
                  <button
                    key={mission.missionId}
                    type="button"
                    className="main-page__mission-card"
                    style={{
                      backgroundColor: display?.backgroundColor ?? '#E9F4EC',
                    }}
                    onClick={() => navigate(`/mission/${mission.missionId}`)}
                  >
                    {index === 0 && (
                      <span className="main-page__recommend">추천</span>
                    )}

                    <div className="main-page__mission-image">
                      <div className="main-page__mission-shadow" />

                      <img
                        src={display?.image ?? '/profile-character.svg'}
                        alt=""
                      />
                    </div>

                    <div className="main-page__mission-text">
                      <div className="main-page__mission-title-row">
                        <strong>{display?.title ?? mission.missionName}</strong>

                        <span className="main-page__mission-point">
                          <img src="/point-coin.svg" alt="" />
                          {mission.rewardPoints.toLocaleString()}
                        </span>
                      </div>

                      <div className="main-page__mission-bottom-row">
                        <span>{display?.category ?? mission.category}</span>

                        <span className="main-page__mission-arrow">›</span>
                      </div>
                    </div>
                  </button>
                )
              })
            ) : (
              <p className="main-page__empty">
                오늘 수행 가능한 미션이 없어요.
              </p>
            )}
          </div>
        </section>

        {/* 최근 활동 */}
        <section className="main-page__section">
          <div className="main-page__section-header">
            <h2>최근 활동</h2>

            <button type="button" onClick={() => navigate('/record')}>
              전체 보기 <span>›</span>
            </button>
          </div>

          <div className="main-page__activity-list">
            {homeData.recentActivities.length > 0 ? (
              homeData.recentActivities.map((activity, index) => {
                const display = missionDesignData.find(
                  (item) => item.missionId === activity.missionId,
                )

                return (
                  <button
                    key={`${activity.missionId}-${activity.completedAt}-${index}`}
                    type="button"
                    className="main-page__activity-item"
                    onClick={() => navigate('/record')}
                  >
                    <div className="main-page__activity-icon">
                      <img
                        src={display?.image ?? '/profile-character.svg'}
                        alt=""
                      />
                    </div>

                    <div className="main-page__activity-info">
                      <strong>{display?.title ?? activity.missionName}</strong>

                      <span>{activity.partnerName}</span>
                    </div>

                    <div className="main-page__activity-point">
                      <strong>
                        +{activity.earnedPoints.toLocaleString()}P
                      </strong>

                      <span>{formatCompletedAt(activity.completedAt)}</span>
                    </div>
                  </button>
                )
              })
            ) : (
              <p className="main-page__empty">아직 최근 활동이 없어요.</p>
            )}
          </div>
        </section>
      </main>

      <BottomNav active="home" />
    </div>
  )
}

export default MainPage
