# 🏫 학교 급식 관리 시스템 — 설치 & 배포 가이드

---

## 📋 목차
1. 사전 준비 (필수 설치)
2. 로컬 개발 환경 세팅
3. Railway 백엔드 + DB 배포
4. Vercel 프론트엔드 배포
5. 환경변수 연결
6. 초기 데이터 등록 (시드)
7. 문제 해결 (FAQ)

---

## 1. 사전 준비

아래 프로그램들을 먼저 설치하세요.

| 프로그램 | 설치 주소 | 확인 명령어 |
|---|---|---|
| Node.js 20+ | https://nodejs.org | `node -v` |
| Git | https://git-scm.com | `git -v` |
| VS Code (권장) | https://code.visualstudio.com | - |

---

## 2. 로컬 개발 환경 세팅

### 2-1. 프로젝트 폴더 열기

```bash
# VS Code에서 school-meal 폴더 열기
code school-meal
```

### 2-2. 백엔드 세팅

```bash
cd backend

# 패키지 설치
npm install

# 환경변수 파일 생성
cp .env.example .env
```

`.env` 파일을 열어서 `JWT_SECRET`을 랜덤 문자열로 바꿔주세요.
(아무 문자나 길게 입력하면 됩니다. 예: `myschool-secret-key-2024-xyz`)

로컬 개발 시 DATABASE_URL은 로컬 PostgreSQL이 필요한데,
**처음엔 그냥 Railway 배포 후 Railway DB URL을 복사해서 쓰는 게 편합니다.**
(3번 Railway 배포 먼저 하고 돌아와도 됩니다)

### 2-3. 프론트엔드 세팅

```bash
cd ../frontend

# 패키지 설치
npm install

# 환경변수 파일 생성
cp .env.example .env
```

### 2-4. 로컬 실행

터미널 두 개를 열어서:

```bash
# 터미널 1 — 백엔드
cd backend
npm run dev
# → http://localhost:4000 에서 실행

# 터미널 2 — 프론트엔드
cd frontend
npm run dev
# → http://localhost:5173 에서 실행
```

---

## 3. Railway 백엔드 + DB 배포 ⚙️

### 3-1. GitHub에 코드 올리기

```bash
# school-meal 루트 폴더에서
git init
git add .
git commit -m "initial commit"
```

GitHub에서 새 저장소 생성 후:

```bash
git remote add origin https://github.com/본인계정/school-meal.git
git push -u origin main
```

### 3-2. Railway 가입 & 프로젝트 생성

1. https://railway.app 접속 → **GitHub으로 가입**
2. **New Project** 클릭
3. **Deploy from GitHub repo** 선택
4. `school-meal` 저장소 선택

> ⚠️ 이 때 Railway가 루트 폴더를 배포하려 합니다.
> 백엔드 폴더만 배포해야 하므로 아래 설정을 바꿔야 합니다.

### 3-3. Railway 서비스 설정

배포된 서비스 클릭 → **Settings** 탭:

```
Root Directory: backend
```

**Variables** 탭에서 환경변수 추가:

| Key | Value |
|---|---|
| `JWT_SECRET` | 아무 랜덤 문자열 (20자 이상) |
| `FRONTEND_URL` | (나중에 Vercel URL로 교체, 일단 비워둬도 됨) |
| `NODE_ENV` | `production` |

### 3-4. PostgreSQL DB 추가

1. Railway 프로젝트에서 **+ New** 클릭
2. **Database** → **PostgreSQL** 선택
3. 생성 완료되면 DB 클릭 → **Variables** 탭
4. `DATABASE_URL` 값 복사

백엔드 서비스 → **Variables** 탭 → `DATABASE_URL` 추가 (위에서 복사한 값)

### 3-5. 배포 확인

Railway 배포 로그에서:
```
🚀 서버 실행 중: http://localhost:4000
```
이 나오면 성공! 상단의 도메인 URL 복사해두세요.
예: `https://school-meal-backend-production.up.railway.app`

---

## 4. Vercel 프론트엔드 배포 🌐

