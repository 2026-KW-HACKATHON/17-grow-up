import { useNavigate } from 'react-router-dom'
import Button from '../../../components/Button/Button'
import './SeoulPayPage.css'

function SeoulPayPage() {
  const navigate = useNavigate()

  const handleExchange = () => {
    // 추후 서울페이 전환 API 연결
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
            <strong>1,230 P</strong>
          </div>

          <div className="seoulpay-page__divider" />

          <div className="seoulpay-page__condition">
            <div className="seoulpay-page__condition-row">
              <span>전환 최소 포인트</span>
              <strong>1,000 P</strong>
            </div>

            <div className="seoulpay-page__condition-row">
              <span>전환 단위</span>
              <strong>1,000 P 단위</strong>
            </div>
          </div>
        </section>

        <div className="seoulpay-page__button">
          <Button onClick={handleExchange}>
            1,000 P 전환하기
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