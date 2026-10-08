const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export interface InviteInfo {
  inviteCode: string
  inviteUrl: string
}

export interface Friend {
  friendId: number
  nickname: string
  characterType: string
  characterLevel: number
}

export interface AddFriendResponse {
  friendId: number
  nickname: string
}

interface ApiError {
  code: string
  message: string
}

interface InviteResponse {
  success: boolean
  data?: InviteInfo
  error?: ApiError
}

interface FriendListResponse {
  success: boolean
  data?: {
    friends: Friend[]
  }
  error?: ApiError
}

interface AddFriendApiResponse {
  success: boolean
  data?: AddFriendResponse
  error?: ApiError
}

interface DeleteFriendResponse {
  success: boolean
  data?: null
  error?: ApiError
}

export async function getInviteInfo(accessToken: string): Promise<InviteInfo> {
  const response = await fetch(`${API_BASE_URL}/api/v1/friends/invite`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  const result: InviteResponse = await response.json()

  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.error?.code ?? 'INVITE_FETCH_FAILED')
  }

  return result.data
}

export async function getFriends(accessToken: string): Promise<Friend[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/friends`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  const result: FriendListResponse = await response.json()

  if (!response.ok || !result.success) {
    throw new Error(result.error?.code ?? 'FRIEND_LIST_FAILED')
  }

  return result.data?.friends ?? []
}

export async function addFriend(
  accessToken: string,
  inviteCode: string,
): Promise<AddFriendResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/friends`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      inviteCode,
    }),
  })

  const result: AddFriendApiResponse = await response.json()

  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.error?.code ?? 'FRIEND_ADD_FAILED')
  }

  return result.data
}

export async function deleteFriend(
  accessToken: string,
  friendId: number,
): Promise<number> {
  const response = await fetch(`${API_BASE_URL}/api/v1/friends/${friendId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  const result: DeleteFriendResponse = await response.json()

  if (!response.ok || !result.success) {
    throw new Error(result.error?.code ?? 'FRIEND_DELETE_FAILED')
  }

  return friendId
}
