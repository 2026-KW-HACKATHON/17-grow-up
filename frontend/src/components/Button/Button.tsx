import './Button.css'

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}

function Button({
  children,
  onClick,
  disabled = false,
}: ButtonProps) {
  return (
    <button
      type="button"
      className="common-button"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export default Button