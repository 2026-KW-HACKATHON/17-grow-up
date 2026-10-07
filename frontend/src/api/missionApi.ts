const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export interface Mission {
  missionId: number
  name: string
  description: string
  category: string
  carbonReductionG: number
  rewardPoints: number
  completedToday: boolean
}

interface MissionListResponse {
  success: boolean
  data: Mission[]
}

export async function getMissions(accessToken: string): Promise<Mission[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/missions`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  const result: MissionListResponse = await response.json()

  if (!response.ok || !result.success) {
    console.error('미션 목록 조회 실패:', response.status, result)

    throw new Error('MISSION_FETCH_FAILED')
  }

  console.log('미션 목록 조회 성공:', response.status, result.data)

  return result.data
}
export async function getMissionById(
  missionId: number,
  accessToken: string,
): Promise<Mission> {
  const response = await fetch(`${API_BASE_URL}/api/v1/missions/${missionId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  const result = await response.json()

  if (!response.ok || !result.success) {
    console.error('미션 상세 조회 실패:', response.status, result.error)

    throw new Error(result.error?.code ?? 'MISSION_DETAIL_FETCH_FAILED')
  }

  return result.data
}
