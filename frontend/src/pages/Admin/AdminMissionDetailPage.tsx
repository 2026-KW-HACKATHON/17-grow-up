import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { getPartnerMe, type PartnerMe } from '../../api/partnerApi'
import { missions } from '../Mission/data/missionData'

import './AdminMissionDetailPage.css'

function AdminMissionDetailPage() {
  const navigate = useNavigate()

  const [partnerInfo, setPartnerInfo] = useState<PartnerMe | null>(null)

  useEffect(() => {
    const fetchPartnerInfo = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken')

        if (!accessToken) {
          return
        }

        const data = await getPartnerMe(accessToken)

        setPartnerInfo(data)
      } catch (error) {
        console.error('직원 및 제휴처 정보 조회 실패:', error)
      }
    }

    fetchPartnerInfo()
  }, [])

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
    </div>
  )
}

export default AdminMissionDetailPage
