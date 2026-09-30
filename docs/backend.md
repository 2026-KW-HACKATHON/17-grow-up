# Backend 개발 안내

## 기술 스택

- Java 21
- Spring Boot 4.1.1
- Spring Web
- Spring Data JPA
- Spring Security
- JWT
- MySQL
- Validation
- Swagger / OpenAPI
- Gradle

## 실행 방법

저장소 루트에서 `backend` 디렉터리로 이동합니다.

```bash
cd backend
```

다음 환경변수를 설정합니다.

```bash
export DB_USERNAME=growup
export DB_PASSWORD=YOUR_DB_PASSWORD
export JWT_SECRET=YOUR_BASE64_JWT_SECRET
```

`JWT_SECRET`은 Base64 형식이어야 합니다. 개발용 값은 다음 명령으로 생성할 수 있습니다.

```bash
export JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')
```

애플리케이션을 실행합니다.

```bash
./gradlew bootRun
```

전체 테스트와 빌드를 실행합니다.

```bash
./gradlew clean build
```

## Swagger

로컬 실행 후 다음 주소에서 API 문서와 요청 테스트 기능을 사용할 수 있습니다.

<http://localhost:8080/swagger-ui/index.html>

## 공통 API 응답

성공 응답은 다음 형식을 사용합니다.

```json
{
  "success": true,
  "data": {}
}
```

실패 응답은 다음 형식을 사용합니다.

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "오류 메시지"
  }
}
```
