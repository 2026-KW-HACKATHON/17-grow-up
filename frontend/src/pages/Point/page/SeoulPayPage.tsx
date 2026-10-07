import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { convertPoints } from '../../../api/pointApi'
import { getMyInfo } from '../../../api/userApi'
import Button from '../../../components/Button/Button'
import './SeoulPayPage.css'

const CONVERSION_POINTS = 10000

function SeoulPayPage() {
  const navigate = useNavigate()

  const [availablePoints, setAvailablePoints] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchAvailablePoints = async () => {
      try {
        const data = await getMyInfo()
        setAvailablePoints(data.availablePoints)
      } catch (error) {
        console.error('전환 가능 포인트 조회 실패:', error)
      }
    }

    fetchAvailablePoints()
  }, [])

  const handleExchange = async () => {
    if (isLoading) return

    if (availablePoints < CONVERSION_POINTS) {
      alert('서울페이로 전환할 수 있는 포인트가 부족합니다.')
      return
    }

    const isConfirmed = window.confirm(
      '10,000P를 서울페이 100원으로 전환하시겠습니까?',
    )

    if (!isConfirmed) return

    try {
      setIsLoading(true)

      const data = await convertPoints(CONVERSION_POINTS)

      setAvailablePoints(data.remainingPoints)

      alert(
        `${data.convertedPoints.toLocaleString()}P가 서울페이 ${data.seoulPayAmount.toLocaleString()}원으로 전환되었습니다.`,
      )
    } catch (error) {
      if (error instanceof Error && error.message === 'INSUFFICIENT_POINTS') {
        alert('서울페이로 전환할 수 있는 포인트가 부족합니다.')
      } else if (
        error instanceof Error &&
        error.message === 'VALIDATION_ERROR'
      ) {
        alert('전환할 포인트를 확인해 주세요.')
      } else if (
        error instanceof Error &&
        error.message === 'UNAUTHORIZED'
      ) {
        alert('로그인이 필요합니다.')
      } else if (
        error instanceof Error &&
        error.message === 'FORBIDDEN'
      ) {
        alert('서울페이 전환 권한이 없습니다.')
      } else {
        alert('서울페이 전환에 실패했습니다.')
      }

      console.error('서울페이 전환 처리 실패:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="seoulpay-page">
      <header className="seoulpay-page__header">
        <button
          type="button"
          className="seoulpay-page__back"
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
        >
          <img src="/chevron-left.svg" alt="" />
        </button>

        <h1>서울페이 전환</h1>
      </header>

      <main className="seoulpay-page__content">
        <section className="seoulpay-page__intro">
          <img
            className="seoulpay-page__logo"
            src="/seoul-pay.svg"
            alt="서울페이"
          />

          <p className="seoulpay-page__description">
            <span>모은 포인트를</span>
            <strong>서울페이로 전환할 수 있어요.</strong>
          </p>
        </section>

        <section className="seoulpay-page__point-card">
          <div className="seoulpay-page__available">
            <span>전환 가능 포인트</span>
            <strong>{availablePoints.toLocaleString()} P</strong>
          </div>

          <div className="seoulpay-page__divider" />

          <div className="seoulpay-page__condition">
            <div className="seoulpay-page__condition-row">
              <span>전환 최소 포인트</span>
              <strong>10,000 P</strong>
            </div>

            <div className="seoulpay-page__condition-row">
              <span>전환 단위</span>
              <strong>10,000 P 단위</strong>
            </div>
          </div>
        </section>

        <div className="seoulpay-page__button">
          <Button onClick={handleExchange}>
            {isLoading ? '전환 중...' : '10,000 P 전환하기'}
          </Button>
        </div>

        <p className="seoulpay-page__notice">
          전환된 포인트는 서울페이 앱에서
          <br />
          확인할 수 있습니다.
        </p>
      </main>
    </div>
  )
}

export default SeoulPayPage