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
        {partnerInfo && (
          <section
            style={{
              marginBottom: '24px',
            }}
          >
            <strong
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 700,
                color: '#111111',
              }}
            >
              {partnerInfo.partner.partnerName}
            </strong>

            <span
              style={{
                display: 'block',
                marginTop: '4px',
                fontSize: '12px',
                color: '#888888',
              }}
            >
              {partnerInfo.employee.loginId} 직원
            </span>
          </section>
        )}

        <section className="admin-mission-page__intro">
          <h1>
            손님의 실천을
            <br />
            인증 받아 주세요
          </h1>
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

      {/* QR 인증 성공 팝업 */}
      {verificationResult && (
        <div
          role="presentation"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            padding: '20px',
            boxSizing: 'border-box',
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="verification-success-title"
            style={{
              width: '100%',
              maxWidth: '340px',
              padding: '32px 24px',
              borderRadius: '20px',
              backgroundColor: '#ffffff',
              textAlign: 'center',
              boxSizing: 'border-box',
            }}
          >
            <div
              aria-hidden="true"
              style={{
                fontSize: '42px',
                marginBottom: '12px',
              }}
            >
              ✅
            </div>

            <h2
              id="verification-success-title"
              style={{
                margin: '0 0 8px',
                fontSize: '22px',
                fontWeight: 700,
                color: '#111111',
              }}
            >
              미션 인증 완료!
            </h2>

            <p
              style={{
                margin: '0 0 24px',
                fontSize: '14px',
                color: '#777777',
                lineHeight: 1.5,
              }}
            >
              {verificationResult.missionName}
              <br />
              정상적으로 인증되었습니다.
            </p>

            <div
              style={{
                padding: '18px',
                borderRadius: '12px',
                backgroundColor: '#F4F8F5',
                marginBottom: '24px',
              }}
            >
              <p
                style={{
                  margin: '0 0 12px',
                  fontSize: '14px',
                  color: '#555555',
                }}
              >
                지급 포인트
                <strong
                  style={{
                    display: 'block',
                    marginTop: '4px',
                    fontSize: '22px',
                    color: '#36A85F',
                  }}
                >
                  +{verificationResult.pointsAwarded.toLocaleString()}P
                </strong>
              </p>

              <div
                style={{
                  height: '1px',
                  backgroundColor: '#E0E8E2',
                  marginBottom: '12px',
                }}
              />

              <p
                style={{
                  margin: 0,
                  fontSize: '14px',
                  color: '#555555',
                }}
              >
                탄소 감축량
                <strong
                  style={{
                    display: 'block',
                    marginTop: '4px',
                    fontSize: '20px',
                    color: '#111111',
                  }}
                >
                  +{verificationResult.carbonAwardedG.toLocaleString()}g CO₂e
                </strong>
              </p>
            </div>

            <button
              type="button"
              onClick={handleClosePopup}
              style={{
                width: '100%',
                height: '48px',
                border: 'none',
                borderRadius: '12px',
                backgroundColor: '#36A85F',
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminMissionDetailPage
