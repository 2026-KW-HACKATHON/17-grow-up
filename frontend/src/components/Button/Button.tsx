import './Button.css'

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
}

function Button({ children, onClick }: ButtonProps) {
  return (
    <button type="button" className="button" onClick={onClick}>
      {children}
    </button>
  )
}

export default Button
