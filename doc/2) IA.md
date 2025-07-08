## 1. 사이트 맵

```
/
├── dashboard (기본 페이지)
│   ├── ?view=calendar (기본 뷰)
│   ├── ?view=list (리스트 뷰 토글)
│   └── ?query=검색어 (검색 필터)
├── settings
│   ├── (Make.com 웹훅 설정)
│   └── (채널 메타정보 관리)
├── api/
│   ├── videos (POST - Make.com 웹훅 수신)
│   └── test-webhook (테스트용 웹훅)
└── error-pages
    ├── 404
    └── 500
```

> **내부 링크:** 모든 경로는 `next/link`(클라이언트 라우팅) 사용
> **외부 링크:** Make.com 시나리오 편집기·Supabase 콘솔은 `target="_blank"` 새 창으로 분리 – 세션 격리 및 보안 쿠키 보호 목적
> **모달/Drawer:** URL 변경 없이 상태 기반 UI 표시 (채널 메타 추가 모달, 비디오 상세 Drawer)

---

## 2. 페이지 계층

| 레벨 | 페이지                | 핵심 목적                   | 접근 경로                             |
| -- | ------------------ | ----------------------- | --------------------------------- |
| 0  | **Dashboard Home** | 비디오 요약 카드 열람·검색·필터       | `/dashboard` (default = calendar) |
| 1  | **Channel Meta Modal** | 채널 ID 입력→메타정보 요청        | 상단 **"비디오 메타 정보 추가"** 버튼       |
| 1  | **Video Detail Drawer** | 개별 요약·메타데이터·액션          | 카드 클릭 (Drawer 형태)               |
| 1  | **Settings**       | Make.com 웹훅 URL 관리     | 사이드바 `Settings`                   |
| 0  | **Error / Empty**  | 예외·데이터 없음 처리            | 동적 렌더                             |

---

## 3. URL 구조 (Next.js 14 App Router 예시)

