import { useNavigate } from 'react-router-dom'
import BottomNav from '../../components/BottomNav/BottomNav'
import './AlarmPage.css'

interface Alarm {
  id: number
  title: string
  description: string
  unread: boolean
}

const alarms: Alarm[] = [
  {
    id: 1,
    title: '포인트가 1000P 쌓였어요!',
    description: '서울페이로 교환하러 가볼까요?',
    unread: true,
  },
  {
    id: 2,
    title: '포인트가 1000P 쌓였어요!',
    description: '서울페이로 교환하러 가볼까요?',
    unread: true,
  },
  {
    id: 3,
    title: '포인트가 1000P 쌓였어요!',
    description: '서울페이로 교환하러 가볼까요?',
    unread: false,
  },
  {
    id: 4,
    title: '포인트가 1000P 쌓였어요!',
    description: '서울페이로 교환하러 가볼까요?',
    unread: false,
  },
  {
    id: 5,
    title: '포인트가 1000P 쌓였어요!',
    description: '서울페이로 교환하러 가볼까요?',
    unread: true,
  },
  {
    id: 6,
    title: '포인트가 1000P 쌓였어요!',
    description: '서울페이로 교환하러 가볼까요?',
    unread: false,
  },
  {
    id: 7,
    title: '포인트가 1000P 쌓였어요!',
    description: '서울페이로 교환하러 가볼까요?',
    unread: false,
  },
]

function AlarmPage() {
  const navigate = useNavigate()

  return (
    <div className="alarm-page">
      <main className="alarm-page__content">
        <header className="alarm-page__header">
          <button
            type="button"
            className="alarm-page__back-button"
            onClick={() => navigate(-1)}
            aria-label="뒤로가기"
          >
            ‹
          </button>

          <h1>알림창</h1>
        </header>

        <section className="alarm-page__list">
          {alarms.map((alarm) => (
            <button
              key={alarm.id}
              type="button"
              className="alarm-page__item"
              onClick={() => navigate('/point/seoulpay')}
            >
              <div className="alarm-page__left">
                <div className="alarm-page__icon-wrap">
                  {alarm.unread && <span className="alarm-page__unread-dot" />}

                  <div className="alarm-page__icon">
                    <img
                      className="alarm-page__icon"
                      src="/carbon-icon.svg"
                      alt="탄소 아이콘"
                    />
                  </div>
                </div>

                <div className="alarm-page__text">
                  <strong>{alarm.title}</strong>
                  <span>{alarm.description}</span>
                </div>
              </div>

              <span className="alarm-page__arrow">›</span>
            </button>
          ))}
        </section>
      </main>

      <BottomNav active="home" />
    </div>
  )
}

export default AlarmPage
