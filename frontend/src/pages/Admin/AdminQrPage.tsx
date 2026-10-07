import { useEffect, useRef, useState } from 'react'
import { BrowserQRCodeReader } from '@zxing/browser'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { verifyMission } from '../../api/verificationApi'
import { missions } from '../Mission/data/missionData'
import './AdminQrPage.css'

function AdminQrPage() {
  const { missionId } = useParams()
  const navigate = useNavigate()

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [cameraError, setCameraError] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationError, setVerificationError] = useState('')

  const mission = missions.find((item) => item.id === missionId)

  useEffect(() => {
    if (!videoRef.current || !missionId) {
      return
    }

    const codeReader = new BrowserQRCodeReader()

    let controls: {
      stop: () => void
    } | null = null

    let alreadyScanned = false

    const startScanner = async () => {
      try {
        controls = await codeReader.decodeFromVideoDevice(
          undefined,
          videoRef.current!,
          async (result) => {
            if (!result || alreadyScanned) {
              return
            }

            alreadyScanned = true
            setIsVerifying(true)
            setVerificationError('')

            try {
              const partnerAccessToken =
                localStorage.getItem('partnerAccessToken')

              if (!partnerAccessToken) {
                setVerificationError('제휴처 직원 로그인이 필요합니다.')

                alreadyScanned = false
                return
              }

              const qrToken = result.getText()

              const verification = await verifyMission(partnerAccessToken, {
                qrToken,
                missionId: Number(missionId),
              })

              console.log('미션 인증 성공:', verification)

              controls?.stop()

              navigate(`/admin/mission/${missionId}/success`, {
                state: verification,
              })
            } catch (error) {
              console.error('미션 인증 실패:', error)

              if (error instanceof Error) {
                switch (error.message) {
                  case 'INVALID_QR_TOKEN':
                    setVerificationError('유효하지 않은 QR 코드입니다.')
                    break

                  case 'EXPIRED_QR_TOKEN':
                    setVerificationError('만료된 QR 코드입니다.')
                    break

                  case 'MISSION_ALREADY_COMPLETED':
                    setVerificationError('오늘 이미 완료한 미션입니다.')
                    break

                  case 'MISSION_NOT_FOUND':
                    setVerificationError('미션을 찾을 수 없습니다.')
                    break

                  case 'UNAUTHORIZED':
                    setVerificationError('제휴처 직원 로그인이 필요합니다.')
                    break

                  case 'FORBIDDEN':
                    setVerificationError('미션 인증 권한이 없습니다.')
                    break

                  default:
                    setVerificationError('미션 인증에 실패했습니다.')
                }
              }

              alreadyScanned = false
            } finally {
              setIsVerifying(false)
            }
          },
        )
      } catch (error) {
        console.error('카메라 실행 실패:', error)
        setCameraError(true)
      }
    }

    startScanner()

    return () => {
      controls?.stop()
    }
  }, [missionId, navigate])

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
          {isVerifying && (
            <p className="admin-qr-page__status">미션을 인증하고 있어요...</p>
          )}

          {verificationError && (
            <p className="admin-qr-page__error">{verificationError}</p>
          )}
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
