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

export interface UpdateNicknameRequest {
  nickname: string
}

export interface UpdateNicknameResponse {
  nickname: string
}

export interface UpdatePasswordRequest {
  currentPassword: string
  newPassword: string
  newPasswordConfirm: string
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

export async function updateNickname(
  request: UpdateNicknameRequest,
): Promise<UpdateNicknameResponse> {
  const accessToken = localStorage.getItem('accessToken')

  if (!accessToken) {
    console.error('닉네임 수정 실패: accessToken 없음')
    throw new Error('UNAUTHORIZED')
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/users/me/nickname`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(request),
    },
  )

  const result = await response.json()

  if (!response.ok || !result.success) {
    console.error(
      '닉네임 수정 실패:',
      response.status,
      result.error,
    )

    throw new Error(result.error?.code ?? 'UPDATE_NICKNAME_FAILED')
  }

  console.log(
    '닉네임 수정 성공:',
    response.status,
    result.data,
  )

  return result.data
}

export async function updatePassword(
  request: UpdatePasswordRequest,
): Promise<void> {
  const accessToken = localStorage.getItem('accessToken')

  if (!accessToken) {
    console.error('비밀번호 변경 실패: accessToken 없음')
    throw new Error('UNAUTHORIZED')
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/users/me/password`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(request),
    },
  )

  const result = await response.json()

  if (!response.ok || !result.success) {
    console.error(
      '비밀번호 변경 실패:',
      response.status,
      result.error,
    )

    throw new Error(result.error?.code ?? 'UPDATE_PASSWORD_FAILED')
  }

  console.log('비밀번호 변경 성공:', response.status)
}