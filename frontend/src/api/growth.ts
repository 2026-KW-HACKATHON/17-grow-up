export interface MissionStat {
  missionId: number
  missionName: string
  count: number
  percentage: number
}

export interface GrowthData {
  characterType: string
  characterLevel: number
  totalCarbonG: number
  currentLevelMinCarbonG: number
  nextLevelCarbonG: number
  remainingCarbonG: number
  progressPercent: number
  totalMissionCount: number
  missionStats: MissionStat[]
}

interface GrowthResponse {
  success: boolean
  data: GrowthData
}

export async function getMyGrowth(): Promise<GrowthData> {
  const token = localStorage.getItem('accessToken')

  if (!token) {
    throw new Error('로그인이 필요합니다.')
  }

  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/v1/users/me/growth`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    },
  )

  if (!response.ok) {
    throw new Error(`성장 정보 조회 실패: ${response.status}`)
  }

  const result: GrowthResponse = await response.json()

  if (!result.success) {
    throw new Error('성장 정보를 불러오지 못했습니다.')
  }

  return result.data
}
