import { getMakeWebhookUrl, getWebhookUrl, WebhookType } from './settings'

export interface WebhookPayload {
  event: 'video_added' | 'video_summarized' | 'video_updated' | 'channel_meta_requested'
  video_id?: string
  video_url?: string
  channel_id?: string
  rss_url?: string
  title?: string
  summary?: string
  thumbnail_url?: string
  duration_sec?: number
  publish_date?: string
  channel_name?: string
}

/**
 * Make.com 웹훅을 호출하는 함수
 */
export async function triggerWebhook(
  payload: WebhookPayload, 
  webhookType: WebhookType = 'default'
): Promise<boolean> {
  try {
    let webhookUrl = await getWebhookUrl(webhookType)
    
    // 특정 타입의 웹훅 URL이 없으면 기본 웹훅 URL 사용
    if (!webhookUrl && webhookType !== 'default') {
      console.warn(`${webhookType} 웹훅 URL이 설정되지 않았습니다. 기본 웹훅 URL을 시도합니다.`)
      webhookUrl = await getWebhookUrl('default')
    }
    
    if (!webhookUrl) {
      console.warn(`웹훅 URL이 설정되지 않았습니다. (타입: ${webhookType})`)
      return false
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        timestamp: new Date().toISOString(),
        source: 'youtube-summary-dashboard',
        webhook_type: webhookType
      }),
    })

    if (!response.ok) {
      console.error('웹훅 호출 실패:', response.status, response.statusText)
      return false
    }

    console.log('웹훅 호출 성공:', payload.event, payload.video_id || payload.channel_id, '-> URL:', webhookUrl)
    return true
  } catch (error) {
    console.error('웹훅 호출 중 오류:', error)
    return false
  }
}

/**
 * 비디오 추가 시 웹훅 호출
 */
export async function triggerVideoAddedWebhook(videoId: string, videoUrl: string): Promise<boolean> {
  return await triggerWebhook({
    event: 'video_added',
    video_id: videoId,
    video_url: videoUrl,
    thumbnail_url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
  }, 'video_summary')
}

/**
 * 비디오 요약 완료 시 웹훅 호출
 */
export async function triggerVideoSummarizedWebhook(video: {
  video_id: string
  title?: string
  summary?: string
  thumbnail_url?: string
  duration_sec?: number
  publish_date?: string
  channel_name?: string
}): Promise<boolean> {
  return await triggerWebhook({
    event: 'video_summarized',
    video_id: video.video_id,
    title: video.title,
    summary: video.summary,
    thumbnail_url: video.thumbnail_url,
    duration_sec: video.duration_sec,
    publish_date: video.publish_date,
    channel_name: video.channel_name,
  }, 'video_summary')
}

/**
 * 채널 메타 정보 요청 웹훅 호출
 */
export async function triggerChannelMetaWebhook(channelId: string): Promise<boolean> {
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
  
  return await triggerWebhook({
    event: 'channel_meta_requested',
    channel_id: channelId,
    rss_url: rssUrl,
  }, 'channel_meta')
} 