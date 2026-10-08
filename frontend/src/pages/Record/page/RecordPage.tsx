import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import BottomNav from '../../../components/BottomNav/BottomNav'

import { getMissions, type Mission } from '../../../api/missionApi'

import {
  getFriendRecords,
  getRecordCalendar,
  getRecordHistory,
  getRecordSummary,
  type FriendRecord,
  type PracticeDay,
  type RecordHistory,
  type RecordSummary,
} from '../../../api/recordApi'

import './RecordPage.css'

type RecordTab = 'mine' | 'friend'

// 한국 시간 기준 현재 연도와 월
const now = new Date()

const koreanDate = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: 'numeric',
}).formatToParts(now)

const YEAR = Number(koreanDate.find((part) => part.type === 'year')?.value)

const MONTH = Number(koreanDate.find((part) => part.type === 'month')?.value)

const missionImageMap: Record<string, string> = {
  '텀블러 사용하기': '/tumbler.svg',
  '장바구니 사용하기': '/shopping-bag.svg',
  '포장 시 다회용기 사용하기': '/container.svg',
  '음식 안 남기기': '/empty-plate.svg',
  '일회용 수저·포크 사용 안 하기': '/no-disposable.svg',
}

// 한국 시간 기준 날짜 추출
function getKoreanYearMonth(dateString: string) {
  const date = new Date(dateString)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: 'numeric',
  }).formatToParts(date)

  return {
    year: Number(parts.find((part) => part.type === 'year')?.value),
    month: Number(parts.find((part) => part.type === 'month')?.value),
  }
}

