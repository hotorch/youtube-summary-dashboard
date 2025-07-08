## 1. 엔터티 정의

```mermaid
erDiagram
    channel ||--o{ video_summary : "1:N"
    video_summary ||--o{ pending_job : "1:N"
    video_summary ||--o{ video_tag   : "1:N"
    tag           ||--o{ video_tag   : "1:N"

    channel {
        UUID id PK
        TEXT channel_id "UNIQUE"
        TEXT channel_name
        TEXT category
        TEXT primary_language
        TEXT notes
        TEXT rss_url
        BOOLEAN is_on
        TIMESTAMPTZ created_at
    }

    video_summary {
        UUID id PK
        UUID channel_id FK
        TEXT video_id "UNIQUE"
        TEXT title
        TEXT thumbnail_url
        INT  duration_sec
        TIMESTAMPTZ publish_date
        INT  views
        INT  star_rating
        BOOLEAN meta_loaded
        BOOLEAN ai_updated
        BOOLEAN stt_processed
        TEXT summary "≤10000자"
        TEXT transcript "STT 전체 텍스트"
        TEXT transcript_language "DEFAULT 'ko'"
        TSVECTOR search_vector
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    pending_job {
        UUID id PK
        TEXT video_id
        TEXT status
        INT  retry_count
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    tag {
        UUID id PK
        TEXT name UNIQUE
        TIMESTAMPTZ created_at
    }

    video_tag {
        UUID video_summary_id FK
        UUID tag_id FK
        PRIMARY_KEY(video_summary_id, tag_id)
    }

    settings {
        SERIAL id PK
        TEXT key UNIQUE
        TEXT value
        TEXT description
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }
```

> **Note:** 로그인 없는 단일 사용자 환경으로 설계되어 `user` 테이블과 `user_id` 컬럼이 없습니다. `settings` 테이블이 추가되어 Make.com 웹훅 URL 등을 관리합니다.

---

## 2. 테이블 스펙 요약

| 테이블             | 핵심 특징                                           | 주요 컬럼                                                |
| --------------- | ----------------------------------------------- | ---------------------------------------------------- |
| `channel`       | 채널 메타정보 저장, RSS URL 포함                          | `channel_id` (UNIQUE), `channel_name`, `rss_url`    |
| `video_summary` | 비디오 요약 및 메타데이터 저장<br>STT 및 AI 처리 상태 추적         | `video_id` (UNIQUE), `summary`, `transcript`, 상태 플래그들 |
| `pending_job`   | 웹훅 처리 상태 추적                                     | `video_id`, `status`, `retry_count`                  |
| `tag`           | 비디오 태그 관리                                       | `name` (UNIQUE)                                      |
| `video_tag`     | 비디오-태그 다대다 관계 테이블                              | `video_summary_id`, `tag_id` (복합 PK)                |
| `settings`      | 애플리케이션 설정 저장 (웹훅 URL 등)                        | `key` (UNIQUE), `value`, `description`               |

---

## 3. 실제 구현된 테이블 구조

### 3.1 channel 테이블
```sql
CREATE TABLE channel (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id TEXT UNIQUE NOT NULL,
    channel_name TEXT,
    category TEXT,
    primary_language TEXT,
    notes TEXT,
    rss_url TEXT,
    is_on BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

### 3.2 video_summary 테이블
```sql
CREATE TABLE video_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID REFERENCES channel(id),
    video_id TEXT UNIQUE NOT NULL,
    title TEXT,
    thumbnail_url TEXT,
    duration_sec INTEGER,
    publish_date TIMESTAMPTZ,
    views INTEGER,
    star_rating INTEGER,
    meta_loaded BOOLEAN DEFAULT false,
    ai_updated BOOLEAN DEFAULT false,
    stt_processed BOOLEAN DEFAULT false,
    summary TEXT,
    transcript TEXT,
    transcript_language TEXT DEFAULT 'ko',
    search_vector TSVECTOR,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

