import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import BottomNav from '../../../components/BottomNav/BottomNav'

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

const now = new Date()

const YEAR = now.getFullYear()
const MONTH = now.getMonth() + 1

const missionImageMap: Record<string, string> = {
  '텀블러 사용하기': '/tumbler.svg',
  '장바구니 사용하기': '/shopping-bag.svg',
  '포장 시 다회용기 사용하기': '/container.svg',
  '음식 안 남기기': '/empty-plate.svg',
  '일회용 수저·포크 사용 안 하기': '/no-disposable.svg',
}

function RecordPage() {
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<RecordTab>('mine')

  const [summary, setSummary] = useState<RecordSummary | null>(null)

  const [histories, setHistories] = useState<RecordHistory[]>([])

  const [practiceDays, setPracticeDays] = useState<PracticeDay[]>([])

  const [friends, setFriends] = useState<FriendRecord[]>([])

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchRecordData = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken')

        if (!accessToken) {
          setError('로그인이 필요합니다.')
          return
        }

        const [summaryData, historyData, calendarData, friendData] =
          await Promise.all([
            getRecordSummary(accessToken),
            getRecordHistory(accessToken),
            getRecordCalendar(accessToken, YEAR, MONTH),
            getFriendRecords(accessToken),
          ])

        setSummary(summaryData)
        setHistories(historyData)
        setPracticeDays(calendarData.practiceDays)
        setFriends(friendData)
      } catch (error) {
        console.error('실천 기록 조회 실패:', error)

        setError('실천 기록을 불러오지 못했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecordData()
  }, [])

  const calendarDays = useMemo(() => {
    const firstDay = new Date(YEAR, MONTH - 1, 1)

    const lastDate = new Date(YEAR, MONTH, 0).getDate()

    // JS: 일요일 0 ~ 토요일 6
    // 화면: 월요일부터 시작
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

  const completedDays = useMemo(() => {
    return practiceDays.map((practice) => {
      const [, , day] = practice.date.split('-').map(Number)

      return day
    })
  }, [practiceDays])

  const formatCompletedAt = (completedAt: string) => {
    const date = new Date(completedAt)

    return date.toLocaleString('ko-KR', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

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
                  {summary?.longestStreak ?? 0}
                  <span>일</span>
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

            <section className="record-page__monthly">
              <h2>이번 달 실천 내역</h2>

              <div className="record-page__activity-list">
                {histories.length > 0 ? (
                  histories.map((activity, index) => (
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
                        <strong>+{activity.carbonReductionG}g</strong>

                        <span>{formatCompletedAt(activity.completedAt)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="record-page__empty">아직 실천 내역이 없어요.</p>
                )}
              </div>
            </section>
          </>
        ) : (
          <>
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

                      <div className="record-page__friend-avatar" />

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
