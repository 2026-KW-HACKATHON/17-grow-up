import './PointTabs.css'

export type PointTabType = 'earn' | 'exchange'

interface PointTabsProps {
  activeTab: PointTabType
  onChange: (tab: PointTabType) => void
}

function PointTabs({
  activeTab,
  onChange,
}: PointTabsProps) {
  return (
    <div className="point-tabs">
      <button
        type="button"
        className={`point-tabs__button ${
          activeTab === 'earn'
            ? 'point-tabs__button--active'
            : ''
        }`}
        onClick={() => onChange('earn')}
      >
        적립 내역
      </button>

      <button
        type="button"
        className={`point-tabs__button ${
          activeTab === 'exchange'
            ? 'point-tabs__button--active'
            : ''
        }`}
        onClick={() => onChange('exchange')}
      >
        전환 내역
      </button>
    </div>
  )
}

export default PointTabs