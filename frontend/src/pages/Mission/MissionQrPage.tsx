import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'

import BottomNav from '../../components/BottomNav/BottomNav'
import MissionInfoCard from './components/MissionInfoCard'

import { getMissionById, type Mission } from '../../api/missionApi'

import { createUserQr, type QrTokenResponse } from '../../api/userQrApi'

import './MissionQrPage.css'

const missionImageMap: Record<string, string> = {
  '텀블러 사용하기': '/tumbler.svg',
  '장바구니 사용하기': '/shopping-bag.svg',
  '포장 시 다회용기 사용하기': '/container.svg',
  '음식 안 남기기': '/empty-plate.svg',
  '일회용 수저·포크 사용 안 하기': '/no-disposable.svg',
}

const missionBackgroundMap: Record<string, string> = {
  '텀블러 사용하기': '#E9F4EC',
  '장바구니 사용하기': '#FFF5E0',
  '포장 시 다회용기 사용하기': '#EDF3FC',
  '음식 안 남기기': '#FCE8E5',
  '일회용 수저·포크 사용 안 하기': '#DFE5FB',
}

const missionDisplayMap: Record<
  string,
  {
    title: string
    category: string
  }
> = {
  '텀블러 사용하기': {
    title: '텀블러 사용하기',
    category: '카페',
  },
  '장바구니 사용하기': {
    title: '장바구니 사용하기',
    category: '마트·편의점',
  },
  '포장 시 다회용기 사용하기': {
    title: '포장 시 다회용기 사용하기',
    category: '음식점',
  },
  '음식 안 남기기': {
    title: '음식 남기지 않기',
    category: '음식점',
  },
  '일회용 수저·포크 사용 안 하기': {
    title: '일회용 수저·빨대 받지 않기',
    category: '카페·음식점',
  },
}

function getQrTokenExpiresAt(qrToken: string): number | null {
  try {
    const payload = qrToken.split('.')[1]

    if (!payload) {
      return null
    }

    let base64 = payload.replace(/-/g, '+').replace(/_/g, '/')

    while (base64.length % 4 !== 0) {
      base64 += '='
    }

    const decoded = JSON.parse(atob(base64))

    if (!decoded.exp) {
      return null
    }

    return decoded.exp * 1000
  } catch (error) {
    console.error('QR 토큰 만료시간 확인 실패:', error)

    return null
  }
}

function MissionQrPage() {
  const { missionId } = useParams()
  const navigate = useNavigate()

  const [mission, setMission] = useState<Mission | null>(null)
  const [qrData, setQrData] = useState<QrTokenResponse | null>(null)

  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const [error, setError] = useState('')

  useEffect(() => {
    const fetchQrPageData = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken')

        if (!accessToken) {
          setError('로그인이 필요합니다.')
          return
        }

        if (!missionId) {
          setError('미션 정보를 찾을 수 없습니다.')
          return
        }

        const selectedMission = await getMissionById(
          Number(missionId),
          accessToken,
        )

        const qr = await createUserQr(accessToken)

        setMission(selectedMission)
        setQrData(qr)
      } catch (error) {
        console.error('QR 페이지 조회 실패:', error)

        setError('QR 정보를 불러오지 못했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchQrPageData()
  }, [missionId])

  useEffect(() => {
    if (!qrData) {
      return
    }

    const expiresAt = getQrTokenExpiresAt(qrData.qrToken)

    if (!expiresAt) {
      console.error('QR 토큰에 만료시간이 없습니다.')

      setRemainingSeconds(0)
      return
    }

    const updateRemainingTime = () => {
      const now = Date.now()

      const seconds = Math.max(0, Math.floor((expiresAt - now) / 1000))

      setRemainingSeconds(seconds)
    }

    updateRemainingTime()

    const timer = window.setInterval(updateRemainingTime, 1000)

    return () => {
      window.clearInterval(timer)
    }
  }, [qrData])

  const handleRefreshQr = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken')

      if (!accessToken) {
        setError('로그인이 필요합니다.')
        return
      }

      setIsRefreshing(true)
      setRemainingSeconds(null)

      const qr = await createUserQr(accessToken)

      setQrData(qr)
    } catch (error) {
      console.error('QR 재발급 실패:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="mission-qr-page">
        <main className="mission-qr-page__content">
          <p>QR을 불러오는 중...</p>
        </main>
      </div>
    )
  }

  if (error || !mission || !qrData) {
    return <Navigate to="/mission" replace />
  }

  const image = missionImageMap[mission.name] ?? '/tumbler.svg'

  const backgroundColor = missionBackgroundMap[mission.name] ?? '#F5F5F5'

  const display = missionDisplayMap[mission.name] ?? {
    title: mission.name,
    category: mission.category,
  }

  const displayMission: Mission = {
    ...mission,
    name: display.title,
    category: display.category,
  }

  const minutes =
    remainingSeconds === null ? 0 : Math.floor(remainingSeconds / 60)

  const seconds = remainingSeconds === null ? 0 : remainingSeconds % 60

  const formattedTime = `${String(minutes).padStart(
    2,
    '0',
  )}:${String(seconds).padStart(2, '0')}`

  const isExpired = remainingSeconds === 0

  return (
    <div
      className="mission-qr-page"
      style={{
        backgroundColor,
      }}
    >
      <main className="mission-qr-page__content">
        <button
          type="button"
          className="mission-qr-page__close"
          onClick={() => navigate(-1)}
          aria-label="닫기"
        >
          ×
        </button>

        <header className="mission-qr-page__header">
          <h1>미션 QR 인증</h1>

          <p className="mission-qr-page__guide">
            매장 직원에게
            <br />
            QR코드를 보여주세요
          </p>

          <span className="mission-qr-page__description">
            스캔 후 자동으로 인증됩니다.
          </span>
        </header>

        <section className="mission-qr-page__qr-section">
          <div className="mission-qr-page__qr-box">
            {isExpired ? (
              <div className="mission-qr-page__expired">
                <strong>QR이 만료되었어요</strong>

                <span>새로운 QR을 발급해 주세요.</span>

                <button
                  type="button"
                  onClick={handleRefreshQr}
                  disabled={isRefreshing}
                >
                  {isRefreshing ? '발급 중...' : 'QR 다시 발급하기'}
                </button>
              </div>
            ) : (
              <QRCodeSVG value={qrData.qrToken} size={180} />
            )}
          </div>

          <div className="mission-qr-page__timer">
            <span>◷</span>

            <span>{remainingSeconds === null ? '--:--' : formattedTime}</span>
          </div>
        </section>

        <section className="mission-qr-page__mission">
          <MissionInfoCard
            mission={displayMission}
            image={image}
            backgroundColor={backgroundColor}
          />
        </section>

        <button
          type="button"
          className="mission-qr-page__success-test"
          onClick={() => navigate(`/mission/${mission.missionId}/success`)}
        >
          인증 완료 테스트
        </button>
      </main>

      <BottomNav active="mission" />
    </div>
  )
}

export default MissionQrPage
