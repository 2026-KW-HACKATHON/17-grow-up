import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Splash from './pages/Splash/Splash'
import PointPage from './pages/Point/page/PointPage'
import SeoulPayPage from './pages/Point/page/SeoulPayPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/point" element={<PointPage />} />
        <Route path="/point/seoulpay" element={<SeoulPayPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App