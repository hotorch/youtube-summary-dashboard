## 목차

1. 주체(Actor) 정의
2. 사용 시나리오(요약)
3. 상세 Use-Case 시나리오: 주요 단계 & 흐름
4. 대안 흐름‧엣지 케이스
5. 사전·사후 조건
6. 비즈니스 규칙 & 제약
7. 예외 처리 절차
8. UI 고려 사항
9. 데이터 요구사항 & 흐름
10. 보안·프라이버시 고려

---

## 1. 주체(Actor) 정의

| 주체                            | 설명                                    | 권한                  |
| ----------------------------- | ------------------------------------- | ------------------- |
| **Primary User** ("솔로 지식노동자") | 로그인 없이 사용하는 단일 사용자                    | 채널 메타정보 추가·검색·조회    |
| **System**                    | Next.js Web Dashboard (클라이언트 + 서버 액션) | UI 렌더·검증·API 호출     |
| **Summarization Service**     | Make.com 시나리오(Webhook)                | 채널 RSS→비디오 요약 생성   |
| **Storage/Search Backend**    | Supabase(PostgreSQL + 텍스트 검색)         | CRUD, 전문 검색        |

---

## 2. 사용 시나리오(요약)

1. **Add Channel Meta** – 채널 ID 입력→메타정보 요청
2. **View Dashboard** – 모든 비디오 요약 캘린더·리스트 열람
3. **Search & Filter** – 키워드로 결과 좁히기
4. **View Video Detail** – 카드 클릭→Drawer 상세 보기
5. **Manage Settings** – Make.com 웹훅 URL 관리

---

## 3. 상세 Use-Case 시나리오

### 3.1 Add Channel Meta Flow

| #                                                     | 행위자                       | 단계                                                                     |                                         |
| ----------------------------------------------------- | ------------------------- | ---------------------------------------------------------------------- | --------------------------------------- |
| 1                                                     | **User**                  | '비디오 메타 정보 추가' 버튼 클릭 후 모달 열기                                          |                                         |
| 2                                                     | **User**                  | YouTube 채널 ID 입력 (UC로 시작하는 24자리) 또는 클립보드에서 붙여넣기                     |                                         |
| 3                                                     | **System**                | 채널 ID 형식 검증 (`/^UC[\w-]{22}$/`), RSS URL 미리보기 생성                     |                                         |
| 4                                                     | **System**                | Make.com 채널 메타정보 웹훅 호출 (`channel_meta` 타입)                           |                                         |
| 5                                                     | **Summarization Service** | 채널 RSS 피드 처리, 각 비디오별 메타정보 및 요약 생성                                    |                                         |
| 6                                                     | **System**                | 성공 토스트 표시, 모달 닫기, 대시보드 TanStack Query 캐시 무효화                        |                                         |
| **Verification:** 채널의 비디오들이 대시보드에 카드로 표시 |                           |                                                                        |                                         |

---

### 3.2 View Dashboard Flow

1. **User**: `/dashboard` 접속
2. **System**: 
   - `useVideos` 훅으로 비디오 목록 조회
   - `SELECT * FROM video_summary JOIN channel ON channel_id LEFT JOIN video_tag ON video_summary_id`
   - 발행일 기준 내림차순 정렬
3. **System**: 기본 캘린더 뷰 렌더, `view=list` 시 리스트 뷰로 전환
4. **Verification:** 카드 수 == DB 행 수, 로딩 ≤ 200ms

---

### 3.3 Search & Filter Flow

1. **User**: 상단 검색창에 키워드 입력
2. **System**:
   - URL 쿼리 파라미터 `?query=키워드` 업데이트
   - `WHERE title ILIKE '%키워드%' OR summary ILIKE '%키워드%'` 필터 적용
   - TanStack Query 캐시 키 변경으로 자동 재조회
3. **System**: 필터 결과 ≤ 200ms 내 재렌더
4. **Verification:** 결과 카드가 검색 조건과 일치, 검색 결과 개수 표시

---

### 3.4 View Video Detail Flow

1. **User**: 비디오 요약 카드 클릭
2. **System**: 
   - 선택된 비디오 상태 설정
   - VideoDetailDrawer 컴포넌트 열기 (slide-in 애니메이션)
3. **System**: 
   - 전체 요약 텍스트 표시
   - 메타데이터 (채널명, 조회수, 재생시간, 발행일) 표시
   - 처리 상태 배지 (AI 요약 완료, STT 처리 완료 등)
   - 'YouTube에서 열기' 링크 제공
4. **Verification:** Drawer 내부 데이터가 선택 카드와 동일, ESC/X 버튼으로 닫힘

---

### 3.5 Manage Settings Flow

1. **User**: 사이드바에서 'Settings' 클릭
2. **System**: 설정 페이지 렌더, 기존 웹훅 URL들 로드
3. **User**: 
   - 비디오 요약용 웹훅 URL 입력/수정
   - 채널 메타정보용 웹훅 URL 입력/수정
4. **System**: URL 형식 검증, Supabase `settings` 테이블에 저장
5. **Verification:** 저장 성공 토스트 표시, 설정 값 유지

---

## 4. 대안 흐름‧엣지 케이스

| 조건(Condition)         | 시스템 Action                          | 사용자 피드백                  |
| --------------------- | ----------------------------------- | ------------------------ |
| 잘못된 채널 ID 형식         | 폼 유효성 검사 오류 표시                      | "올바른 유튜브 채널 ID를 입력하세요" |
| 웹훅 URL 형식 오류         | URL 생성자 검증 실패                       | "올바른 URL 형식이 아닙니다"     |
| Make.com 웹훅 30s 초과   | 로딩 상태 유지, 백그라운드 처리                  | "처리 중입니다. 잠시 후 확인해주세요" |
| Supabase 연결 실패       | 오류 배너 표시, 재시도 버튼 활성화               | "연결 실패 - 다시 시도해주세요"    |
| 검색 결과 0건            | `<EmptyState/>` 컴포넌트 표시             | "검색 결과가 없습니다"          |
| 비디오 처리 상태 미완료      | 처리 중 배지 표시, 30초마다 자동 새로고침           | "처리 중" 상태 배지 표시        |

---

## 5. 사전·사후 조건

| 항목   | 사전(Pre)       | 사후(Post)                |
| ---- | ------------- | ----------------------- |
| 네트워크 | HTTPS 연결 가능   | 요청 완료 또는 오프라인 대체        |
| 데이터  | 채널 ID 유효성 확인 | `channel`, `video_summary` 레코드 신설 |
| 웹훅   | Make.com URL 설정 | 웹훅 호출 성공 또는 재시도 큐 등록   |

---

## 6. 비즈니스 규칙 & 제약

* YouTube 채널 ID만 허용, UC로 시작하는 24자리 형식
* 요약 최대 10,000자, 초과 시 '…'로 절삭
* 모든 트래픽 HTTPS, 로그인 없는 단일 사용자 환경
* 웹훅 URL 분리: 비디오 요약용, 채널 메타정보용
* 비디오 중복 방지: `video_id` UNIQUE 제약

---

## 7. 예외 처리 절차

| 오류 유형                     | 탐지 방법              | 복구/대응                   |
| ------------------------- | ------------------ | ----------------------- |
| 4xx 채널 ID 검증 실패           | Zod 스키마 검증        | 폼 오류 메시지 표시             |
| 504 Make.com Webhook Timeout | Fetch timeout 30s | 백그라운드 처리 안내, 자동 새로고침   |
| 5xx Supabase 연결 실패         | try/catch 블록      | 오류 배너 표시, 재시도 버튼 제공    |
| 클립보드 접근 실패              | navigator.clipboard | 수동 입력 안내 메시지           |

---

## 8. UI 고려 사항

* **ARIA**: `role="dialog"` (모달), `aria-live="polite"` (토스트)
* **키보드 지원**: Tab 순서, ESC Drawer/모달 닫기, Enter 폼 제출
* **응답 속도**: 주요 액션 ≤ 200ms (검색), ≤ 30s (웹훅)
* **토스트**: 성공/실패 상태 명시, 자동 소멸
* **글래스모피즘**: 반투명 배경, 블러 효과, 높은 대비율 유지
* **반응형**: 모바일에서 모달→전체화면, Drawer→하단 시트

---

## 9. 데이터 요구사항 & 흐름

```
User → System(채널 ID 검증) → Make.com(채널 메타 웹훅) → System(비디오 생성) → Supabase(INSERT)
Supabase → System(SELECT/검색) → UI 카드 렌더링
```

* 텍스트 검색: `title ILIKE '%query%' OR summary ILIKE '%query%'`
* 상태 관리: TanStack Query (서버 상태) + useState (UI 상태)
* 캐시 전략: 5분 stale time, 10분 garbage collection time

---

## 10. 보안·프라이버시 고려

* **데이터 접근**: 로그인 없는 단일 사용자 환경, 모든 데이터 공개
* **웹훅 보안**: Make.com 시나리오 내 비밀키 검증 (선택적)
* **XSS 방지**: 요약 텍스트 자동 이스케이프 (React 기본 제공)
* **HTTPS**: 모든 외부 통신 암호화
* **API 키**: 환경변수로 관리, 클라이언트 노출 최소화
* **로그 보안**: 민감 정보 (웹훅 URL, API 키) 콘솔 출력 금지

---

## 11. 성능 고려사항

* **이미지 최적화**: Next.js Image 컴포넌트, WebP 형식 우선
* **코드 스플리팅**: 모달/Drawer 동적 import
* **캐시 전략**: 
  - TanStack Query로 서버 상태 캐싱
  - 브라우저 캐시 활용 (썸네일 이미지)
* **검색 최적화**: 디바운스 적용, 빈 검색어 시 전체 목록 표시
* **자동 새로고침**: 30초 간격으로 비디오 목록 갱신

이로써 요구된 세부 Use-Case 문서를 완료합니다.
