import { useNavigate } from 'react-router-dom'
import './BottomNav.css'

type NavItem = 'home' | 'mission' | 'record' | 'point' | 'my'

interface BottomNavProps {
  active: NavItem
}

const navItems: { key: NavItem; label: string; path: string }[] = [
  { key: 'home', label: '홈', path: '/main' },
  { key: 'mission', label: '미션', path: '/mission' },
  { key: 'record', label: '기록', path: '/record' },
  { key: 'point', label: '포인트', path: '/point' },
  { key: 'my', label: 'MY', path: '/my' },
]

function BottomNav({ active }: BottomNavProps) {
  const navigate = useNavigate()

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
            onClick={() => navigate(item.path)}
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
