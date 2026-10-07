const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export interface RecordSummary {
  totalCarbonG: number
  totalMissionCount: number
  currentStreak: number
}

export interface RecordHistory {
  missionId: number
  missionName: string
  carbonReductionG: number
  completedAt: string
}

export interface PracticeDay {
  date: string
  missionCount: number
}

export interface RecordCalendar {
  year: number
  month: number
  practiceDays: PracticeDay[]
}

export interface FriendRecord {
  friendId: number
  nickname: string
  totalCarbonG: number
  totalMissionCount: number
  currentStreak: number
}

interface ApiError {
  code: string
  message: string
}

interface SummaryResponse {
  success: boolean
  data?: RecordSummary
  error?: ApiError
}

interface HistoryResponse {
  success: boolean
  data?: {
    records: RecordHistory[]
  }
  error?: ApiError
}

interface CalendarResponse {
  success: boolean
  data?: RecordCalendar
  error?: ApiError
}

interface FriendsResponse {
  success: boolean
  data?: {
    friends: FriendRecord[]
  }
  error?: ApiError
}

export async function getRecordSummary(
  accessToken: string,
): Promise<RecordSummary> {
  const response = await fetch(`${API_BASE_URL}/api/v1/records/summary`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  const result: SummaryResponse = await response.json()
  console.log('요약 API 응답:', result)
  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.error?.code ?? 'RECORD_SUMMARY_FAILED')
  }

  return result.data
}

export async function getRecordHistory(
  accessToken: string,
): Promise<RecordHistory[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/records/history`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  const result: HistoryResponse = await response.json()
  console.log('히스토리 API 응답:', result)
  if (!response.ok || !result.success) {
    throw new Error(result.error?.code ?? 'RECORD_HISTORY_FAILED')
  }

  return result.data?.records ?? []
}

export async function getRecordCalendar(
  accessToken: string,
  year: number,
  month: number,
): Promise<RecordCalendar> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/records/calendar?year=${year}&month=${month}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )

  const result: CalendarResponse = await response.json()
  console.log('캘린더 API 응답:', result)
  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.error?.code ?? 'RECORD_CALENDAR_FAILED')
  }

  return result.data
}

export async function getFriendRecords(
  accessToken: string,
): Promise<FriendRecord[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/records/friends`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  const result: FriendsResponse = await response.json()

  console.log('친구 기록 API 응답:', result)

  if (!response.ok || !result.success) {
    throw new Error(result.error?.code ?? 'FRIEND_RECORDS_FAILED')
  }

  return result.data?.friends ?? []
}
