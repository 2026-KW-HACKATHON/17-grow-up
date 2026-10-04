import type { MissionData } from '../data/missionData'
import './MissionInfoCard.css'

interface MissionInfoCardProps {
  mission: MissionData
}

function MissionInfoCard({ mission }: MissionInfoCardProps) {
  return (
    <div className="mission-info-card">
      <div
        className="mission-info-card__image-box"
        style={{
          backgroundColor: mission.backgroundColor,
        }}
      >
        <img src={mission.image} alt={mission.title} />
      </div>

      <div className="mission-info-card__content">
        <strong>{mission.title}</strong>

        <span>{mission.category}</span>

        <div className="mission-info-card__point">
          <img src="/point-coin.svg" alt="" />
          <span>{mission.point}</span>
        </div>
      </div>
    </div>
  )
}

export default MissionInfoCard
