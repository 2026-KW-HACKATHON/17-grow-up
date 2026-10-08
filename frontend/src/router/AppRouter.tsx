import { Navigate, Outlet, Route, Routes } from 'react-router-dom'

import Splash from '../pages/Splash/Splash'

import LoginPage from '../pages/Login/page/LoginPage'
import EmailPage from '../pages/Login/page/EmailPage'
import PasswordPage from '../pages/Login/page/PasswordPage'
import NicknamePage from '../pages/Login/page/NicknamePage'
import WelcomePage from '../pages/Login/page/WelcomePage'

import MainPage from '../pages/Main/MainPage'
import PointPage from '../pages/Point/page/PointPage'
import SeoulPayPage from '../pages/Point/page/SeoulPayPage'
import MyPage from '../pages/My/page/MyPage'
import UserInfoPage from '../pages/My/page/UserInfoPage'
import PasswordChangePage from '../pages/My/page/PasswordChangePage'
import RecordPage from '../pages/Record/page/RecordPage'
import FriendAddPage from '../pages/Record/page/FriendAddPage'
import MissionPage from '../pages/Mission/MissionPage'
import MissionDetailPage from '../pages/Mission/MissionDetailPage'
import MissionQrPage from '../pages/Mission/MissionQrPage'
import MissionSuccessPage from '../pages/Mission/MissionSuccessPage'
import AlarmPage from '../pages/Main/AlarmPage'
import StoreDetailPage from '../pages/Mission/StoreDetailPage'
import CharacterGrowthPage from '../pages/Main/CharacterGrowthPage'
import AdminMissionDetailPage from '../pages/Admin/AdminMissionDetailPage'
import AdminQrPage from '../pages/Admin/AdminQrPage'
import FriendInvitePage from '../pages/Record/page/FriendInvitePage'

type UserRole = 'USER' | 'PARTNER'

interface JwtPayload {
  role?: string
  exp?: number
}

// 로그인 토큰에서 사용자 역할 확인
function getUserRole(): UserRole | null {
  const token = localStorage.getItem('accessToken')

  if (!token) return null

  try {
    const payload = token.split('.')[1]

    if (!payload) return null

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')

    const decoded = JSON.parse(atob(padded)) as JwtPayload

    if (typeof decoded.exp !== 'number' || decoded.exp * 1000 <= Date.now()) {
      return null
    }

    if (decoded.role === 'USER') return 'USER'
    if (decoded.role === 'PARTNER') return 'PARTNER'

    return null
  } catch {
    return null
  }
}

// 일반 사용자 전용 경로
function UserRoute() {
  const role = getUserRole()

  if (role === 'USER') {
    return <Outlet />
  }

  if (role === 'PARTNER') {
    return <Navigate to="/admin/mission" replace />
  }

  return <Navigate to="/login" replace />
}

// 관리자 전용 경로
function AdminRoute() {
  const role = getUserRole()

  if (role === 'PARTNER') {
    return <Outlet />
  }

  if (role === 'USER') {
    return <Navigate to="/main" replace />
  }

  return <Navigate to="/login" replace />
}

// 로그인 및 회원가입 페이지
function PublicRoute() {
  const role = getUserRole()

  if (role === 'PARTNER') {
    return <Navigate to="/admin/mission" replace />
  }

  return <Outlet />
}

function FallbackRoute() {
  const role = getUserRole()

  if (role === 'PARTNER') {
    return <Navigate to="/admin/mission" replace />
  }

  if (role === 'USER') {
    return <Navigate to="/main" replace />
  }

  return <Navigate to="/login" replace />
}

function AppRouter() {
  return (
    <Routes>
      {/* 공개 페이지 */}
      <Route element={<PublicRoute />}>
        <Route path="/" element={<Splash />} />
        <Route path="/login" element={<LoginPage />} />

        <Route path="/signup" element={<EmailPage />} />
        <Route path="/signup/password" element={<PasswordPage />} />
        <Route path="/signup/nickname" element={<NicknamePage />} />
        <Route path="/signup/welcome" element={<WelcomePage />} />

        <Route path="/invite/:inviteCode" element={<FriendInvitePage />} />
      </Route>

      <Route element={<UserRoute />}>
        <Route path="/main" element={<MainPage />} />

        <Route path="/mission" element={<MissionPage />} />
        <Route path="/mission/:missionId" element={<MissionDetailPage />} />
        <Route path="/mission/:missionId/qr" element={<MissionQrPage />} />
        <Route
          path="/mission/:missionId/success"
          element={<MissionSuccessPage />}
        />

        <Route path="/point" element={<PointPage />} />
        <Route path="/point/seoulpay" element={<SeoulPayPage />} />

        <Route path="/record" element={<RecordPage />} />
        <Route path="/record/friend-add" element={<FriendAddPage />} />

        <Route path="/my" element={<MyPage />} />
        <Route path="/my/user-info" element={<UserInfoPage />} />
        <Route path="/my/user-info/password" element={<PasswordChangePage />} />

        <Route path="/stores" element={<StoreDetailPage />} />
        <Route path="/alarm" element={<AlarmPage />} />
        <Route path="/growth" element={<CharacterGrowthPage />} />
      </Route>

      <Route element={<AdminRoute />}>
        <Route path="/admin/mission" element={<AdminMissionDetailPage />} />

        <Route path="/admin/mission/:missionId/qr" element={<AdminQrPage />} />
      </Route>

      <Route path="*" element={<FallbackRoute />} />
    </Routes>
  )
}

export default AppRouter
