import { Navigate, Route, Routes } from 'react-router-dom'

import Splash from '../pages/Splash/Splash'
import MainPage from '../pages/Main/MainPage'
import PointPage from '../pages/Point/page/PointPage'
import SeoulPayPage from '../pages/Point/page/SeoulPayPage'
import MyPage from '../pages/My/page/MyPage'
import RecordPage from '../pages/Record/page/RecordPage'
import FriendAddPage from '../pages/Record/page/FriendAddPage'

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Splash />} />

      <Route path="/main" element={<MainPage />} />

      <Route path="/point" element={<PointPage />} />

      <Route path="/point/seoulpay" element={<SeoulPayPage />} />

      <Route path="/my" element={<MyPage />} />

      <Route path="/record" element={<RecordPage />} />

      <Route path="/record/friend-add" element={<FriendAddPage />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRouter
