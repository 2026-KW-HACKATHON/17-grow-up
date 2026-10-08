import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import BottomNav from '../../components/BottomNav/BottomNav'

import { getHome, type HomeData } from '../../api/homeApi'

import { getMissions, type Mission } from '../../api/missionApi'

import './MainPage.css'

const weekdayLabels = ['월', '화', '수', '목', '금', '토', '일']

const missionDisplayMap: Record<
  string,
  {
    title: string
    category: string
    image: string
    backgroundColor: string
  }
> = {
  '텀블러 사용하기': {
    title: '텀블러 사용하기',
    category: '카페',
    image: '/tumbler.svg',
    backgroundColor: '#E9F4EC',
  },

  '장바구니 사용하기': {
    title: '장바구니 사용하기',
    category: '마트·편의점',
    image: '/shopping-bag.svg',
    backgroundColor: '#FFF5E0',
  },

  '포장 시 다회용기 사용하기': {
    title: '포장 시 다회용기 사용하기',
    category: '음식점',
    image: '/container.svg',
    backgroundColor: '#EDF3FC',
  },

  '음식 안 남기기': {
    title: '음식 남기지 않기',
    category: '음식점',
    image: '/empty-plate.svg',
    backgroundColor: '#FCE8E5',
  },

  '일회용 수저·포크 사용 안 하기': {
    title: '일회용 수저·빨대 받지 않기',
    category: '카페·음식점',
    image: '/no-disposable.svg',
    backgroundColor: '#DFE5FB',
  },
}

function MainPage() {
  const navigate = useNavigate()

  const [homeData, setHomeData] = useState<HomeData | null>(null)

  const [missionData, setMissionData] = useState<Mission[]>([])

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchMainData = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken')

        if (!accessToken) {
          setError('로그인이 필요합니다.')
          return
        }

        const [home, missions] = await Promise.all([
          getHome(accessToken),
          getMissions(accessToken),
        ])

        setHomeData(home)
        setMissionData(missions)
      } catch (error) {
        console.error('홈 화면 조회 실패:', error)

        setError('홈 정보를 불러오지 못했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMainData()
  }, [])

  const weekdays = useMemo(() => {
    const practiceDates = new Set(homeData?.weeklyPracticeDays ?? [])

    const today = new Date()

    const currentDay = today.getDay()

    // 일요일: 0
    // 월요일부터 시작하도록 계산
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay

    const monday = new Date(today)

    monday.setHours(0, 0, 0, 0)
    monday.setDate(today.getDate() + mondayOffset)

    return weekdayLabels.map((label, index) => {
      const date = new Date(monday)

      date.setDate(monday.getDate() + index)

      const year = date.getFullYear()

      const month = String(date.getMonth() + 1).padStart(2, '0')

      const day = String(date.getDate()).padStart(2, '0')

      const dateString = `${year}-${month}-${day}`

      return {
        label,
        completed: practiceDates.has(dateString),
      }
    })
  }, [homeData?.weeklyPracticeDays])

  const todayMissions = useMemo(() => {
    return homeData?.todayMissions.slice(0, 2) ?? []
  }, [homeData?.todayMissions])

  const weeklyPracticeCount = homeData?.weeklyPracticeDays.length ?? 0

  const formatCarbon = (carbonG: number) => {
    if (carbonG >= 1000) {
      const kg = carbonG / 1000

      return {
        value: Number(kg.toFixed(1)),
        unit: 'kg CO₂e',
      }
    }

    return {
      value: carbonG,
      unit: 'g CO₂e',
    }
  }

  const formatCompletedAt = (completedAt: string) => {
    const date = new Date(completedAt)

    const today = new Date()

    const isToday =
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()

    const time = date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    })

    if (isToday) {
      return `오늘 ${time}`
    }

    return date.toLocaleString('ko-KR', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const carbon = formatCarbon(homeData?.totalCarbonG ?? 0)

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
              <img src="/alarm-icon.svg" alt="알림" />
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

        <section className="main-page__growth-card">
          <img
            className="main-page__growth-background"
            src="/home-header.svg"
            alt=""
          />

          <div className="main-page__growth-text">
            <span className="main-page__level">
              Lv. {homeData.character.characterLevel}
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
                      width: '0%',
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

        <section className="main-page__streak-card">
          <div className="main-page__streak-header">
            <div>
              <span className="main-page__fire">🔥</span>

              <strong>
                <em>{homeData.currentStreak}일</em> 연속 실천 중이에요!
              </strong>
            </div>

            <button type="button" onClick={() => navigate('/record')}>
              이번 주 {weeklyPracticeCount}일 실천했어요
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

            <button type="button" onClick={() => navigate('/mission')}>
              전체 보기
              <span>›</span>
            </button>
          </div>

          <div className="main-page__mission-list">
            {todayMissions.length > 0 ? (
              todayMissions.map((mission, index) => {
                const apiMission = missionData.find(
                  (item) => item.missionId === mission.missionId,
                )

                const display = missionDisplayMap[mission.name]

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

                      <img src={display?.image ?? '/tumbler.svg'} alt="" />
                    </div>

                    <div className="main-page__mission-text">
                      <div className="main-page__mission-title-row">
                        <strong>{display?.title ?? mission.name}</strong>

                        <span className="main-page__mission-point">
                          <img src="/point-coin.svg" alt="" />

                          {apiMission?.rewardPoints ?? 0}
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
              <p>오늘 수행 가능한 미션이 없어요.</p>
            )}
          </div>
        </section>

        <section className="main-page__section">
          <div className="main-page__section-header">
            <h2>최근 활동</h2>

            <button type="button" onClick={() => navigate('/record')}>
              전체 보기
              <span>›</span>
            </button>
          </div>

          <div className="main-page__activity-list">
            {homeData.recentActivities.length > 0 ? (
              homeData.recentActivities.map((activity, index) => {
                const display = missionDisplayMap[activity.missionName]

                return (
                  <button
                    key={`${activity.missionId}-${activity.completedAt}-${index}`}
                    type="button"
                    className="main-page__activity-item"
                    onClick={() => navigate('/record')}
                  >
                    <div className="main-page__activity-icon">
                      <img src={display?.image ?? '/tumbler.svg'} alt="" />
                    </div>

                    <div className="main-page__activity-info">
                      <strong>{display?.title ?? activity.missionName}</strong>

                      <span>탄소 감축 실천</span>
                    </div>

                    <div className="main-page__activity-point">
                      <strong>+{activity.carbonReductionG}g</strong>

                      <span>{formatCompletedAt(activity.completedAt)}</span>
                    </div>
                  </button>
                )
              })
            ) : (
              <p>아직 최근 활동이 없어요.</p>
            )}
          </div>
        </section>
      </main>

      <BottomNav active="home" />
    </div>
  )
}

export default MainPage
