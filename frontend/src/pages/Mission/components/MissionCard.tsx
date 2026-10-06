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
        <img
          className="mission-card__image"
          src={mission.image}
          alt={mission.title}
        />
      </div>

      <div className="mission-card__content">
        <div className="mission-card__info">
          <strong className="mission-card__title">{mission.title}</strong>

          <span className="mission-card__category">{mission.category}</span>

          <div className="mission-card__point">
            <img src="/point-coin.svg" alt="" />
            <strong>{mission.point}</strong>
          </div>
        </div>

        <span className="mission-card__arrow">›</span>
      </div>
    </button>
  )
}

export default MissionCard
