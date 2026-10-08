import './PointHistoryItem.css'

interface PointHistoryItemProps {
  icon: string
  title: string
  place: string
  point: number
  time: string
}

function PointHistoryItem({
  icon,
  title,
  place,
  point,
  time,
}: PointHistoryItemProps) {
  return (
    <div className="point-history-item">
      <div className="point-history-item__icon-wrap">
        <img
          className="point-history-item__icon"
          src={icon}
          alt=""
        />
      </div>

      <div className="point-history-item__info">
        <span className="point-history-item__title">
          {title}
        </span>

        <span className="point-history-item__place">
          {place}
        </span>
      </div>

      <div className="point-history-item__result">
        <span className="point-history-item__point">
          +{point.toLocaleString('ko-KR')}P
        </span>

        <span className="point-history-item__time">
          {time}
        </span>
      </div>
    </div>
  )
}

export default PointHistoryItem