# YouTube Summary Dashboard

YouTube 채널의 모든 비디오를 자동으로 요약하고 관리할 수 있는 개인용 대시보드입니다. Make.com 자동화와 AI 요약을 통해 학습 효율을 극대화하는 도구입니다.

## ✨ 주요 기능

### 🎯 핵심 기능
- **채널 메타정보 자동 수집**: YouTube 채널 ID 입력으로 모든 비디오 메타정보 자동 수집
- **AI 자동 요약**: Make.com 웹훅을 통한 비디오 자막 추출 및 AI 요약 생성
- **직관적인 대시보드**: 캘린더/리스트 뷰로 비디오 요약을 시각적으로 관리
- **강력한 검색**: 제목과 요약 내용을 통한 실시간 검색
- **상세 정보 보기**: Drawer 형태로 전체 요약, 메타데이터, YouTube 링크 제공

### 🚀 고급 기능
- **처리 상태 추적**: AI 요약 완료, STT 처리 완료 등 실시간 상태 표시
- **태그 시스템**: 비디오별 태그 관리로 체계적인 분류
- **환경변수 기반 웹훅 관리**: 보안성과 유연성을 고려한 웹훅 URL 관리
- **글래스모피즘 UI**: 현대적이고 아름다운 사용자 인터페이스
- **반응형 디자인**: 데스크톱, 태블릿, 모바일 최적화

## 🛠️ 기술 스택

### Frontend
- **Next.js 15** - App Router, Server Components
- **React 19** - 최신 React 기능 활용
- **TypeScript** - 타입 안전성 보장
- **TailwindCSS** - 유틸리티 우선 스타일링
- **shadcn/ui** - 일관된 UI 컴포넌트
- **Lucide React** - 아이콘 시스템

### Backend & Database
- **Supabase** - PostgreSQL 데이터베이스
- **Make.com** - 자동화 워크플로우
- **TanStack Query** - 서버 상태 관리
- **React Hook Form** - 폼 상태 관리
- **Zod** - 스키마 검증

### Development Tools
- **ESLint** - 코드 품질 관리
- **date-fns** - 날짜 처리
- **es-toolkit** - 유틸리티 함수

## 🚀 시작하기

### 사전 요구사항
- Node.js 18+ 
- npm/yarn/pnpm
- Supabase 계정
- Make.com 계정

### 설치

1. **저장소 클론**
```bash
git clone https://github.com/your-username/youtube-summary-dashboard.git
cd youtube-summary-dashboard
```

2. **의존성 설치**
```bash
npm install
```

3. **환경변수 설정**
```bash
cp .env.example .env.local
```

`.env.local` 파일에 다음 값들을 설정하세요:
```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Make.com 웹훅 URL 설정
NEXT_PUBLIC_VIDEO_SUMMARY_WEBHOOK_URL=https://hook.eu2.make.com/your_video_summary_webhook
NEXT_PUBLIC_CHANNEL_META_WEBHOOK_URL=https://hook.eu2.make.com/your_channel_meta_webhook
```

4. **데이터베이스 설정**
   - Supabase 프로젝트 생성
   - `supabase/migrations/` 폴더의 SQL 파일들을 Supabase SQL Editor에서 실행

5. **개발 서버 실행**
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## ⚙️ 환경변수 설정

### 필수 환경변수

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 익명 키 | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `NEXT_PUBLIC_VIDEO_SUMMARY_WEBHOOK_URL` | 비디오 요약용 Make.com 웹훅 URL | `https://hook.eu2.make.com/xxxxx` |
| `NEXT_PUBLIC_CHANNEL_META_WEBHOOK_URL` | 채널 메타정보용 Make.com 웹훅 URL | `https://hook.eu2.make.com/xxxxx` |

### 웹훅 URL 설정 방법

1. **환경변수 우선**: `.env.local` 파일에 웹훅 URL을 설정하면 자동으로 적용됩니다.
2. **수동 설정**: 환경변수가 없으면 설정 페이지에서 직접 입력할 수 있습니다.
3. **보안**: 환경변수로 설정된 웹훅 URL은 설정 페이지에서 수정할 수 없어 보안성이 높습니다.

## 📖 사용법

### 1. 초기 설정
1. 환경변수 파일 (`.env.local`) 설정
2. Supabase 데이터베이스 마이그레이션 실행
3. Make.com 시나리오 설정 및 웹훅 URL 확인

### 2. 채널 메타정보 추가
1. 대시보드에서 "비디오 메타 정보 추가" 버튼 클릭
2. YouTube 채널 ID 입력 (UC로 시작하는 24자리)
3. Make.com 웹훅이 자동으로 채널의 모든 비디오 처리

### 3. 비디오 요약 확인
1. 대시보드에서 비디오 카드 클릭
2. Drawer에서 전체 요약 및 메타데이터 확인
3. "YouTube에서 열기" 링크로 원본 비디오 이동

