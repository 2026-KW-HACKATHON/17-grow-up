# GrowUp

탄소중립 실천을 미션 형태로 기록하고, 탄소 감축량·포인트·캐릭터 성장을 통해 지속적인 친환경 실천을 돕는 서비스입니다.

## 기술 스택

### Backend

- Java 21
- Spring Boot 4.1.1
- Spring Data JPA
- Spring Security
- JWT
- MySQL
- Swagger / OpenAPI
- Gradle

### Frontend

- React
- TypeScript
- Vite
- React Router DOM
- CSS3
- pnpm

### 주요 구현 기능

- 로그인 및 회원가입 페이지 구현
- 메인 페이지 및 사용자 인터페이스 구현
- 친환경 미션 조회 및 QR 기반 미션 인증 화면 구현
- 캐릭터 성장 현황 및 미션별 활동 통계 시각화
- 탄소 감축량, 미션 수행 기록 및 연속 실천 현황 조회
- 캘린더 기반 친환경 실천 기록 시각화
- 포인트 조회 및 전환 화면 구현
- 마이페이지 및 사용자 프로필 수정 기능
- 친구 활동 기록 조회 및 비교
- 제휴처 직원 및 관리자 페이지 구현
- REST API 기반 백엔드 데이터 연동
- Vercel을 통한 프론트엔드 배포

### Deployment

- Frontend: Vercel
- Backend: Railway
- Database: MySQL

## 주요 기능

- 사용자 회원가입 / 로그인
- JWT 기반 인증
- 탄소중립 미션
- QR 기반 미션 인증
- 탄소 감축량 누적
- 포인트 전환
- 캐릭터 성장
- 실천 기록 / 연속 실천
- 친구 기능
- 제휴처 및 제휴처 직원 기능

## 문서

- [백엔드 개발 안내](docs/backend.md)
- [Git 컨벤션](docs/git-convention.md)
- [프로젝트 구조](docs/architecture.md)
- [프론트엔드 개발 안내](docs/frontend.md)

## Swagger

백엔드를 로컬에서 실행한 뒤 아래 주소에서 API를 확인할 수 있습니다.

<http://localhost:8080/swagger-ui/index.html>