### 3.3 settings 테이블
```sql
CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) NOT NULL UNIQUE,
    value TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

### 3.4 tag 테이블
```sql
CREATE TABLE tag (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

### 3.5 video_tag 테이블
```sql
CREATE TABLE video_tag (
    video_summary_id UUID REFERENCES video_summary(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tag(id) ON DELETE CASCADE,
    PRIMARY KEY (video_summary_id, tag_id)
);
```

### 3.6 pending_job 테이블
```sql
CREATE TABLE pending_job (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id TEXT NOT NULL,
    status TEXT NOT NULL,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4. 인덱스 전략

| 인덱스                                      | 목적              | 구현 상태 |
| ---------------------------------------- | --------------- | ----- |
| `video_summary_video_id_key` (`video_id`) UNIQUE | 중복 입력 방지        | ✅ 구현됨 |
| `idx_video_pubdate` (`publish_date`)     | 달력 정렬           | ✅ 구현됨 |
| `idx_video_search` (`search_vector`) GIN | 키워드 검색 ≤ 200ms | ✅ 구현됨 |
| `idx_video_transcript_search` (`transcript`) GIN | STT 전문 검색 ≤ 200ms | ✅ 구현됨 |
| `idx_video_stt_processed` (`stt_processed`) | STT 처리 상태 조회 | ✅ 구현됨 |
| `idx_video_ai_updated` (`ai_updated`)    | AI 처리 상태 조회    | ✅ 구현됨 |
| `idx_video_meta_loaded` (`meta_loaded`)  | 메타 로드 상태 조회    | ✅ 구현됨 |
| `idx_video_channel` (`channel_id`)       | 채널별 비디오 조회     | ✅ 구현됨 |
| `idx_video_updated_at` (`updated_at`)    | 최근 업데이트 정렬     | ✅ 구현됨 |
| `tag_name_key` (`name`) UNIQUE           | 태그 중복 방지        | ✅ 구현됨 |
| `settings_key_key` (`key`) UNIQUE        | 설정 키 중복 방지      | ✅ 구현됨 |
| `idx_pending_job_status` (`status`)      | 펜딩 잡 상태 조회     | ✅ 구현됨 |

---

## 5. 외래키 관계

| 부모 테이블        | 자식 테이블        | 외래키 컬럼           | 관계 타입 | 삭제 정책    |
| ------------- | ------------- | ---------------- | ----- | -------- |
| `channel`     | `video_summary` | `channel_id`     | 1:N   | CASCADE  |
| `video_summary` | `video_tag`   | `video_summary_id` | 1:N   | CASCADE  |
| `tag`         | `video_tag`   | `tag_id`         | 1:N   | CASCADE  |

---

## 6. 데이터 타입 및 제약사항

### 6.1 비즈니스 규칙 제약
```sql
-- 요약 텍스트 길이 제한
ALTER TABLE video_summary ADD CONSTRAINT chk_summary_length 
CHECK (length(summary) <= 10000);

-- 채널 ID 형식 검증 (UC로 시작하는 24자리)
ALTER TABLE channel ADD CONSTRAINT chk_channel_id_format 
CHECK (channel_id ~ '^UC[A-Za-z0-9_-]{22}$');

-- 별점 범위 제한
ALTER TABLE video_summary ADD CONSTRAINT chk_star_rating 
CHECK (star_rating >= 1 AND star_rating <= 5);
```

### 6.2 트리거 및 함수
```sql
-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 각 테이블에 트리거 적용
CREATE TRIGGER update_video_summary_updated_at
    BEFORE UPDATE ON video_summary
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pending_job_updated_at
    BEFORE UPDATE ON pending_job
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---

## 7. 초기 데이터 및 설정

### 7.1 기본 설정 데이터
```sql
-- 웹훅 URL 설정
INSERT INTO settings (key, value, description) VALUES 
('make_webhook_url_video_summary', 'https://hook.eu2.make.com/1vmq85bvseml9jehaf48caw25pojxeo3', '비디오 요약 생성용 Make.com 웹훅 URL'),
('make_webhook_url_channel_meta', 'https://hook.eu2.make.com/rl20ksysotuxl2x8yijcsch0bh7i6los', '채널 메타정보 요청용 Make.com 웹훅 URL'),
('make_webhook_url', '', '기본 웹훅 URL (호환성 유지)');
```

---

## 8. 마이그레이션 파일 순서

1. `20250708_001_create_channel.sql`
2. `20250708_002_create_video_summary.sql`
3. `20250708_003_create_settings.sql` ✅ 구현됨
4. `20250708_004_create_tag.sql`
5. `20250708_005_create_video_tag.sql`
6. `20250708_006_create_pending_job.sql`
7. `20250708_007_add_indexes.sql`
8. `20250708_008_add_constraints.sql`
9. `20250708_009_add_triggers.sql`
10. `20250708_010_insert_default_settings.sql`

---

## 9. TypeScript 타입 정의

실제 구현된 TypeScript 타입들:

```typescript
// Helper types for easier usage
export type VideoSummary = Tables<'video_summary'>
export type Channel = Tables<'channel'>
export type Tag = Tables<'tag'>
export type VideoTag = Tables<'video_tag'>
export type PendingJob = Tables<'pending_job'>
export type Settings = Tables<'settings'>

export type VideoSummaryWithChannel = VideoSummary & {
  channel: Channel | null
}

export type VideoSummaryWithTags = VideoSummary & {
  channel: Channel | null
  tags: Tag[]
}
```

---

## 10. 쿼리 성능 최적화

### 10.1 주요 쿼리 패턴
```sql
-- 대시보드 비디오 목록 조회 (JOIN 최적화)
SELECT vs.*, c.channel_name, c.category,
       ARRAY_AGG(t.name) as tag_names
FROM video_summary vs
LEFT JOIN channel c ON vs.channel_id = c.id
LEFT JOIN video_tag vt ON vs.id = vt.video_summary_id
LEFT JOIN tag t ON vt.tag_id = t.id
GROUP BY vs.id, c.channel_name, c.category
ORDER BY vs.publish_date DESC;

-- 검색 쿼리 (ILIKE 사용)
SELECT * FROM video_summary 
WHERE title ILIKE '%검색어%' OR summary ILIKE '%검색어%'
ORDER BY publish_date DESC;
```

### 10.2 캐시 전략
- TanStack Query: 5분 stale time, 10분 garbage collection
- 브라우저 캐시: 썸네일 이미지 1시간 캐시
- Supabase 연결 풀링: 기본 설정 사용

---

이렇게 수정된 ERD는 **로그인 없는 단일 사용자 환경**에서 YouTube 채널 메타정보를 기반으로 비디오 요약을 관리하는 실제 구현된 시스템을 정확히 반영합니다.
