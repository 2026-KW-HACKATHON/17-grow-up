import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import BottomNav from '../../../components/BottomNav/BottomNav'

import {
  deleteFriend,
  getFriends,
  getInviteInfo,
  type Friend,
  type InviteInfo,
} from '../../../api/friendApi'

import './FriendAddPage.css'

// 캐릭터 타입별 아바타 배경색
const characterColors: Record<string, string> = {
  TREE_A: '#E9F4EC',
  TREE_B: '#FFF5E0',
  TREE_C: '#EDF3FC',
  TREE_D: '#FCE8E5',
  TREE_E: '#DFE5FB',
}

// 최근 접속 시간 표시
function formatLastActiveAt(lastActiveAt: string | null): string {
  if (!lastActiveAt) {
    return '최근 접속 기록 없음'
  }

  // 백엔드가 시간대 없는 ISO 날짜를 반환하므로
  // 임의로 UTC 변환하지 않고 전달된 날짜/시간을 표시
  const match = lastActiveAt.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/)

  if (!match) {
    return '최근 접속 시간 확인 불가'
  }

  const month = Number(match[2])
  const day = Number(match[3])
  const hour = Number(match[4])
  const minute = match[5]

  const period = hour < 12 ? '오전' : '오후'
  const displayHour = hour % 12 || 12

  return `최근 접속: ${month}월 ${day}일 ${period} ${displayHour}:${minute}`
}

