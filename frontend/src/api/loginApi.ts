const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export interface SignupRequest {
  loginId: string
  password: string
  nickname: string
}

export interface SignupResponse {
  userId: number
  loginId: string
  nickname: string
  characterType: string
}

export interface LoginRequest {
  loginId: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
  user: {
    id: number
    nickname: string
  }
}

export async function signup(
  request: SignupRequest,
): Promise<SignupResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  const result = await response.json()

  if (!response.ok || !result.success) {
    console.error(
      '회원가입 실패:',
      response.status,
      result.error,
    )

    throw new Error(result.error?.code ?? 'SIGNUP_FAILED')
  }

  console.log(
    '회원가입 성공:',
    response.status,
    result.data,
  )

  return result.data
}

export async function login(
  request: LoginRequest,
): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  const result = await response.json()

  if (!response.ok || !result.success) {
    console.error(
      '로그인 실패:',
      response.status,
      result.error,
    )

    throw new Error(result.error?.code ?? 'LOGIN_FAILED')
  }

  console.log(
    '로그인 성공:',
    response.status,
    result.data,
  )

  return result.data
}