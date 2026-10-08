import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { getPartners, type Partner } from '../../api/partnerApi'

import './StoreDetailPage.css'

type StoreCategory = '전체' | '카페' | '음식점' | '마트' | '편의점'

const categories: StoreCategory[] = ['전체', '카페', '음식점', '마트', '편의점']

// 백엔드 카테고리 값을 화면 카테고리로 변환
function getStoreCategory(category?: string | null): StoreCategory | null {
  if (!category) return null

  const normalized = category.trim().toUpperCase()

  switch (normalized) {
    case 'CAFE':
    case '카페':
      return '카페'

    case 'RESTAURANT':
    case '음식점':
      return '음식점'

    case 'MART':
    case '마트':
      return '마트'

    case 'CONVENIENCE_STORE':
    case 'CONVENIENCE':
    case '편의점':
      return '편의점'

    default:
      return null
  }
}

function StoreDetailPage() {
  const navigate = useNavigate()

  const [partners, setPartners] = useState<Partner[]>([])
  const [selectedCategory, setSelectedCategory] =
    useState<StoreCategory>('전체')

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // 제휴 매장 목록 조회
  useEffect(() => {
    let cancelled = false

    const fetchPartners = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken')

        if (!accessToken) {
          setError('로그인이 필요합니다.')
          return
        }

        const data = await getPartners(accessToken)

        if (!cancelled) {
          setPartners(data)
        }
      } catch (error) {
        if (!cancelled) {
          console.error('제휴처 목록 조회 실패:', error)
          setError('제휴처 목록을 불러오지 못했습니다.')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void fetchPartners()

    return () => {
      cancelled = true
    }
  }, [])

  // 선택한 카테고리에 맞는 매장만 표시
  const filteredPartners =
    selectedCategory === '전체'
      ? partners
      : partners.filter(
          (partner) => getStoreCategory(partner.category) === selectedCategory,
        )

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
          <p role="alert">{error}</p>
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

        {/* 카테고리 선택 */}
        <nav
          className="store-detail-page__categories"
          aria-label="매장 카테고리"
        >
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={`store-detail-page__category ${
                selectedCategory === category
                  ? 'store-detail-page__category--active'
                  : ''
              }`}
              onClick={() => setSelectedCategory(category)}
              aria-pressed={selectedCategory === category}
            >
              {category}
            </button>
          ))}
        </nav>

        {/* 제휴 매장 목록 */}
        <section className="store-detail-page__list">
          {filteredPartners.length > 0 ? (
            filteredPartners.map((partner) => {
              const storeCategory = getStoreCategory(partner.category)

              return (
                <div
                  key={partner.partnerId}
                  className="store-detail-page__store"
                >
                  <div className="store-detail-page__thumbnail" />

                  <div className="store-detail-page__store-info">
                    <strong>{partner.partnerName}</strong>

                    <span>{storeCategory ?? '제휴 매장'}</span>
                  </div>
                </div>
              )
            })
          ) : (
            <p className="store-detail-page__empty">
              {selectedCategory === '전체'
                ? '등록된 제휴 매장이 없어요.'
                : '해당 카테고리의 제휴 매장이 없어요.'}
            </p>
          )}
        </section>
      </main>
    </div>
  )
}

export default StoreDetailPage
