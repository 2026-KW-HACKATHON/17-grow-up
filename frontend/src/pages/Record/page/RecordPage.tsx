import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../../../components/BottomNav/BottomNav'
import './RecordPage.css'

type RecordTab = 'mine' | 'friend'
interface MonthlyActivity {
  id: number
  title: string
  place: string
  point: number
  time: string
  image?: string
}

const monthlyActivities: MonthlyActivity[] = [
  {
    id: 1,
    title: '텀블러 사용하기',
    place: '월계동 그린커피',
    point: 50,
    time: '오늘 14:32',
    image: '/tumbler.svg',
  },
  {
    id: 2,
    title: '텀블러 사용하기',
    place: '월계동 그린커피',
    point: 50,
    time: '오늘 14:32',
  },
]
interface Friend {
  id: number
  rank: number
  nickname: string
  streak: number
}

const friends: Friend[] = [
  {
    id: 1,
    rank: 1,
    nickname: '홍길동',
    streak: 8,
  },
  {
    id: 2,
    rank: 2,
    nickname: '나',
    streak: 5,
  },
  {
    id: 3,
    rank: 3,
    nickname: '홍길서',
    streak: 4,
  },
  {
    id: 4,
    rank: 4,
    nickname: '홍길남',
    streak: 3,
  },
  {
    id: 5,
    rank: 5,
    nickname: '홍길북',
    streak: 1,
  },
]

const calendarDays = [
  null,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  21,
  22,
  23,
  24,
  25,
  26,
  27,
  28,
  29,
  30,
]

const completedDays = [1, 2, 3, 4, 5]

function RecordPage() {
  const [activeTab, setActiveTab] = useState<RecordTab>('mine')
  const navigate = useNavigate()

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
              <h2 className="record-page__calendar-title">2026년 9월</h2>

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
                  5<span>일</span>
                </strong>
              </div>

              <div className="record-page__stat">
                <span>최고 기록</span>
                <strong>
                  12<span>일</span>
                </strong>
              </div>

              <div className="record-page__stat">
                <span>누적 실천</span>
                <strong>
                  28<span>회</span>
                </strong>
              </div>
            </section>

            <section className="record-page__monthly">
              <h2>이번 달 실천 내역</h2>

              <div className="record-page__activity-list">
                {monthlyActivities.map((activity) => (
                  <div key={activity.id} className="record-page__activity-item">
                    <div className="record-page__activity-icon">
                      {activity.image ? (
                        <img src={activity.image} alt="" />
                      ) : (
                        <div className="record-page__activity-placeholder" />
                      )}
                    </div>

                    <div className="record-page__activity-info">
                      <strong>{activity.title}</strong>
                      <span>{activity.place}</span>
                    </div>

                    <div className="record-page__activity-point">
                      <strong>+{activity.point}P</strong>
                      <span>{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : (
          <>
            <section className="record-page__friend-section">
              <h2 className="record-page__friend-title">친구들의 초록 성장</h2>

              <div className="record-page__friend-list">
                {friends.map((friend) => (
                  <div
                    key={friend.id}
                    className={`record-page__friend-item ${
                      friend.nickname === '나'
                        ? 'record-page__friend-item--me'
                        : ''
                    }`}
                  >
                    <span
                      className={`record-page__friend-rank ${
                        friend.rank === 1
                          ? 'record-page__friend-rank--first'
                          : ''
                      }`}
                    >
                      {friend.rank}
                    </span>

                    <div className="record-page__friend-avatar" />

                    <strong className="record-page__friend-name">
                      {friend.nickname}
                    </strong>

                    <span className="record-page__friend-streak">
                      {friend.streak}일 연속
                    </span>
                  </div>
                ))}
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
