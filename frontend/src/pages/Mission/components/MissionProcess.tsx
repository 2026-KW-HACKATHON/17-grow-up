import './MissionProcess.css'

interface MissionProcessProps {
  image: string
  title: string
}

function MissionProcess({ image, title }: MissionProcessProps) {
  return (
    <section className="mission-process">
      <h2>이렇게 실천해요</h2>

      <div className="mission-process__content">
        <div className="mission-process__step">
          <div className="mission-process__icon">
            <img src={image} alt={title} />
          </div>

          <p>
            미션 실천 후
            <br />
            직원에게 보여주세요
          </p>
        </div>

        <span className="mission-process__arrow">→</span>

        <div className="mission-process__step">
          <div className="mission-process__icon">
            <img src="/qr-image.svg" alt="QR 인증" />
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