1. https://vercel.com 접속 → **GitHub으로 가입**
2. **Add New Project** → GitHub 저장소 선택
3. **Root Directory** 설정:
   ```
   frontend
   ```
4. **Environment Variables** 추가:

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://본인Railway도메인.railway.app/api` |

5. **Deploy** 클릭!

배포 완료되면 Vercel 도메인이 생성됩니다.
예: `https://school-meal.vercel.app`

---

## 5. 환경변수 최종 연결 🔗

Vercel 배포 URL을 복사해서 Railway 백엔드 환경변수에 추가:

Railway → 백엔드 서비스 → Variables:
```
FRONTEND_URL = https://school-meal.vercel.app
```

변경 후 Railway가 자동으로 재배포합니다.

---

## 6. 초기 데이터 등록 (시드) 🌱

Railway 배포 완료 후, **로컬**에서 아래를 실행하세요.
(backend/.env의 DATABASE_URL을 Railway DB URL로 설정한 상태여야 합니다)

```bash
cd backend

# Prisma 마이그레이션 (테이블 생성)
npx prisma migrate deploy

# 또는 개발 환경에서는
npx prisma migrate dev --name init

# 초기 데이터 삽입
npm run db:seed
```

완료되면 아래 계정으로 로그인 가능:

| 역할 | 학번/사번 | 비밀번호 |
|---|---|---|
| 관리자 | `admin` | `admin1234` |
| 교사 | `T20240001` | `teacher1234` |
| 학생 | `S20240001` | `student1234` |

---

## 7. 문제 해결 (FAQ) 🔧

### Q. Railway 배포 후 서버가 자꾸 꺼져요
Railway Free 플랜($1/월)은 리소스가 적습니다.
Hobby 플랜($5/월)으로 업그레이드하면 해결됩니다.

### Q. CORS 오류가 나요
백엔드 Railway Variables에서 `FRONTEND_URL`이 정확히 설정됐는지 확인하세요.
`https://` 포함, 끝에 `/` 없이.

### Q. 로그인이 안 돼요
1. `npm run db:seed`를 실행했는지 확인
2. Railway 로그에서 `DATABASE_URL` 관련 오류 확인
3. Prisma 마이그레이션이 성공했는지 확인

### Q. DB를 GUI로 보고 싶어요
```bash
cd backend
npx prisma studio
# → http://localhost:5555 에서 DB를 시각적으로 확인/수정 가능
```

### Q. 새 학생 계정을 추가하고 싶어요
Prisma Studio에서 직접 추가하거나,
`backend/src/prisma/seed.ts`에 계정을 추가하고 `npm run db:seed`를 다시 실행하세요.

---

## 📁 최종 프로젝트 구조

```
school-meal/
├── backend/
│   ├── src/
│   │   ├── index.ts              # 서버 진입점
│   │   ├── middleware/auth.ts    # JWT 인증
│   │   ├── routes/
│   │   │   ├── auth.ts           # 로그인/내 정보
│   │   │   ├── meals.ts          # 급식 메뉴
│   │   │   ├── subscriptions.ts  # 급식 신청
│   │   │   └── stats.ts          # 통계 (교사/관리자)
│   │   └── prisma/
│   │       ├── schema.prisma     # DB 스키마
│   │       └── seed.ts           # 초기 데이터
│   ├── .env.example
│   ├── railway.toml              # Railway 배포 설정
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── App.tsx               # 라우터
    │   ├── hooks/useAuth.tsx     # 인증 상태
    │   ├── lib/api.ts            # API 클라이언트
    │   ├── types/index.ts        # 타입 정의
    │   ├── components/Layout.tsx # 사이드바 레이아웃
    │   └── pages/
    │       ├── LoginPage.tsx     # 로그인
    │       ├── TodayPage.tsx     # 오늘 급식 + 신청
    │       ├── SubscriptionPage.tsx  # 내 신청 현황
    │       └── StatsPage.tsx     # 통계 (교사/관리자)
    ├── .env.example
    └── package.json
```