### 4. 검색 및 필터
1. 상단 검색창에 키워드 입력
2. 제목과 요약 내용에서 실시간 검색
3. 캘린더/리스트 뷰 전환으로 다양한 방식으로 조회

### 5. 설정 관리
1. 사이드바에서 "Settings" 클릭
2. 웹훅 URL 설정 상태 확인
3. 환경변수 설정 여부 확인

## 🔧 Make.com 설정

### 필요한 웹훅 시나리오

#### 1. 채널 메타정보 웹훅
- **목적**: YouTube 채널의 모든 비디오 메타정보 수집
- **트리거**: 웹훅 수신
- **처리 과정**:
  1. 채널 ID 수신
  2. YouTube RSS 피드 파싱
  3. 각 비디오 메타정보 추출
  4. Supabase에 저장

#### 2. 비디오 요약 웹훅
- **목적**: 개별 비디오의 자막 추출 및 AI 요약
- **트리거**: 웹훅 수신
- **처리 과정**:
  1. 비디오 ID 수신
  2. YouTube 자막 추출
  3. AI 요약 생성
  4. Supabase에 저장

### 웹훅 플로우
```
채널 ID 입력 → Make.com 채널 메타정보 처리 → 개별 비디오 요약 생성 → Supabase 저장 → 대시보드 표시
```

## 📁 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API 라우트
│   │   ├── test-webhook/  # 웹훅 테스트
│   │   └── videos/        # 비디오 API
│   ├── dashboard/         # 대시보드 페이지
│   ├── settings/          # 설정 페이지
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 홈 페이지
├── components/            # React 컴포넌트
│   ├── layout/           # 레이아웃 컴포넌트
│   ├── providers/        # 컨텍스트 프로바이더
│   ├── ui/               # shadcn/ui 컴포넌트
│   └── video/            # 비디오 관련 컴포넌트
├── hooks/                # 커스텀 훅
├── lib/                  # 유틸리티 및 설정
│   ├── database.types.ts # Supabase 타입
│   ├── settings.ts       # 설정 관리
│   ├── supabase.ts       # Supabase 클라이언트
│   ├── utils.ts          # 유틸리티 함수
│   ├── videos.ts         # 비디오 관련 함수
│   └── webhook.ts        # 웹훅 관련 함수
└── types/                # TypeScript 타입 정의
```

## 🗄️ 데이터베이스 스키마

### 주요 테이블

#### `channel`
- 채널 정보 저장
- 채널 ID, 이름, 설명, 구독자 수 등

#### `video_summary`
- 비디오 요약 및 메타데이터
- 제목, 설명, 요약, 처리 상태 등

#### `settings`
- 애플리케이션 설정
- 웹훅 URL, 기타 설정값

#### `tag` / `video_tag`
- 태그 시스템
- 비디오별 태그 관리

#### `pending_job`
- 웹훅 처리 상태 추적
- 작업 상태, 진행률 등

자세한 스키마는 `doc/4) ERD.md`를 참조하세요.

## 🚀 배포

### Vercel 배포

1. **GitHub에 코드 푸시**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Vercel 프로젝트 설정**
   - Vercel 대시보드에서 저장소 연결
   - 자동 배포 설정 활성화

3. **환경변수 설정**
   - Vercel 프로젝트 설정에서 Environment Variables 추가
   - 모든 `NEXT_PUBLIC_*` 변수 설정

4. **배포 완료**
   - 자동 배포 실행
   - 도메인 확인 및 테스트

### 프로덕션 환경변수
```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key

# Make.com 웹훅 URL 설정
NEXT_PUBLIC_VIDEO_SUMMARY_WEBHOOK_URL=https://hook.eu2.make.com/your_production_video_summary_webhook
NEXT_PUBLIC_CHANNEL_META_WEBHOOK_URL=https://hook.eu2.make.com/your_production_channel_meta_webhook
```

## 🔧 개발 및 디버깅

### 로컬 개발 팁

1. **환경변수 확인**
```bash
# 환경변수 로드 확인
echo $NEXT_PUBLIC_SUPABASE_URL
```

2. **웹훅 테스트**
   - `/api/test-webhook` 엔드포인트 사용
   - Make.com 시나리오 테스트

3. **데이터베이스 연결 확인**
   - Supabase 대시보드에서 테이블 확인
   - SQL 쿼리 직접 실행

### 문제 해결

#### 웹훅이 작동하지 않는 경우
1. 환경변수 설정 확인
2. Make.com 시나리오 활성화 상태 확인
3. 웹훅 URL 형식 검증

#### 데이터베이스 연결 오류
1. Supabase URL 및 키 확인
2. RLS (Row Level Security) 정책 확인
3. 네트워크 연결 상태 확인
