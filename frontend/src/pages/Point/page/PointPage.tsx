import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  getPointConversions,
  getPointHistory,
  type PointConversion,
  type PointHistory,
} from '../../../api/pointApi'
import BottomNav from '../../../components/BottomNav/BottomNav'
import PointHistoryItem from '../components/PointHistoryItem'
import PointTabs, { type PointTabType } from '../components/PointTabs'
import './PointPage.css'

const missionImageMap: Record<string, string> = {
  '텀블러 사용하기': '/tumbler.svg',
  '장바구니 사용하기': '/shopping-bag.svg',
  '포장 시 다회용기 사용하기': '/container.svg',
  '음식 안 남기기': '/empty-plate.svg',
  '일회용 수저·포크 사용 안 하기': '/no-disposable.svg',
}

function formatHistoryTime(earnedAt: string) {
  const date = new Date(earnedAt)

  return date.toLocaleString('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatConversionTime(createdAt: string) {
  const date = new Date(createdAt)

  return date.toLocaleString('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function PointPage() {
  const [activeTab, setActiveTab] = useState<PointTabType>('earn')
  const [availablePoints, setAvailablePoints] = useState(0)
  const [monthlyEarnedPoints, setMonthlyEarnedPoints] = useState(0)
  const [pointHistories, setPointHistories] = useState<PointHistory[]>([])
  const [conversions, setConversions] = useState<PointConversion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    const fetchPointData = async () => {
      try {
        setIsLoading(true)
        setHasError(false)

        const [historyData, conversionData] = await Promise.all([
          getPointHistory(),
          getPointConversions(),
        ])

        setAvailablePoints(historyData.availablePoints)
        setMonthlyEarnedPoints(historyData.monthlyEarnedPoints)
        setPointHistories(historyData.histories)
        setConversions(conversionData.conversions)
      } catch (error) {
        console.error('포인트 정보 조회 실패:', error)
        setHasError(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPointData()
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

            <img src="/chevron-right.svg" alt="" />
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
            이번 달{' '}
            <span>+{monthlyEarnedPoints.toLocaleString()}P</span>를 모았어요!
          </p>
        </section>

        <PointTabs activeTab={activeTab} onChange={setActiveTab} />

        <section className="point-page__history">
          {isLoading ? (
            <div className="point-page__empty">불러오는 중...</div>
          ) : hasError ? (
            <div className="point-page__empty">
              포인트 내역을 불러오지 못했습니다.
            </div>
          ) : activeTab === 'earn' ? (
            pointHistories.length > 0 ? (
              pointHistories.map((history, index) => (
                <PointHistoryItem
                  key={`${history.missionId}-${history.earnedAt}-${index}`}
                  icon={missionImageMap[history.missionName] ?? '/tumbler.svg'}
                  title={history.missionName}
                  place={history.partnerName}
                  point={history.earnedPoints}
                  time={formatHistoryTime(history.earnedAt)}
                />
              ))
            ) : (
              <div className="point-page__empty">
                적립 내역이 없습니다.
              </div>
            )
          ) : conversions.length > 0 ? (
            conversions.map((conversion) => (
              <PointHistoryItem
                key={conversion.conversionId}
                icon="/point-coin.svg"
                title="서울페이 전환"
                place={`${conversion.seoulPayAmount.toLocaleString()}원 전환`}
                point={conversion.convertedPoints}
                time={formatConversionTime(conversion.createdAt)}
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