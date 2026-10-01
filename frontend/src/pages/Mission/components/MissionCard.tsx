import { useNavigate } from 'react-router-dom'
import type { MissionData } from '../data/missionData'
import './MissionCard.css'

interface MissionCardProps {
  mission: MissionData
}

function MissionCard({ mission }: MissionCardProps) {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      className="mission-card"
      onClick={() => navigate(`/mission/${mission.id}`)}
    >
      <div
        className="mission-card__image-box"
        style={{ backgroundColor: mission.backgroundColor }}
      >
        <img className="mission-card__image" src={mission.image} alt="" />
      </div>

      <div className="mission-card__content">
        <div className="mission-card__info">
          <strong>{mission.title}</strong>
          <span>{mission.category}</span>

          <div className="mission-card__point">
            <img src="/point-coin.svg" alt="" />
            <span>{mission.point}</span>
          </div>
        </div>

        <span className="mission-card__arrow">›</span>
      </div>
    </button>
  )
}

export default MissionCard
