import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { missions } from '../Mission/data/missionData'
import './AdminQrPage.css'

function AdminQrPage() {
  const { missionId } = useParams()
  const navigate = useNavigate()

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [cameraError, setCameraError] = useState(false)

  const mission = missions.find((item) => item.id === missionId)

  useEffect(() => {
    let stream: MediaStream | null = null

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: {
              ideal: 'environment',
            },
          },
          audio: false,
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch {
        setCameraError(true)
      }
    }

    startCamera()

    return () => {
      stream?.getTracks().forEach((track) => {
        track.stop()
      })
    }
  }, [])

  if (!mission) {
    return <Navigate to="/main" replace />
  }

  return (
    <div className="admin-qr-page">
      <main className="admin-qr-page__content">
        <button
          type="button"
          className="admin-qr-page__close"
          onClick={() => navigate(-1)}
          aria-label="닫기"
        >
          ×
        </button>

        <header className="admin-qr-page__header">
          <h1>미션 QR 인증</h1>

          <h2>
            손님의 QR코드를
            <br />
            스캔해 주세요
          </h2>

          <p>스캔 후 자동으로 인증됩니다.</p>
        </header>

        <section className="admin-qr-page__camera">
          {!cameraError ? (
            <video
              ref={videoRef}
              className="admin-qr-page__video"
              autoPlay
              playsInline
              muted
            />
          ) : (
            <div className="admin-qr-page__camera-error">
              카메라를 사용할 수 없어요.
            </div>
          )}

          <div className="admin-qr-page__scanner">
            <span className="admin-qr-page__corner admin-qr-page__corner--tl" />
            <span className="admin-qr-page__corner admin-qr-page__corner--tr" />
            <span className="admin-qr-page__corner admin-qr-page__corner--bl" />
            <span className="admin-qr-page__corner admin-qr-page__corner--br" />

            <span className="admin-qr-page__scan-line" />
          </div>
        </section>

        <div className="admin-qr-page__timer">
          <span>◷</span>
          <span>04:57</span>
        </div>

        <section className="admin-qr-page__mission">
          <div
            className="admin-qr-page__mission-image"
            style={{
              backgroundColor: mission.backgroundColor,
            }}
          >
            <img src={mission.image} alt="" />
          </div>

          <div className="admin-qr-page__mission-info">
            <strong>{mission.title}</strong>
            <span>{mission.category}</span>

            <div className="admin-qr-page__point">
              <img src="/point-coin.svg" alt="" />
              <strong>{mission.point}</strong>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default AdminQrPage
