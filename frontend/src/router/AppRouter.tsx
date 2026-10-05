import { Navigate, Route, Routes } from 'react-router-dom'

import Splash from '../pages/Splash/Splash'
import MainPage from '../pages/Main/MainPage'
import PointPage from '../pages/Point/page/PointPage'
import SeoulPayPage from '../pages/Point/page/SeoulPayPage'
import MyPage from '../pages/My/page/MyPage'
import RecordPage from '../pages/Record/page/RecordPage'
import FriendAddPage from '../pages/Record/page/FriendAddPage'
import MissionPage from '../pages/Mission/MissionPage'
import MissionDetailPage from '../pages/Mission/MissionDetailPage'
import MissionQrPage from '../pages/Mission/MissionQrPage'
import MissionSuccessPage from '../pages/Mission/MissionSuccessPage'
import AlarmPage from '../pages/Main/AlarmPage'
import StoreDetailPage from '../pages/Mission/StoreDetailPage'

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Splash />} />

      <Route path="/main" element={<MainPage />} />

      <Route path="/mission" element={<MissionPage />} />

      <Route path="/point" element={<PointPage />} />

      <Route path="/point/seoulpay" element={<SeoulPayPage />} />

      <Route path="/record" element={<RecordPage />} />

      <Route path="/record/friend-add" element={<FriendAddPage />} />

      <Route path="/my" element={<MyPage />} />
      <Route path="/mission/:missionId" element={<MissionDetailPage />} />
      <Route path="/mission/:missionId/qr" element={<MissionQrPage />} />
      <Route
        path="/mission/:missionId/success"
        element={<MissionSuccessPage />}
      />
      <Route path="/stores" element={<StoreDetailPage />} />
      <Route path="/alarm" element={<AlarmPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRouter
