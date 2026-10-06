import { useState } from 'react'
import './LoginInput.css'

interface LoginInputProps {
  type?: 'text' | 'password'
  placeholder: string
  value: string
  onChange: (value: string) => void
}

function LoginInput({
  type = 'text',
  placeholder,
  value,
  onChange,
}: LoginInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  const isPassword = type === 'password'

  return (
    <div className="login-input">
      <input
        className="login-input__field"
        type={isPassword && !showPassword ? 'password' : 'text'}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />

      {isPassword && (
        <button
          className="login-input__eye"
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시하기'}
        >
          <img src="/eye.svg" alt="" />
        </button>
      )}
    </div>
  )
}

export default LoginInput