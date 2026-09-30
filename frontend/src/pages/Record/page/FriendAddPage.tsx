import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../../../components/BottomNav/BottomNav'
import './FriendAddPage.css'

interface Friend {
  id: number
  nickname: string
  streak: number
  lastActive: string
}

const friends: Friend[] = [
  {
    id: 1,
    nickname: '홍길동',
    streak: 8,
    lastActive: '최근 접속: 오늘 14:32',
  },
  {
    id: 2,
    nickname: '홍길서',
    streak: 4,
    lastActive: '최근 접속: 오늘 14:32',
  },
]

function FriendAddPage() {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  const inviteLink = 'https://wolgye1rowoon.app/invite/1234'

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteLink)
    setCopied(true)

    setTimeout(() => {
      setCopied(false)
    }, 1500)
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

          <div className="friend-add-page__link-box">{inviteLink}</div>

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
            {friends.map((friend) => (
              <div key={friend.id} className="friend-add-page__friend-item">
                <div className="friend-add-page__friend-avatar" />

                <div className="friend-add-page__friend-info">
                  <strong>{friend.nickname}</strong>
                </div>

                <div className="friend-add-page__friend-status">
                  <strong>{friend.streak}일 연속 실천 중</strong>
                  <span>{friend.lastActive}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <BottomNav active="record" />
    </div>
  )
}

export default FriendAddPage
