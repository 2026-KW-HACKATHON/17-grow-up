const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export interface UserInfoResponse {
  userId: number
  loginId: string
  nickname: string
  characterType: string
  characterLevel: number
  totalCarbonG: number
  availablePoints: number
  totalEarnedPoints: number
  currentStreak: number
  longestStreak: number
}

export async function getMyInfo(): Promise<UserInfoResponse> {
  const accessToken = localStorage.getItem('accessToken')

  if (!accessToken) {
    console.error('내 정보 조회 실패: accessToken 없음')
    throw new Error('UNAUTHORIZED')
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  const result = await response.json()

  if (!response.ok || !result.success) {
    console.error(
      '내 정보 조회 실패:',
      response.status,
      result.error,
    )

    throw new Error(result.error?.code ?? 'GET_USER_INFO_FAILED')
  }

  console.log(
    '내 정보 조회 성공:',
    response.status,
    result.data,
  )

  return result.data
}