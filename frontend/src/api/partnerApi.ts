const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export interface PartnerMe {
  employee: {
    employeeId: number
    loginId: string
  }
  partner: {
    partnerId: number
    partnerName: string
  }
}

interface ApiError {
  code: string
  message: string
}

interface PartnerMeResponse {
  success: boolean
  data?: PartnerMe
  error?: ApiError
}

export async function getPartnerMe(accessToken: string): Promise<PartnerMe> {
  const response = await fetch(`${API_BASE_URL}/api/v1/partners/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  const result: PartnerMeResponse = await response.json()

  if (!response.ok || !result.success || !result.data) {
    console.error(
      '직원 및 제휴처 정보 조회 실패:',
      response.status,
      result.error,
    )

    throw new Error(result.error?.code ?? 'PARTNER_ME_FAILED')
  }

  console.log('직원 및 제휴처 정보 조회 성공:', response.status, result.data)

  return result.data
}
