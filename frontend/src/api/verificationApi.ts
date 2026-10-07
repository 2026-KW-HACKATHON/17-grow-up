const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export interface VerificationRequest {
  qrToken: string
  missionId: number
}

export interface VerificationResult {
  completionId: number
  missionName: string
  carbonAwardedG: number
  pointsAwarded: number
  totalCarbonG: number
  availablePoints: number
  currentStreak: number
  characterLevel: number
}

interface VerificationResponse {
  success: boolean
  data?: VerificationResult
  error?: {
    code: string
    message: string
  }
}

export async function verifyMission(
  partnerAccessToken: string,
  request: VerificationRequest,
): Promise<VerificationResult> {
  const response = await fetch(`${API_BASE_URL}/api/v1/verifications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${partnerAccessToken}`,
    },
    body: JSON.stringify(request),
  })

  const result: VerificationResponse = await response.json()

  if (!response.ok || !result.success || !result.data) {
    console.error('미션 인증 실패:', response.status, result.error)

    throw new Error(result.error?.code ?? 'VERIFICATION_FAILED')
  }

  console.log('미션 인증 성공:', result.data)

  return result.data
}
