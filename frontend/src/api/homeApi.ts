const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export interface HomeCharacter {
  characterType: string
  characterLevel: number
}

export interface HomeMission {
  missionId: number
  name: string
  category: string
  carbonReductionG: number
  completedToday: boolean
}

export interface HomeRecentActivity {
  missionId: number
  missionName: string
  carbonReductionG: number
  completedAt: string
}

export interface HomeData {
  character: HomeCharacter
  availablePoints: number
  totalCarbonG: number
  currentStreak: number
  weeklyPracticeDays: string[]
  todayMissions: HomeMission[]
  recentActivities: HomeRecentActivity[]
}

interface ApiError {
  code: string
  message: string
}

interface HomeResponse {
  success: boolean
  data?: HomeData
  error?: ApiError
}

export async function getHome(accessToken: string): Promise<HomeData> {
  const response = await fetch(`${API_BASE_URL}/api/v1/home`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  const result: HomeResponse = await response.json()

  if (!response.ok || !result.success || !result.data) {
    console.error('홈 화면 조회 실패:', response.status, result.error)

    throw new Error(result.error?.code ?? 'HOME_FETCH_FAILED')
  }

  console.log('홈 화면 조회 성공:', response.status, result.data)

  return result.data
}
