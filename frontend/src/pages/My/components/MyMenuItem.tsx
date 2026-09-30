import './MyMenuItem.css'

interface MyMenuItemProps {
  icon: string
  label: string
  onClick?: () => void
  isLast?: boolean
}

function MyMenuItem({
  icon,
  label,
  onClick,
  isLast = false,
}: MyMenuItemProps) {
  return (
    <button
      type="button"
      className={`my-menu-item ${isLast ? 'my-menu-item--last' : ''}`}
      onClick={onClick}
    >
      <img
        className="my-menu-item__icon"
        src={icon}
        alt=""
      />

      <span className="my-menu-item__label">
        {label}
      </span>
    </button>
  )
}

export default MyMenuItem