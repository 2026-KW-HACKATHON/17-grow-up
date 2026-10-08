
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export interface PointConversion {
  conversionId: number
  convertedPoints: number
  seoulPayAmount: number
  createdAt: string
}

export interface PointConversionListResponse {
  conversions: PointConversion[]
}

export interface PointConversionResponse {
  conversionId: number
  convertedPoints: number
  seoulPayAmount: number
  remainingPoints: number
  convertedAt: string
}

export interface PointHistory {
  missionId: number
  missionName: string
  partnerName: string
  earnedPoints: number
  earnedAt: string
}

export interface PointHistoryResponse {
  availablePoints: number
  monthlyEarnedPoints: number
  histories: PointHistory[]
}

export async function getPointHistory(): Promise<PointHistoryResponse> {
  const accessToken = localStorage.getItem('accessToken')

  const response = await fetch(`${API_BASE_URL}/api/v1/points/history`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  const result = await response.json()

  if (!response.ok || !result.success) {
    console.error(
      '포인트 적립 내역 조회 실패:',
      response.status,
      result.error,
    )

    throw new Error(result.error?.code ?? 'POINT_HISTORY_FAILED')
  }

  console.log('포인트 적립 내역 조회 성공:', response.status, result.data)

  return result.data
}

export async function getPointConversions(): Promise<PointConversionListResponse> {
  const accessToken = localStorage.getItem('accessToken')

  const response = await fetch(
    `${API_BASE_URL}/api/v1/points/conversions`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )

  const result = await response.json()

  if (!response.ok || !result.success) {
    console.error(
      '서울페이 전환 내역 조회 실패:',
      response.status,
      result.error,
    )

    throw new Error(
      result.error?.code ?? 'POINT_CONVERSION_HISTORY_FAILED',
    )
  }

  console.log('서울페이 전환 내역 조회 성공:', response.status, result.data)

  return result.data
}

export async function convertPoints(
  points: number,
): Promise<PointConversionResponse> {
  const accessToken = localStorage.getItem('accessToken')

  const response = await fetch(
    `${API_BASE_URL}/api/v1/points/conversions`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        points,
      }),
    },
  )

  const result = await response.json()

  if (!response.ok || !result.success) {
    console.error(
      '서울페이 전환 실패:',
      response.status,
      result.error,
    )

    throw new Error(
      result.error?.code ?? 'POINT_CONVERSION_FAILED',
    )
  }

  console.log('서울페이 전환 성공:', response.status, result.data)

  return result.data
}
