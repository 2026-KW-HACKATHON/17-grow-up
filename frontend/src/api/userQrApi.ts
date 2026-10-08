const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export interface QrTokenResponse {
  qrToken: string
  expiresAt: string
}

interface QrResponse {
  success: boolean
  data: QrTokenResponse
  error?: {
    code: string
    message: string
  }
}

export async function createUserQr(
  accessToken: string,
): Promise<QrTokenResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/users/me/qr`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  const result: QrResponse = await response.json()

  if (!response.ok || !result.success || !result.data) {
    console.error('QR 토큰 발급 실패:', response.status, result.error)

    throw new Error(result.error?.code ?? 'QR_CREATE_FAILED')
  }

  console.log('QR 토큰 발급 성공:', result.data)

  return result.data
}
