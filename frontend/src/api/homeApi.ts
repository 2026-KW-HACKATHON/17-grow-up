const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export interface HomeCharacterGrowth {
  characterType: string
  level: number
  progressPercent: number
  remainingCarbonG: number
}

export interface HomeWeeklyPractice {
  date: string
  completed: boolean
}

export interface HomeStreak {
  currentStreak: number
  weeklyPractices: HomeWeeklyPractice[]
}

export interface HomeMission {
  missionId: number
  missionName: string
  category: string
  carbonReductionG: number
  rewardPoints: number
  completedToday: boolean
}

export interface HomeActivity {
  missionId: number
  missionName: string
  partnerName: string
  earnedPoints: number
  completedAt: string
}

export interface HomeData {
  characterGrowth: HomeCharacterGrowth
  availablePoints: number
  totalCarbonG: number
  streak: HomeStreak
  todayMissions: HomeMission[]
  recentActivities: HomeActivity[]
}

interface HomeResponse {
  success: boolean
  data?: HomeData
  error?: {
    code: string
    message: string
  }
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
    throw new Error(result.error?.message ?? '홈 정보를 불러오지 못했습니다.')
  }

  return result.data
}