// 실천 완료 일시 표시
function formatCompletedAt(completedAt: string) {
  const date = new Date(completedAt)

  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return date.toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function RecordPage() {
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<RecordTab>('mine')

  const [summary, setSummary] = useState<RecordSummary | null>(null)

  const [histories, setHistories] = useState<RecordHistory[]>([])

  const [missions, setMissions] = useState<Mission[]>([])

  const [practiceDays, setPracticeDays] = useState<PracticeDay[]>([])

  const [friends, setFriends] = useState<FriendRecord[]>([])

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // 1. 실천 기록 조회
  useEffect(() => {
    let cancelled = false

    const fetchRecordData = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken')

        if (!accessToken) {
          setError('로그인이 필요합니다.')
          return
        }

        // 미션 조회 실패 시에도 기록 페이지는 유지
        const [
          summaryData,
          historyData,
          calendarData,
          friendData,
          missionData,
        ] = await Promise.all([
          getRecordSummary(accessToken),
          getRecordHistory(accessToken),
          getRecordCalendar(accessToken, YEAR, MONTH),
          getFriendRecords(accessToken),

          getMissions(accessToken).catch((error) => {
            console.error('미션 보상 조회 실패:', error)
            return [] as Mission[]
          }),
        ])

        if (cancelled) return

        setSummary(summaryData)
        setMissions(missionData)

        // 이번 달에 완료한 기록만 필터링
        const monthlyHistories = historyData.filter((history) => {
          const date = getKoreanYearMonth(history.completedAt)

          if (!date) return false

          return date.year === YEAR && date.month === MONTH
        })

        setHistories(monthlyHistories)
        setPracticeDays(calendarData.practiceDays)
        setFriends(friendData)
      } catch (error) {
        if (!cancelled) {
          console.error('실천 기록 조회 실패:', error)

          setError('실천 기록을 불러오지 못했습니다.')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void fetchRecordData()

    return () => {
      cancelled = true
    }
  }, [])

  // 2. 미션 ID별 포인트 매핑
  const missionPointsMap = useMemo(() => {
    return new Map<number, number>(
      missions.map((mission) => [mission.missionId, mission.rewardPoints]),
    )
  }, [missions])

  // 3. 달력 날짜 생성
  const calendarDays = useMemo(() => {
    const firstDay = new Date(YEAR, MONTH - 1, 1)

    const lastDate = new Date(YEAR, MONTH, 0).getDate()

    // 월요일부터 시작
    const firstDayIndex = (firstDay.getDay() + 6) % 7

    const days: (number | null)[] = []

    for (let i = 0; i < firstDayIndex; i += 1) {
      days.push(null)
    }

    for (let day = 1; day <= lastDate; day += 1) {
      days.push(day)
    }

    return days
  }, [])

  // 4. 미션 완료한 날짜
  const completedDays = useMemo(() => {
    return practiceDays.map((practice) => {
      const [, , day] = practice.date.split('-').map(Number)

      return day
    })
  }, [practiceDays])

  if (isLoading) {
    return (
      <div className="record-page">
        <main className="record-page__content">
          <p>실천 기록을 불러오는 중...</p>
        </main>

        <BottomNav active="record" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="record-page">
        <main className="record-page__content">
          <p>{error}</p>
        </main>

        <BottomNav active="record" />
      </div>
    )
  }

  return (
    <div className="record-page">
      <main className="record-page__content">
        <h1 className="record-page__title">실천 기록</h1>

        {/* 탭 */}
        <div className="record-page__tabs">
          <button
            type="button"
            className={`record-page__tab ${
              activeTab === 'mine' ? 'record-page__tab--active' : ''
            }`}
            onClick={() => setActiveTab('mine')}
          >
            나의 기록
          </button>

          <button
            type="button"
            className={`record-page__tab ${
              activeTab === 'friend' ? 'record-page__tab--active' : ''
            }`}
            onClick={() => setActiveTab('friend')}
          >
            친구 기록
          </button>
        </div>

        {activeTab === 'mine' ? (
          <>
            {/* 실천 달력 */}
            <section className="record-page__calendar">
              <h2 className="record-page__calendar-title">
                {YEAR}년 {MONTH}월
              </h2>

              <div className="record-page__week">
                <span>월</span>
                <span>화</span>
                <span>수</span>
                <span>목</span>
                <span>금</span>
                <span>토</span>
                <span>일</span>
              </div>

              <div className="record-page__days">
                {calendarDays.map((day, index) => {
                  if (day === null) {
                    return (
                      <div
                        key={`empty-${index}`}
                        className="record-page__day"
                      />
                    )
                  }

                  const isCompleted = completedDays.includes(day)

                  return (
                    <div
                      key={day}
                      className={`record-page__day ${
                        isCompleted ? 'record-page__day--completed' : ''
                      }`}
                    >
                      {day}
                    </div>
                  )
                })}
              </div>
            </section>

            {/* 실천 통계 */}
            <section className="record-page__stats">
              <div className="record-page__stat">
                <span>연속 실천</span>

                <strong>
                  {summary?.currentStreak ?? 0}
                  <span>일</span>
                </strong>
              </div>

              <div className="record-page__stat">
                <span>최고 기록</span>

                <strong>
                  {summary?.longestStreak ?? '-'}
                  <span>{summary?.longestStreak != null ? '일' : ''}</span>
                </strong>
              </div>

              <div className="record-page__stat">
                <span>누적 실천</span>

                <strong>
                  {summary?.totalMissionCount ?? 0}
                  <span>회</span>
                </strong>
              </div>
            </section>

            {/* 이번 달 실천 내역 */}
            <section className="record-page__monthly">
              <h2>이번 달 실천 내역</h2>

              <div className="record-page__activity-list">
                {histories.length > 0 ? (
                  histories.map((activity, index) => {
                    const points = missionPointsMap.get(activity.missionId)

                    return (
                      <div
                        key={`${activity.missionId}-${activity.completedAt}-${index}`}
                        className="record-page__activity-item"
                      >
                        <div className="record-page__activity-icon">
                          <img
                            src={
                              missionImageMap[activity.missionName] ??
                              '/tumbler.svg'
                            }
                            alt=""
                          />
                        </div>

                        <div className="record-page__activity-info">
                          <strong>{activity.missionName}</strong>

                          <span>탄소 감축 실천</span>
                        </div>

                        <div className="record-page__activity-point">
                          <strong>
                            {points !== undefined
                              ? `+${points.toLocaleString()}P`
                              : '포인트 정보 없음'}
                          </strong>

                          <span>{formatCompletedAt(activity.completedAt)}</span>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="record-page__empty">아직 실천 내역이 없어요.</p>
                )}
              </div>
            </section>
          </>
        ) : (
          <>
            {/* 친구 기록 */}
            <section className="record-page__friend-section">
              <h2 className="record-page__friend-title">친구들의 초록 성장</h2>

              <div className="record-page__friend-list">
                {friends.length > 0 ? (
                  friends.map((friend, index) => (
                    <div
                      key={friend.friendId}
                      className="record-page__friend-item"
                    >
                      <span
                        className={`record-page__friend-rank ${
                          index === 0 ? 'record-page__friend-rank--first' : ''
                        }`}
                      >
                        {index + 1}
                      </span>

                      <div className="record-page__friend-avatar">
                        <img
                          src="/profile-character.svg"
                          alt=""
                          className="record-page__friend-avatar-image"
                        />
                      </div>
                      <strong className="record-page__friend-name">
                        {friend.nickname}
                      </strong>

                      <span className="record-page__friend-streak">
                        {friend.currentStreak}일 연속
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="record-page__empty">
                    아직 연결된 친구가 없어요.
                  </p>
                )}
              </div>
            </section>

            <button
              type="button"
              className="record-page__friend-button"
              onClick={() => navigate('/record/friend-add')}
            >
              친구 초대하기
            </button>
          </>
        )}
      </main>

      <BottomNav active="record" />
    </div>
  )
}

export default RecordPage
