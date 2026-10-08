import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { getPartners, type Partner } from '../../api/partnerApi'

import './StoreDetailPage.css'

function StoreDetailPage() {
  const navigate = useNavigate()

  const [partners, setPartners] = useState<Partner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken')

        if (!accessToken) {
          setError('로그인이 필요합니다.')
          return
        }

        const data = await getPartners(accessToken)

        setPartners(data)
      } catch (error) {
        console.error('제휴처 목록 조회 실패:', error)

        setError('제휴처 목록을 불러오지 못했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPartners()
  }, [])

  if (isLoading) {
    return (
      <div className="store-detail-page">
        <main className="store-detail-page__content">
          <p>제휴 매장을 불러오는 중...</p>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="store-detail-page">
        <main className="store-detail-page__content">
          <p>{error}</p>
        </main>
      </div>
    )
  }

  return (
    <div className="store-detail-page">
      <main className="store-detail-page__content">
        <header className="store-detail-page__header">
          <button
            type="button"
            className="store-detail-page__back-button"
            onClick={() => navigate(-1)}
            aria-label="뒤로가기"
          >
            ‹
          </button>

          <h1>월계1동 제휴 매장</h1>
        </header>

        <section className="store-detail-page__list">
          {partners.length > 0 ? (
            partners.map((partner) => (
              <button
                key={partner.partnerId}
                type="button"
                className="store-detail-page__store"
              >
                <div className="store-detail-page__thumbnail" />

                <div className="store-detail-page__store-info">
                  <strong>{partner.partnerName}</strong>

                  <span>제휴 매장</span>
                </div>
              </button>
            ))
          ) : (
            <p>등록된 제휴 매장이 없어요.</p>
          )}
        </section>
      </main>
    </div>
  )
}

export default StoreDetailPage
