# Git 컨벤션

## 브랜치 규칙

브랜치 이름은 `type/issue-number-feature` 형식을 사용합니다.

```text
feat/13-be-auth
chore/11-backend-common
```

## 커밋 규칙

커밋 메시지는 `type(scope): 한국어 작업 내용` 형식을 사용합니다.

```text
feat(backend): 사용자 인증 기능 구현
fix(backend): 회원가입 중복 처리 보완
chore(frontend): 라우터 폴더 구조 생성
```

## PR 규칙

- 기본 대상 브랜치는 `develop`입니다.
- 기능 개발 브랜치는 최신 `develop`에서 생성합니다.
- 가능하면 Squash merge를 사용합니다.

## 브랜치 전략

```text
main
└── develop
    ├── feat/*
    ├── fix/*
    └── chore/*
```

- `main`: 최종 배포 및 안정화
- `develop`: 개발 내용 통합
- `feat`: 기능 개발
- `fix`: 버그 수정
- `chore`: 설정 및 구조 변경
