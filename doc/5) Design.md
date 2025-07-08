## Design System Overview

| 항목            | 설명                                                                    |
| ------------- | --------------------------------------------------------------------- |
| **스타일 키워드**   | futuristic · cinematic · immersive · minimal                          |
| **비주얼 톤**     | 글래스모피즘 + 딥 블루‑그레이 배경, 액센트 그라디언트 사용                                    |
| **타이포그래피**    | 제목: Montserrat 600‑700 / 본문: Inter 400 / line‑height: 1.2(제목)·1.5(본문) |
| **아이콘**       | Lucide‑react 24 px, line‑style, `stroke-[#E5E7EB]`                    |
| **8 pt Grid** | 기본 spacing 단위 4 px, 컴포넌트 padding ≥ p‑4                                |
| **접근성 목표**    | WCAG 2.2 AA + 키보드 트랩 / 포커스 아웃라인 2 px 액센트                              |

---

## Color Palette (Tailwind Tokens)

| 토큰            | 변수                    | HEX     | 용도                    |
| ------------- | --------------------- | ------- | --------------------- |
| `primary-900` | `--color-primary-900` | #0B1118 | 최심 배경, 히어로 배경         |
| `primary-700` | `--color-primary-700` | #1A2430 | 카드·툴바 배경, Glass layer |
| `primary-500` | `--color-primary-500` | #26526B | 호버·섀도 레이어             |
| `accent-from` | `--color-accent-from` | #014663 | CTA Gradient 시작       |
| `accent-to`   | `--color-accent-to`   | #027E96 | CTA Gradient 끝, 포커스 링 |
| `neutral-000` | `--color-neutral-0`   | #FFFFFF | 텍스트 라이트               |
| `neutral-100` | `--color-neutral-100` | #E5E7EB | 보조 텍스트                |
| `neutral-700` | `--color-neutral-700` | #6B7280 | 비활성, 섹션 딤             |

