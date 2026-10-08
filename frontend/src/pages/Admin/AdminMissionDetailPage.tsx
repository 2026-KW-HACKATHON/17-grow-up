import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { getPartnerMe, type PartnerMe } from '../../api/partnerApi'
import type { VerificationResult } from '../../api/verificationApi'
import { missions } from '../Mission/data/missionData'

import './AdminMissionDetailPage.css'

interface MissionNavigationState {
  verification?: VerificationResult
}

function AdminMissionDetailPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const [partnerInfo, setPartnerInfo] = useState<PartnerMe | null>(null)

  const [verificationResult, setVerificationResult] =
    useState<VerificationResult | null>(
      () =>
        (location.state as MissionNavigationState | null)?.verification ?? null,
    )
  const handleLogout = () => {
    const confirmed = window.confirm('로그아웃하시겠습니까?')

    if (!confirmed) return

    localStorage.removeItem('accessToken')

    navigate('/login', { replace: true })
  }
  // 1. 직원 및 제휴처 정보 조회
  useEffect(() => {
    let cancelled = false

    const fetchPartnerInfo = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken')

        if (!accessToken) {
          return
        }

        const data = await getPartnerMe(accessToken)

        if (!cancelled) {
          setPartnerInfo(data)
        }
      } catch (error) {
        if (!cancelled) {
          console.error('직원 및 제휴처 정보 조회 실패:', error)
        }
      }
    }

    fetchPartnerInfo()

    return () => {
      cancelled = true
    }
  }, [])

  // 2. 인증 결과를 받은 후 라우팅 state 정리
  useEffect(() => {
    const state = location.state as MissionNavigationState | null

    if (state?.verification) {
      setVerificationResult(state.verification)

      // 새로고침 시 동일 팝업이 다시 뜨지 않도록 제거
      navigate(location.pathname, {
        replace: true,
        state: null,
      })
    }
  }, [location.state, location.pathname, navigate])

  // 3. 인증 완료 팝업 닫기
  const handleClosePopup = () => {
    setVerificationResult(null)
  }

  return (
    <div className="admin-mission-page">
      <main className="admin-mission-page__content">
        <section className="admin-mission-page__intro">
          <div className="admin-mission-page__intro-left">
            <h1>
              손님의 실천을
              <br />
              인증 받아 주세요
            </h1>

            {partnerInfo && (
              <div className="admin-mission-page__partner-info">
                <strong>{partnerInfo.partner.partnerName}</strong>
                <span>{partnerInfo.employee.loginId} 직원</span>
              </div>
            )}
          </div>

          <button
            type="button"
            className="admin-mission-page__logout"
            onClick={handleLogout}
          >
            로그아웃
          </button>
        </section>

        <section style={{ marginTop: '28px' }}>
          <h2
            style={{
              margin: '0 0 12px',
              fontSize: '15px',
              fontWeight: 700,
            }}
          >
            미션 목록
          </h2>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            {missions.map((mission) => (
              <button
                key={mission.id}
                type="button"
                onClick={() => navigate(`/admin/mission/${mission.id}/qr`)}
                style={{
                  width: '100%',
                  minHeight: '96px',

                  padding: '10px 14px 10px 10px',

                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',

                  border: '1px solid #eeeeee',
                  borderRadius: '14px',

                  background: '#ffffff',

                  textAlign: 'left',

                  cursor: 'pointer',

                  boxSizing: 'border-box',
                }}
              >
                <div
                  style={{
                    width: '86px',
                    height: '76px',

                    flexShrink: 0,

                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',

                    borderRadius: '12px',

                    backgroundColor: mission.backgroundColor,
                  }}
                >
                  <img
                    src={mission.image}
                    alt={mission.title}
                    style={{
                      width: '64px',
                      height: '64px',
                      objectFit: 'contain',
                    }}
                  />
                </div>

                <div
                  style={{
                    flex: 1,
                    minWidth: 0,

                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                  }}
                >
                  <strong
                    style={{
                      color: '#111111',
                      fontSize: '14px',
                      fontWeight: 700,
                      lineHeight: 1.4,
                    }}
                  >
                    {mission.title}
                  </strong>

                  <span
                    style={{
                      marginTop: '2px',

                      color: '#888888',
                      fontSize: '12px',
                    }}
                  >
                    {mission.category}
                  </span>

                  <div
                    style={{
                      marginTop: '6px',

                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                    }}
                  >
                    <img
                      src="/point-coin.svg"
                      alt=""
                      style={{
                        width: '14px',
                        height: '14px',
                      }}
                    />

                    <span
                      style={{
                        color: '#111111',
                        fontSize: '12px',
                        fontWeight: 700,
                      }}
                    >
                      {mission.point}
                    </span>
                  </div>
                </div>

                <span
                  aria-hidden="true"
                  style={{
                    flexShrink: 0,

                    color: '#999999',

                    fontSize: '22px',
                    fontWeight: 300,
                  }}
                >
                  ›
                </span>
              </button>
            ))}
          </div>
        </section>
      </main>

      {/* QR 인증 성공 모달 */}
      {verificationResult && (
        <div className="admin-success-overlay">
          <div
            className="admin-success-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-success-title"
          >
            <h2 id="admin-success-title" className="admin-success-modal__title">
              인증 완료!
            </h2>

            <img
              className="admin-success-modal__character"
              src="/admin-success-charater.svg"
              alt="인증 완료를 축하하는 그루 캐릭터"
            />

            <button
              type="button"
              className="admin-success-modal__button"
              onClick={handleClosePopup}
            >
              목록으로
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminMissionDetailPage
