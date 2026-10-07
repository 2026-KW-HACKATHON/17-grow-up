import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { addFriend } from '../../../api/friendApi'

import './FriendInvitePage.css'

function FriendInvitePage() {
  const navigate = useNavigate()
  const { inviteCode } = useParams()

  const [message, setMessage] = useState('친구 연결 중...')
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    const connectFriend = async () => {
      const accessToken = localStorage.getItem('accessToken')

      if (!accessToken) {
        setMessage('로그인이 필요합니다.')
        return
      }

      if (!inviteCode) {
        setMessage('유효하지 않은 초대 링크입니다.')
        return
      }

      try {
        const result = await addFriend(accessToken, inviteCode)

        setMessage(`${result.nickname}님과 친구가 되었어요!`)
        setIsSuccess(true)
      } catch (error) {
        console.error('친구 연결 실패:', error)

        if (error instanceof Error) {
          if (error.message === 'FRIEND_ALREADY_EXISTS') {
            setMessage('이미 친구로 등록된 사용자입니다.')
            return
          }

          if (error.message === 'CANNOT_ADD_SELF') {
            setMessage('자기 자신은 친구로 등록할 수 없습니다.')
            return
          }

          if (
            error.message === 'INVITE_NOT_FOUND' ||
            error.message === 'INVALID_INVITE_CODE'
          ) {
            setMessage('유효하지 않은 초대 링크입니다.')
            return
          }

          if (error.message === 'UNAUTHORIZED') {
            setMessage('로그인이 필요합니다.')
            return
          }
        }

        setMessage('친구 연결에 실패했습니다.')
      }
    }

    connectFriend()
  }, [inviteCode])

  return (
    <div className="friend-invite-page">
      <main className="friend-invite-page__content">
        <img
          src="/record-characters.svg"
          alt="친구 연결 캐릭터"
          className="friend-invite-page__characters"
        />

        <h1>{isSuccess ? '친구 연결 완료!' : '친구 초대'}</h1>

        <p>{message}</p>

        <button type="button" onClick={() => navigate('/record')}>
          실천 기록으로 이동
        </button>
      </main>
    </div>
  )
}

export default FriendInvitePage