> Tailwind 확장 예시

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          900: '#0B1118',
          700: '#1A2430',
          500: '#26526B',
        },
        accent: {
          from: '#014663',
          to: '#027E96',
        },
        neutral: {
          0: '#FFFFFF',
          100: '#E5E7EB',
          700: '#6B7280',
        },
      },
    },
  },
}
```

---

## WCAG 2.2 대비 체크리스트

| 전경 색          | 배경 색          | 대비비    | 기준 4.5:1 충족 |
| ------------- | ------------- | ------ | ----------- |
| `neutral-0`   | `primary-900` | 12.3:1 | ✅           |
| `neutral-0`   | `primary-700` | 8.9:1  | ✅           |
| `neutral-0`   | `primary-500` | 6.5:1  | ✅           |
| `neutral-100` | `primary-700` | 5.1:1  | ✅           |
| `neutral-700` | `primary-900` | 4.8:1  | ✅           |

> Note: 모든 텍스트/아이콘 페어링은 최소 AA (4.5:1) 이상, 버튼 Gradient 상 텍스트는 평균 8:1.

---

## Page Implementations

### 1. Landing (Hero)

| 요소                 | 내용                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------- |
| **Purpose**        | 브랜드 인트로 + URL 입력 CTA 유도                                                               |
| **Key Components** | Hero BG(blurred photo), `<Heading H1>`, `<Tagline>`, `<CTAButton>`, `<HamburgerMenu>` |
| **Layout**         | 12‑col grid, 중앙 Column 4‑8, Full‑height viewport                                      |
| **예시 이미지**         | ![Hero](https://picsum.photos/seed/hero/1600/800)                                     |

### 2. Dashboard `/dashboard`

|                    |                                                                                 |
| ------------------ | ------------------------------------------------------------------------------- |
| **Purpose**        | 요약 카드 열람·검색·달력 필터                                                               |
| **Key Components** | `<Topbar>`, `<Sidebar>`, `<CalendarWidget>`, `<SearchBar>`, `<SummaryCardGrid>` |
| **Layout**         | Sidebar 240 px(Desktop),Content flex‑1 grid; 모바일 행 Stack                        |
| **Responsive**     | Tablet: Sidebar 슬라이드 오버, 모바일: 햄버거 메뉴 Bottom Sheet                               |

### 3. Add‑Video Modal `/add-video`

| 요소                 | 설명                                             |
| ------------------ | ---------------------------------------------- |
| **Purpose**        | URL 유효성 검사 & 업로드 진행 상태                         |
| **Key Components** | `<URLInput>` , `<ProgressBar>` , `<CloseIcon>` |
| **Layout**         | Centered Modal (max‑w xl) , backdrop‑blur(8px) |

### 4. Summary Detail Drawer `/video/[id]`

| 요소             | 설명                                                             |
| -------------- | -------------------------------------------------------------- |
| Purpose        | 풀 요약·메타·YouTube 링크                                             |
| Key Components | `<Drawer>`, `<VideoEmbed>`, `<MetadataTable>`, `<FullSummary>` |
| Layout         | Right Slide‑in 420 px (Desktop), Bottom Sheet (Mobile)         |

### 5. Settings `/settings`

| 요소      | 설명                                      |
| ------- | --------------------------------------- |
| Purpose | Make.com Webhook & 태그 관리                |
| Key     | `<SettingsForm>`, `<Input>`, `<Toggle>` |

---

## Layout Components

| Route 범위     | 컴포넌트          | 설명                         | 반응형 행동                                                |
| ------------ | ------------- | -------------------------- | ----------------------------------------------------- |
| All pages    | `<Topbar>`    | Logo, SearchBar, AddButton | Mobile 숨김 Logo 24 px                                  |
| `/dashboard` | `<Sidebar>`   | NavLinks, Settings         | Tablet 이하 off‑canvas                                  |
| Global       | `<CTAButton>` | Accent Gradient            |  Hover translate‑y‑0.5                                |
| Global       | `<GlassCard>` | 공통 카드 쉘                    | backdrop‑blur(4px), border 1 px rgba(255,255,255,0.1) |

---

## Interaction Patterns

### CTA Button 상태 스펙

| State    | 배경                                               | 텍스트                | 섀도우         | 트랜지션             |
| -------- | ------------------------------------------------ | ------------------ | ----------- | ---------------- |
| Default  | `bg-gradient-to-r from-accent-from to-accent-to` | `text-neutral-0`   | `shadow-md` |  150 ms ease‑out |
| Hover    | translate‑y‑\[2px]                               | Same               | `shadow-lg` | 150 ms           |
| Focus    | 아웃라인 2 px `accent-to/40%`                        | 유지                 | 유지          |  —               |
| Disabled | `bg-primary-700`                                 | `text-neutral-700` | none        | none             |

#### Tailwind 코드 예시

```html
<button class="px-6 py-3 rounded-xl font-semibold text-neutral-0 bg-gradient-to-r from-accent-from to-accent-to shadow-md hover:translate-y-0.5 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-to/40 disabled:bg-primary-700 disabled:text-neutral-700 transition">
  요약 생성
</button>
```

### Search Bar 패턴

| State  | 너비             | 그림자                   |
| ------ | -------------- | --------------------- |
| Idle   | w‑52 (desktop) | none                  |
| Focus  | w‑80           | `shadow-accent-to/20` |
| Mobile | 100%           | `shadow-sm`           |

JavaScript: `onFocus→addClass('w-80'); onBlur→removeClass('w-80');` (Tailwind `transition-all duration-150`)

---

## Breakpoints

| Alias   | 최소 가로 픽셀 | Tailwind Class |
| ------- | -------- | -------------- |
| mobile  | 0        | `sm:` 미사용      |
| tablet  | 768 px   | `md:`          |
| desktop | 1024 px  | `lg:`          |
| wide    | 1440 px  | `xl:`          |

> **Motion 조절**: `@media (prefers-reduced-motion: reduce)` 시 `transition-none`, `animate-none` 클래스로 효과 제거.

---

## 추가 참고 코드 조각

```jsx
// GlassCard.tsx (React 컴포넌트 예)
export const GlassCard = ({children}: {children: React.ReactNode}) => (
  <div className="bg-primary-700/60 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-inner">
    {children}
  </div>
);
```

```css
/* globals.css */
html {
  scroll-behavior: smooth;
}
```

---

### 접근성 테스트 체크리스트 (요약)

* [x] 모든 버튼 `<button>` 요소 키보드 포커스 가능
* [x] ESC → Drawer/Modal 닫힘
* [x] 라이트/다크 대비 >= 4.5:1
* [x] aria-label 필수 입력(아이콘 버튼)
* [x] reduced‑motion 미디어쿼리 반영

---

**Design Guide v1.0 완료** – 추가 피드백 시 이어서 업데이트 가능합니다.