function FriendAddPage() {
  const navigate = useNavigate()

  const [copied, setCopied] = useState(false)

  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null)

  const [friends, setFriends] = useState<Friend[]>([])

  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  const [error, setError] = useState('')
  const [deleteError, setDeleteError] = useState('')

  // 친구 정보 조회
  useEffect(() => {
    let cancelled = false

    const fetchFriendData = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken')

        if (!accessToken) {
          setError('로그인이 필요합니다.')
          return
        }

        const [inviteData, friendData] = await Promise.all([
          getInviteInfo(accessToken),
          getFriends(accessToken),
        ])

        if (cancelled) return

        setInviteInfo(inviteData)
        setFriends(friendData)
      } catch (error) {
        if (!cancelled) {
          console.error('친구 정보 조회 실패:', error)
          setError('친구 정보를 불러오지 못했습니다.')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchFriendData()

    return () => {
      cancelled = true
    }
  }, [])

  // 초대 링크 복사
  const handleCopy = async () => {
    if (!inviteInfo?.inviteUrl) return

    try {
      await navigator.clipboard.writeText(inviteInfo.inviteUrl)

      setCopied(true)

      window.setTimeout(() => {
        setCopied(false)
      }, 1500)
    } catch (error) {
      console.error('초대 링크 복사 실패:', error)
    }
  }

  // 친구 삭제
  const handleDeleteFriend = async () => {
    if (!selectedFriend || isDeleting) return

    const accessToken = localStorage.getItem('accessToken')

    if (!accessToken) {
      setDeleteError('로그인이 필요합니다.')
      return
    }

    try {
      setIsDeleting(true)
      setDeleteError('')

      const friendId = selectedFriend.friendId

      await deleteFriend(accessToken, friendId)

      setFriends((prevFriends) =>
        prevFriends.filter((friend) => friend.friendId !== friendId),
      )

      setSelectedFriend(null)
    } catch (error) {
      console.error('친구 삭제 실패:', error)

      if (error instanceof Error && error.message === 'FRIEND_NOT_FOUND') {
        setDeleteError('친구 관계를 찾을 수 없습니다.')
      } else {
        setDeleteError('친구를 삭제하지 못했습니다.')
      }
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSelectFriend = (friend: Friend) => {
    setDeleteError('')
    setSelectedFriend(friend)
  }

  const handleCloseModal = () => {
    setDeleteError('')
    setSelectedFriend(null)
  }

  if (isLoading) {
    return (
      <div className="friend-add-page">
        <main className="friend-add-page__content">
          <p>친구 정보를 불러오는 중...</p>
        </main>

        <BottomNav active="record" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="friend-add-page">
        <main className="friend-add-page__content">
          <p>{error}</p>
        </main>

        <BottomNav active="record" />
      </div>
    )
  }

  return (
    <div className="friend-add-page">
      <main className="friend-add-page__content">
        <button
          type="button"
          className="friend-add-page__back"
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
        >
          ‹
        </button>

        <header className="friend-add-page__header">
          <h1 className="friend-add-page__title">친구 초대하기</h1>

          <p className="friend-add-page__subtitle">
            함께 실천하면 더 즐거워요!
          </p>
        </header>

        <div className="friend-add-page__characters">
          <img src="/record-characters.svg" alt="친구추가 캐릭터" />
        </div>

        <section className="friend-add-page__invite-card">
          <h2>초대 링크를 공유해 보세요</h2>

          <p>
            친구가 가입하면 함께 슬기로운 일상을
            <br />
            즐겨볼 수 있어요.
          </p>

          <div className="friend-add-page__link-box">
            {inviteInfo?.inviteUrl ?? ''}
          </div>

          <button
            type="button"
            className="friend-add-page__copy-button"
            onClick={handleCopy}
          >
            {copied ? '복사했어요!' : '링크 복사하기'}
          </button>
        </section>

        <section className="friend-add-page__friend-section">
          <h2>내 친구</h2>

          <div className="friend-add-page__friend-list">
            {friends.length > 0 ? (
              friends.map((friend) => (
                <div
                  key={friend.friendId}
                  className="friend-add-page__friend-item"
                >
                  {/* 친구 캐릭터 아바타 */}
                  <div
                    className="friend-add-page__friend-avatar"
                    style={{
                      backgroundColor:
                        characterColors[friend.characterType] ?? '#E9F4EC',
                    }}
                    title={friend.characterType}
                    aria-label={`${friend.nickname} 캐릭터`}
                  >
                    <img
                      src="/profile-character.svg"
                      alt=""
                      style={{
                        width: '36px',
                        height: '36px',
                        objectFit: 'contain',
                      }}
                    />
                  </div>

                  {/* 친구 닉네임 */}
                  <div className="friend-add-page__friend-info">
                    <strong>{friend.nickname}</strong>
                  </div>

                  {/* 연속 실천 및 접속 시간 */}
                  <div
                    style={{
                      marginLeft: 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      justifyContent: 'center',
                      gap: '4px',
                      minWidth: 0,
                      textAlign: 'right',
                    }}
                  >
                    <strong
                      style={{
                        color: '#111111',
                        fontSize: '11px',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {friend.currentStreak}일 연속 실천 중
                    </strong>

                    <span
                      style={{
                        color: '#999999',
                        fontSize: '9px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {formatLastActiveAt(friend.lastActiveAt)}
                    </span>
                  </div>

                  {/* 친구 삭제 버튼 */}
                  <button
                    type="button"
                    className="friend-add-page__friend-delete"
                    onClick={() => handleSelectFriend(friend)}
                    aria-label={`${friend.nickname} 친구 삭제`}
                  >
                    <img src="/friend-delete.svg" alt="" />
                  </button>
                </div>
              ))
            ) : (
              <p className="friend-add-page__empty">
                아직 연결된 친구가 없어요.
              </p>
            )}
          </div>
        </section>
      </main>

      {/* 친구 삭제 모달 */}
      {selectedFriend && (
        <div className="friend-add-page__modal-overlay">
          <div className="friend-add-page__modal">
            <h2>친구 삭제</h2>

            <p>
              <strong>{selectedFriend.nickname}</strong>
              님을 친구 목록에서 삭제할까요?
            </p>

            {deleteError && (
              <p
                role="alert"
                style={{
                  color: '#D64545',
                  fontSize: '13px',
                }}
              >
                {deleteError}
              </p>
            )}

            <button
              type="button"
              className="friend-add-page__modal-delete"
              onClick={handleDeleteFriend}
              disabled={isDeleting}
            >
              {isDeleting ? '삭제 중...' : '삭제'}
            </button>

            <button
              type="button"
              className="friend-add-page__modal-cancel"
              onClick={handleCloseModal}
              disabled={isDeleting}
            >
              취소
            </button>
          </div>
        </div>
      )}

      <BottomNav active="record" />
    </div>
  )
}

export default FriendAddPage
