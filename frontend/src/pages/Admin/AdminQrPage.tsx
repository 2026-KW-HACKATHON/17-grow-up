import { useEffect, useRef, useState } from 'react'
import { BrowserQRCodeReader } from '@zxing/browser'
import { Navigate, useNavigate, useParams } from 'react-router-dom'

import { verifyMission } from '../../api/verificationApi'
import { missions } from '../Mission/data/missionData'

import './AdminQrPage.css'

// 카메라 시작과 종료가 겹치지 않도록 관리
let scannerQueue: Promise<void> = Promise.resolve()

function AdminQrPage() {
  const { missionId } = useParams()
  const navigate = useNavigate()

  const videoRef = useRef<HTMLVideoElement | null>(null)

  const [cameraError, setCameraError] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationError, setVerificationError] = useState('')

  const [remainingSeconds, setRemainingSeconds] = useState(300)

  const mission = missions.find((item) => item.id === missionId)

  const selectedMissionId = mission?.missionId

  // 1. 5분 카운트다운
  useEffect(() => {
    const expiresAt = Date.now() + 5 * 60 * 1000

    const updateTimer = () => {
      const seconds = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000))

      setRemainingSeconds(seconds)
    }

    updateTimer()

    const timer = window.setInterval(updateTimer, 1000)

    return () => {
      window.clearInterval(timer)
    }
  }, [])

  // 2. QR 카메라 실행
  useEffect(() => {
    const videoElement = videoRef.current

    if (!videoElement || !selectedMissionId) {
      return
    }

    let cancelled = false
    let alreadyScanned = false

    let stopScanner: (() => void) | null = null

    // 실행 중인 카메라 초기화가 끝나면 정리하도록 예약
    const scannerTask = scannerQueue
      .catch(() => {})
      .then(async () => {
        if (cancelled) return

        const codeReader = new BrowserQRCodeReader()

        try {
          const controls = await codeReader.decodeFromVideoDevice(
            undefined,
            videoElement,
            async (result) => {
              if (!result || alreadyScanned || cancelled) {
                return
              }

              alreadyScanned = true
              setIsVerifying(true)
              setVerificationError('')

              try {
                const accessToken = localStorage.getItem('accessToken')

                if (!accessToken) {
                  setVerificationError('제휴처 직원 로그인이 필요합니다.')
                  alreadyScanned = false
                  return
                }

                const qrToken = result.getText()

                const verification = await verifyMission(accessToken, {
                  qrToken,
                  missionId: selectedMissionId,
                })

                if (cancelled) return

                stopScanner?.()

                navigate('/admin/mission', {
                  replace: true,
                  state: { verification },
                })
              } catch (error) {
                if (cancelled) return

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

                    case 'VALIDATION_ERROR':
                      setVerificationError('미션 정보가 올바르지 않습니다.')
                      break

                    default:
                      setVerificationError('미션 인증에 실패했습니다.')
                  }
                } else {
                  setVerificationError('미션 인증에 실패했습니다.')
                }

                alreadyScanned = false
              } finally {
                if (!cancelled) {
                  setIsVerifying(false)
                }
              }
            },
          )

          stopScanner = () => controls.stop()

          // 비동기 실행 도중 페이지가 닫힌 경우
          if (cancelled) {
            controls.stop()
          }
        } catch (error) {
          if (!cancelled) {
            console.error('카메라 실행 실패:', error)
            setCameraError(true)
          }
        }
      })

    // 다음 스캐너 실행은 이 스캐너가 정리된 후 시작
    let finishCleanup: (() => void) | null = null

    const cleanupPromise = new Promise<void>((resolve) => {
      finishCleanup = resolve
    })

    scannerQueue = scannerTask.then(() => cleanupPromise).catch(() => {})

    return () => {
      cancelled = true
      stopScanner?.()

      // 시작 중인 비동기 작업이 끝난 뒤 정리
      void scannerTask.finally(() => {
        stopScanner?.()
        finishCleanup?.()
      })
    }
  }, [selectedMissionId, navigate])

  if (!mission) {
    return <Navigate to="/admin/mission" replace />
  }

  // 남은 시간 표시
  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60

  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(
    seconds,
  ).padStart(2, '0')}`

  return (
    <div className="admin-qr-page">
      <main className="admin-qr-page__content">
        <button
          type="button"
          className="admin-qr-page__close"
          onClick={() => navigate('/admin/mission')}
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
          <span>{formattedTime}</span>
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
