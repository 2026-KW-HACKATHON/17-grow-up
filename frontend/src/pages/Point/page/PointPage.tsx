import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { getMyInfo } from '../../../api/userApi'
import BottomNav from '../../../components/BottomNav/BottomNav'
import PointHistoryItem from '../components/PointHistoryItem'
import PointTabs, { type PointTabType } from '../components/PointTabs'
import './PointPage.css'

interface PointHistory {
  id: number
  icon: string
  title: string
  place: string
  point: number
  time: string
}

const pointHistory: PointHistory[] = [
  {
    id: 1,
    icon: '/tumbler.svg',
    title: '텀블러 사용하기',
    place: '월계동 그린커피',
    point: 50,
    time: '오늘 14:32',
  },
  {
    id: 2,
    icon: '/tumbler.svg',
    title: '텀블러 사용하기',
    place: '월계동 그린커피',
    point: 50,
    time: '오늘 14:32',
  },
  {
    id: 3,
    icon: '/tumbler.svg',
    title: '텀블러 사용하기',
    place: '월계동 그린커피',
    point: 50,
    time: '오늘 14:32',
  },
  {
    id: 4,
    icon: '/tumbler.svg',
    title: '텀블러 사용하기',
    place: '월계동 그린커피',
    point: 50,
    time: '오늘 14:32',
  },
  {
    id: 5,
    icon: '/tumbler.svg',
    title: '텀블러 사용하기',
    place: '월계동 그린커피',
    point: 50,
    time: '오늘 14:32',
  },
  {
    id: 6,
    icon: '/tumbler.svg',
    title: '텀블러 사용하기',
    place: '월계동 그린커피',
    point: 50,
    time: '오늘 14:32',
  },
  {
    id: 7,
    icon: '/tumbler.svg',
    title: '텀블러 사용하기',
    place: '월계동 그린커피',
    point: 50,
    time: '오늘 14:32',
  },
]

function PointPage() {
  const [activeTab, setActiveTab] = useState<PointTabType>('earn')
  const [availablePoints, setAvailablePoints] = useState(0)

  const navigate = useNavigate()

  useEffect(() => {
    const fetchPointStatus = async () => {
      try {
        const data = await getMyInfo()
        setAvailablePoints(data.availablePoints)
      } catch (error) {
        console.error('포인트 현황 조회 실패:', error)
      }
    }

    fetchPointStatus()
  }, [])

  return (
    <div className="point-page">
      <main className="point-page__content">
        <header className="point-page__header">
          <h1 className="point-page__title">내 포인트</h1>

          <button
            type="button"
            className="point-page__seoulpay"
            onClick={() => navigate('/point/seoulpay')}
          >
            <span>서울페이 전환</span>

            <img
              src="/chevron-right.svg"
              alt=""
            />
          </button>
        </header>

        <section className="point-page__summary">
          <div className="point-page__balance">
            <img
              className="point-page__coin"
              src="/point-coin.svg"
              alt=""
            />

            <strong>{availablePoints.toLocaleString()} P</strong>
          </div>

          <p className="point-page__monthly">
            이번 달에 <span>+320</span>을 모았어요!
          </p>
        </section>

        <PointTabs
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        <section className="point-page__history">
          {activeTab === 'earn' ? (
            pointHistory.map((history) => (
              <PointHistoryItem
                key={history.id}
                icon={history.icon}
                title={history.title}
                place={history.place}
                point={history.point}
                time={history.time}
              />
            ))
          ) : (
            <div className="point-page__empty">
              전환 내역이 없습니다.
            </div>
          )}
        </section>
      </main>

      <BottomNav active="point" />
    </div>
  )
}

export default PointPage