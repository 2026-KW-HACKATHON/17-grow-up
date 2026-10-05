import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './StoreDetailPage.css'

interface Store {
  id: number
  name: string
  category: '카페' | '음식점' | '마트' | '편의점'
}

const stores: Store[] = [
  {
    id: 1,
    name: '텐퍼센트 커피 월계역점',
    category: '카페',
  },
  {
    id: 2,
    name: '텐퍼센트 커피 월계역점',
    category: '카페',
  },
  {
    id: 3,
    name: '텐퍼센트 커피 월계역점',
    category: '카페',
  },
  {
    id: 4,
    name: '텐퍼센트 커피 월계역점',
    category: '카페',
  },
  {
    id: 5,
    name: '텐퍼센트 커피 월계역점',
    category: '카페',
  },
  {
    id: 6,
    name: '텐퍼센트 커피 월계역점',
    category: '카페',
  },
  {
    id: 7,
    name: '텐퍼센트 커피 월계역점',
    category: '카페',
  },
  {
    id: 8,
    name: '텐퍼센트 커피 월계역점',
    category: '카페',
  },
]

const categories = ['전체', '카페', '음식점', '마트', '편의점'] as const

type Category = (typeof categories)[number]

function StoreDetailPage() {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState<Category>('전체')

  const filteredStores = useMemo(() => {
    if (selectedCategory === '전체') {
      return stores
    }

    return stores.filter((store) => store.category === selectedCategory)
  }, [selectedCategory])

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

        <div className="store-detail-page__filters">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={`store-detail-page__filter ${
                selectedCategory === category
                  ? 'store-detail-page__filter--active'
                  : ''
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <section className="store-detail-page__list">
          {filteredStores.map((store) => (
            <button
              key={store.id}
              type="button"
              className="store-detail-page__store"
            >
              <div className="store-detail-page__thumbnail" />

              <div className="store-detail-page__store-info">
                <strong>{store.name}</strong>
                <span>{store.category}</span>
              </div>
            </button>
          ))}
        </section>
      </main>
    </div>
  )
}

export default StoreDetailPage
