# Frontend 개발 안내

## 기술 스택

- React
- TypeScript
- Vite
- React Router DOM
- CSS3
- pnpm
- REST API
- Vercel

## 실행 방법

저장소 루트에서 `frontend` 디렉터리로 이동합니다.

```bash
cd frontend
```

의존성 패키지를 설치합니다.

```bash
pnpm install
```

`frontend` 디렉터리에 `.env` 파일을 생성하고 백엔드 API 주소를 설정합니다.

```env
VITE_API_BASE_URL=YOUR_BACKEND_API_URL
```

환경변수는 `.env.example` 파일을 참고하여 설정할 수 있습니다.

개발 서버를 실행합니다.

```bash
pnpm run dev
```

실행 후 터미널에 표시되는 로컬 주소로 접속합니다.

프로덕션 빌드를 실행합니다.

```bash
pnpm run build
```

## 프로젝트 구조

```text
frontend/
├── public/             # 정적 파일
├── src/
│   ├── api/            # 백엔드 API 통신
│   ├── assets/         # 이미지 및 정적 리소스
│   ├── components/     # 공통 UI 컴포넌트
│   ├── pages/          # 페이지별 컴포넌트
│   └── router/         # 페이지 라우팅 관리
├── .env.example        # 환경변수 예시
├── package.json        # 의존성 및 실행 스크립트
└── vite.config.ts      # Vite 설정
```

## 주요 기능

- 사용자 회원가입 및 로그인 화면
- 메인 페이지 및 친환경 미션 조회
- QR 기반 미션 인증 화면
- 탄소 감축량 및 포인트 조회
- 캐릭터 성장 현황 및 활동 통계 시각화
- 캘린더 기반 친환경 실천 기록 조회
- 연속 실천 일수 및 미션 수행 내역 조회
- 친구 활동 기록 조회
- 마이페이지 및 프로필 수정
- 제휴처 직원 및 관리자 페이지

## API 연동

프론트엔드는 REST API를 통해 백엔드 서버와 통신합니다.

API 요청 관련 코드는 `src/api` 디렉터리에서 관리합니다.

백엔드 서버 주소는 `VITE_API_BASE_URL` 환경변수를 통해 설정합니다.

인증이 필요한 API 요청에는 로그인 후 발급받은 JWT를 사용합니다.

백엔드 API는 다음과 같은 공통 응답 형식을 사용합니다.

**성공 응답**

```json
{
  "success": true,
  "data": {}
}
```

**실패 응답**

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "오류 메시지"
  }
}
```

## 배포

프론트엔드는 Vercel을 통해 배포합니다.

배포 시 다음과 같이 설정합니다.

- Root Directory: `frontend`
- Framework Preset: Vite
- Build Command: `pnpm run build`
- Output Directory: `dist`

배포 환경에서도 `VITE_API_BASE_URL` 환경변수를 설정하여 Railway에 배포된 백엔드 서버와 연동합니다.
