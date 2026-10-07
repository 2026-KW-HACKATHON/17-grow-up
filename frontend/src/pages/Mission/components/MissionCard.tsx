import { useNavigate } from 'react-router-dom'
import type { Mission } from '../../../api/missionApi'
import './MissionCard.css'

interface MissionCardProps {
  mission: Mission
}

const missionDisplayMap: Record<
  string,
  {
    title: string
    category: string
  }
> = {
  '텀블러 사용하기': {
    title: '텀블러 사용하기',
    category: '카페',
  },
  '장바구니 사용하기': {
    title: '장바구니 사용하기',
    category: '마트·편의점',
  },
  '포장 시 다회용기 사용하기': {
    title: '포장 시 다회용기 사용하기',
    category: '음식점',
  },
  '음식 안 남기기': {
    title: '음식 남기지 않기',
    category: '음식점',
  },
  '일회용 수저·포크 사용 안 하기': {
    title: '일회용 수저·빨대 받지 않기',
    category: '카페·음식점',
  },
}

const missionImageMap: Record<string, string> = {
  '텀블러 사용하기': '/tumbler.svg',
  '장바구니 사용하기': '/shopping-bag.svg',
  '포장 시 다회용기 사용하기': '/container.svg',
  '음식 안 남기기': '/empty-plate.svg',
  '일회용 수저·포크 사용 안 하기': '/no-disposable.svg',
}

const missionBackgroundMap: Record<string, string> = {
  '텀블러 사용하기': '#E9F4EC',
  '장바구니 사용하기': '#FFF5E0',
  '포장 시 다회용기 사용하기': '#EDF3FC',
  '음식 안 남기기': '#FCE8E5',
  '일회용 수저·포크 사용 안 하기': '#DFE5FB',
}

function MissionCard({ mission }: MissionCardProps) {
  const navigate = useNavigate()

  const image = missionImageMap[mission.name] ?? '/tumbler.svg'
  const backgroundColor = missionBackgroundMap[mission.name] ?? '#F5F5F5'
  const display = missionDisplayMap[mission.name] ?? {
    title: mission.name,
    category: mission.category,
  }
  return (
    <button
      type="button"
      className="mission-card"
      onClick={() => navigate(`/mission/${mission.missionId}`)}
    >
      <div className="mission-card__image-box" style={{ backgroundColor }}>
        <img className="mission-card__image" src={image} alt={mission.name} />
      </div>

      <div className="mission-card__content">
        <div className="mission-card__info">
          <strong className="mission-card__title">{display.title}</strong>

          <span className="mission-card__category">{display.category}</span>

          <div className="mission-card__point">
            <img src="/point-coin.svg" alt="" />
            <strong>{mission.rewardPoints}</strong>
          </div>

          {mission.completedToday && (
            <span className="mission-card__completed">오늘 완료</span>
          )}
        </div>

        <span className="mission-card__arrow">›</span>
      </div>
    </button>
  )
}

export default MissionCard
