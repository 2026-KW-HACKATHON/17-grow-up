import './BottomNav.css'

type NavItem = 'home' | 'mission' | 'record' | 'point' | 'my'

interface BottomNavProps {
  active: NavItem
}

const navItems: { key: NavItem; label: string }[] = [
  { key: 'home', label: '홈' },
  { key: 'mission', label: '미션' },
  { key: 'record', label: '기록' },
  { key: 'point', label: '포인트' },
  { key: 'my', label: 'MY' },
]

function BottomNav({ active }: BottomNavProps) {
  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const isActive = active === item.key

        return (
          <button
            key={item.key}
            type="button"
            className={`bottom-nav__item ${
              isActive ? 'bottom-nav__item--active' : ''
            }`}
          >
            <img
              className="bottom-nav__icon"
              src={`/icons/${item.key}${isActive ? '-active' : ''}.svg`}
              alt=""
            />

            <span className="bottom-nav__label">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

export default BottomNav