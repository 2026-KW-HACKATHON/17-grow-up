import './MissionProcess.css'

function MissionProcess() {
  return (
    <section className="mission-process">
      <h2>이렇게 실천해요</h2>

      <div className="mission-process__content">
        <div className="mission-process__step">
          <div className="mission-process__icon">
            <span>🥤</span>
          </div>

          <p>
            음료 주문 시
            <br />
            텀블러 제시
          </p>
        </div>

        <span className="mission-process__arrow">→</span>

        <div className="mission-process__step">
          <div className="mission-process__icon">
            <span>▦</span>
          </div>

          <p>
            매장에서
            <br />
            QR 인증
          </p>
        </div>
      </div>
    </section>
  )
}

export default MissionProcess
