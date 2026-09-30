import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import Splash from '../pages/Splash/Splash'
import PointPage from '../pages/Point/page/PointPage'
import SeoulPayPage from '../pages/Point/page/SeoulPayPage'
import MyPage from '../pages/My/page/MyPage'

function AppRouter() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Splash />}
      />

      <Route
        path="/point"
        element={<PointPage />}
      />

      <Route
        path="/point/seoulpay"
        element={<SeoulPayPage />}
      />

      <Route
        path="/my"
        element={<MyPage />}
      />

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  )
}

export default AppRouter