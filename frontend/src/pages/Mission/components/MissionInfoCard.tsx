import type { Mission } from '../../../api/missionApi'
import './MissionInfoCard.css'

interface MissionInfoCardProps {
  mission: Mission
  image: string
  backgroundColor: string
}

function MissionInfoCard({
  mission,
  image,
  backgroundColor,
}: MissionInfoCardProps) {
  return (
    <div className="mission-info-card">
      <div
        className="mission-info-card__image-box"
        style={{
          backgroundColor,
        }}
      >
        <img src={image} alt={mission.name} />
      </div>

      <div className="mission-info-card__content">
        <strong>{mission.name}</strong>

        <span>{mission.category}</span>

        <div className="mission-info-card__point">
          <img src="/point-coin.svg" alt="" />
          <span>{mission.rewardPoints}</span>
        </div>
      </div>
    </div>
  )
}

export default MissionInfoCard
