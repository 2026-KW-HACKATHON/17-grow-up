import './LoginFooter.css'

interface LoginFooterProps {
  text: string
  linkText: string
  onClick: () => void
}

function LoginFooter({
  text,
  linkText,
  onClick,
}: LoginFooterProps) {
  return (
    <div className="login-footer">
      <p>{text}</p>

      <button type="button" onClick={onClick}>
        {linkText}
      </button>
    </div>
  )
}

export default LoginFooter