| 유형      | 패턴                           | 설명                        |               |
| ------- | ---------------------------- | ------------------------- | ------------- |
| 대시보드 기본 | `/dashboard`                 | \`?view=calendar          | list\` 쿼리로 토글 |
| 검색      | `/dashboard?query=키워드`       | 키워드 변경 시 shallow routing  |               |
| 날짜 필터   | `/dashboard?date=YYYY-MM-DD` | 캘린더 셀 클릭 시 적용             |               |
| 설정      | `/settings`                  | 웹훅 URL 관리                 |               |
| API 엔드포인트 | `/api/videos`                | Make.com 웹훅 수신            |               |
| 오류      | `/*` → 404, 500              | 서버/클라이언트 구분 처리            |               |

---

## 4. 콘텐츠 조직

### 데이터 도메인

* **Channel**: 채널 정보 (channel_id, channel_name, category, RSS URL)
* **Video Summary**: 비디오 메타데이터, 요약 텍스트, 트랜스크립트
* **Settings**: Make.com 웹훅 URL 설정 (비디오 요약용, 채널 메타정보용)
* **Tags**: 비디오 태그 정보 (자동 생성 또는 수동 추가)
* **Pending Jobs**: 웹훅 처리 상태 추적

### 내비게이션 콘텐츠

| AppLayout Components | 기능                 |
| -------------------- | ------------------ |
| **Topbar**           | 로고, 검색창, 사용자 메뉴    |
| **Sidebar**          | 대시보드, 설정 네비게이션     |
| **Main Content**     | 페이지별 콘텐츠 영역        |

### 검색·필터 상태

* **URL Query String**에 저장 → 브라우저 history 및 SEO 크롤러 최적화
* 상태 변화 시 **TanStack Query Cache** 갱신 → 빠른 재요청 방지
* 검색 조건: `?query=키워드` (제목·요약 텍스트 검색)

---

## 5. 상호작용 패턴

1. **채널 메타정보 추가**

   * 모달 열기 → 채널 ID 입력 → 웹훅 호출 → 성공 토스트 → 모달 닫기
2. **비디오 카드 클릭**

   * 카드 클릭 → Drawer 열기 → 상세 정보 표시 → ESC 또는 X 버튼으로 닫기
3. **키워드 검색**

   * 검색창 입력 → `query` 파라미터 업데이트 → 실시간 필터링 → 결과 표시
4. **뷰 전환**

   * 캘린더/리스트 토글 버튼 → `view` 파라미터 변경 → 레이아웃 변경
5. **반응형 사이드바**

   * 데스크톱 ≥ 1024px: 기본 펼침
   * 모바일 < 1024px: 햄버거 토글, overlay dim 처리

---

## 6. 컴포넌트 계층

```
<AppLayout>
 ├─ <Topbar>
 │   ├─ <Logo/>
 │   ├─ <SearchBar/>
 │   └─ <UserMenu/>
 ├─ <Sidebar>
 │   ├─ <NavItem link="/dashboard"/>
 │   └─ <NavItem link="/settings"/>
 └─ <MainContent>
     ├─ <DashboardPage>
     │   ├─ <ViewToggle> (Calendar/List)
     │   ├─ <VideoGrid> | <VideoList>
     │   ├─ <VideoSummaryCard/>
     │   ├─ <AddChannelMetaModal/>
     │   └─ <VideoDetailDrawer/>
     └─ <SettingsPage>
         ├─ <WebhookSettingsForm/>
         └─ <ChannelManagement/>
```

**주요 컴포넌트별 세부 구조**

* **Dashboard**

  * `<VideoSummaryCard/>` - 썸네일, 제목, 요약, 태그, 상태 배지
  * `<AddChannelMetaModal/>` - 채널 ID 입력, 유효성 검사, 웹훅 호출
  * `<VideoDetailDrawer/>` - 전체 요약, 메타데이터, YouTube 링크
  * `<EmptyState/>` / `<ErrorBanner/>` - 데이터 없음 또는 오류 상태
* **Settings**

  * `<WebhookUrlForm/>` - Make.com 웹훅 URL 설정
  * `<ChannelMetaForm/>` - 채널 메타정보 요청 관리

---

### 데스크톱 & 모바일 Wireflow (텍스트-테이블)

| # | 상태                   | 주요 요소(데스크톱)                     | 전이                      | 모바일 차이점             |
| - | -------------------- | ------------------------------- | ----------------------- | ------------------- |
| 1 | Dashboard-Calendar   | Topbar + Sidebar + CalendarGrid | 채널 메타 추가 버튼 · Card 클릭 | Sidebar 기본 숨김, 햄버거  |
| 2 | Channel Meta Modal   | Modal 중앙, 채널 ID 입력, Progress  | (✓) 완료 → state 1        | 모달 fullscreen       |
| 3 | Video Detail Drawer  | Drawer 오른쪽 slide-in             | (×) ESC → state 1       | Drawer bottom-sheet |
| 4 | Settings-Webhooks    | Sidebar highlight, Form         | 저장 → Toast              | 동일, Single-Column   |

---

### 내부 vs. 외부 링크 전략

| 링크 유형 | 대상                          | 구현                     | 이유             |
| ----- | --------------------------- | ---------------------- | -------------- |
| 내부    | `/dashboard`, `/settings` 등 | `next/link` (prefetch) | 속도·SEO·히스토리 유지 |
| 외부    | Make.com, Supabase Docs     | `<a target="_blank">`  | 세션 안전, 권한 분리   |
| 모달/Drawer | 상태 기반 UI                    | `useState` + 조건부 렌더링   | URL 변경 없이 UX 제공 |

---

### 검색 & 필터가 페이지 상태에 미치는 영향

1. URL 쿼리 파라미터가 **단일 진리 원천**.
2. `useSearchParams()` 변화→ TanStack Query 키 변경→ Supabase 재호출.
3. **검색 조건** 변경 시 서버 측 `ilike` 필터 실행.
4. 파라미터 초기화(삭제) 시 **EmptyState** 자동 복구.

---

### 상태 관리 패턴

| 상태 유형 | 관리 방식 | 사용 사례 |
| ----- | ----- | ----- |
| **서버 상태** | TanStack Query | 비디오 목록, 검색 결과 |
| **UI 상태** | useState | 모달/Drawer 열림/닫힘 |
| **전역 상태** | Zustand (필요시) | 사용자 설정, 테마 |
| **폼 상태** | React Hook Form | 채널 메타 추가, 설정 |

---

> **접근성(ARIA)**:
>
> * `role="dialog"`(Modal), `aria-expanded`(Sidebar) 속성 적용
> * 키보드 포커스 트랩 & ESC 닫기 전역 핫키
> * 색상 대비 4.5:1 이상, 글래스모피즘 디자인에서도 가독성 유지

> **성능 최적화**:
>
> * 이미지 최적화: Next.js Image 컴포넌트 사용
> * 코드 스플리팅: 동적 import로 모달/Drawer 지연 로딩
> * 캐시 전략: TanStack Query로 서버 상태 캐싱

이상으로 IA 문서를 마칩니다.
