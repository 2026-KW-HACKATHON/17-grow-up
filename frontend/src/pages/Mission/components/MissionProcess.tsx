import './MissionProcess.css'

interface MissionProcessProps {
  image: string
  title: string
}

const missionProcessMap: Record<
  string,
  {
    text: string[]
  }
> = {
  '텀블러 사용하기': {
    text: ['음료 주문 시', '텀블러 제시'],
  },
  '장바구니 사용하기': {
    text: ['물건 구매 시', '비닐 대신 장바구니 사용'],
  },
  '포장 시 다회용기 사용하기': {
    text: ['음식 포장 시', '다회용기 사용'],
  },
  '음식 남기지 않기': {
    text: ['식사 후', '음식을 남기지 않기'],
  },
  '일회용 수저·빨대 받지 않기': {
    text: ['주문 시', '일회용품 받지 않기'],
  },
}

function MissionProcess({ image, title }: MissionProcessProps) {
  const processIcon = image.replace('.svg', '-icon.svg')

  const process = missionProcessMap[title] ?? {
    text: ['미션 실천 후', '직원에게 보여주세요'],
  }

  return (
    <section className="mission-process">
      <h2>이렇게 실천해요</h2>

      <div className="mission-process__content">
        <div className="mission-process__step">
          <div className="mission-process__icon">
            <img src={processIcon} alt={title} />
          </div>

          <p>
            {process.text[0]}
            <br />
            {process.text[1]}
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
