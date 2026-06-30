# LinkUs 운영 배포

운영 주소는 `https://jw-linkus.com`이며, Caddy가 Let's Encrypt 인증서를 자동으로 발급하고 갱신합니다.

## 1. 사전 준비

- `jw-linkus.com`의 DNS A 레코드를 EC2 공인 IP로 지정합니다.
- EC2 보안 그룹에서 TCP 22, 80, 443을 허용합니다.
- EC2에 Docker Engine과 Docker Compose 플러그인을 설치합니다.
- Google OAuth 승인된 JavaScript 원본에 `https://jw-linkus.com`을 등록합니다.
- Google OAuth 승인된 리디렉션 URI에 `https://jw-linkus.com/oauth/google/callback`을 등록합니다.
- Kakao Developers 리디렉션 URI에 `https://jw-linkus.com/oauth/kakao/callback`을 등록합니다.

Redis 6379, 백엔드 8080, 프론트엔드 80 포트는 EC2 외부에 공개하지 않습니다.

## 2. GitHub Secrets

다음 Repository Secret을 등록합니다.

```text
DOCKERHUB_USERNAME
DOCKERHUB_TOKEN
EC2_HOST
EC2_USER
EC2_SSH_KEY

RDS_ENDPOINT
DB_USER
DB_PW
REDIS_PW
JWT_SECRET

S3_ACCESS_KEY
S3_SECRET_KEY
S3_REGION
S3_BUCKET

KAKAO_REST_API_KEY
KAKAO_CLIENT_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET

VITE_KAKAOMAP_KEY
VITE_KAKAO_REST_API_KEY
VITE_GOOGLE_CLIENT_ID
VITE_EMAILJS_SERVICE_ID
VITE_EMAILJS_TEMPLATE_ID
VITE_EMAILJS_PUBLIC_KEY
```

`REDIS_PW`와 `JWT_SECRET`은 길고 무작위인 별도 값을 사용합니다. 운영 `.env.prod`는 GitHub Actions가 EC2의 `~/app/infra/.env.prod`에 권한 600 수준으로 생성하며 저장소에는 커밋하지 않습니다.

## 3. 자동 배포

`main` 브랜치에 백엔드, 프론트엔드, `infra`, 배포 워크플로 변경이 push되면 다음 순서로 진행됩니다.

1. 백엔드와 프론트엔드 이미지를 빌드합니다.
2. `latest` 및 Git SHA 태그로 Docker Hub에 push합니다.
3. Compose와 Caddy 설정을 EC2로 복사합니다.
4. GitHub Secrets로 운영 `.env.prod`를 생성합니다.
5. 해당 Git SHA 이미지, Redis, Caddy를 Docker Compose로 실행합니다.

Redis 데이터와 TLS 인증서는 Docker named volume에 보존됩니다. 운영 중 `docker compose down -v`를 실행하면 해당 데이터가 삭제될 수 있으므로 사용하지 않습니다.

## 4. 로컬 Docker 실행

다음 예시 파일을 실제 파일로 복사하고 값을 채웁니다.

```text
infra/.env.local.example      → infra/.env.local
infra/.env.local.back.example → infra/.env.local.back
```

실행 명령:

```powershell
docker compose --env-file infra/.env.local -f infra/docker-compose.local.yml up -d --build
```

Docker 기반 로컬 프론트 주소는 `http://localhost`입니다. 기존 Vite 개발 서버를 사용할 때는 `http://localhost:3000`을 사용합니다.
