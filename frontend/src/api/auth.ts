export type UserRole = 'USER' | 'PARTNER'

type JwtPayload = {
  role?: string
  exp?: number
}

export function getUserRole(): UserRole | null {
  const token = localStorage.getItem('accessToken')

  if (!token) return null

  try {
    const payload = token.split('.')[1]

    if (!payload) return null

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')

    const decoded = JSON.parse(atob(padded)) as JwtPayload

    if (typeof decoded.exp !== 'number' || decoded.exp * 1000 <= Date.now()) {
      return null
    }

    if (decoded.role === 'USER') return 'USER'

    // 백엔드에서 직원 JWT role을 PARTNER로 발급한다는 전제
    if (decoded.role === 'PARTNER') return 'PARTNER'

    return null
  } catch {
    return null
  }
}
