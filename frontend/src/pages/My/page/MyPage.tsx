import BottomNav from '../../../components/BottomNav/BottomNav'
import MyMenuItem from '../components/MyMenuItem'
import './MyPage.css'

function MyPage() {
  return (
    <div className="my-page">
      <main className="my-page__content">
        <section className="my-page__profile">
          <img
            className="my-page__character"
            src="/profile-character.svg"
            alt="프로필 캐릭터"
          />

          <div className="my-page__profile-info">
            <strong className="my-page__name">김탄탄</strong>

            <button type="button" className="my-page__edit-button">
              프로필 수정
            </button>
          </div>
        </section>

        <section className="my-page__settings">
          <h1 className="my-page__settings-title">MY 설정</h1>

          <div className="my-page__settings-card">
            <MyMenuItem icon="/user.svg" label="사용자 정보" />

            <MyMenuItem icon="/friend.svg" label="친구 관리" />

            <MyMenuItem icon="/history.svg" label="나의 기록" />

            <MyMenuItem icon="/logout.svg" label="로그아웃" isLast />
          </div>
        </section>
      </main>

      <BottomNav active="my" />
    </div>
  )
}

export default MyPage
