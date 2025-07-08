import { supabase } from './supabase'
import { Settings } from './database.types'

/**
 * 웹훅 타입 정의
 */
export type WebhookType = 'video_summary' | 'channel_meta' | 'default'

/**
 * 웹훅 타입별 설정 키 매핑
 */
const WEBHOOK_KEYS: Record<WebhookType, string> = {
  video_summary: 'make_webhook_url_video_summary',
  channel_meta: 'make_webhook_url_channel_meta', 
  default: 'make_webhook_url'
}

/**
 * 설정 값을 가져오는 함수
 */
export async function getSetting(key: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', key)
      .single()

    if (error) {
      console.error('설정 조회 오류:', error)
      return null
    }

    return data?.value || null
  } catch (error) {
    console.error('설정 조회 실패:', error)
    return null
  }
}

/**
 * 설정 값을 저장하는 함수
 */
export async function setSetting(key: string, value: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('settings')
      .upsert(
        { key, value, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      )

    if (error) {
      console.error('설정 저장 오류:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('설정 저장 실패:', error)
    return false
  }
}

/**
 * 웹훅 타입별 URL 가져오기
 */
export async function getWebhookUrl(type: WebhookType = 'default'): Promise<string> {
  const key = WEBHOOK_KEYS[type]
  const url = await getSetting(key)
  
  // 특정 타입의 웹훅 URL이 없으면 기본 웹훅 URL을 사용
  if (!url && type !== 'default') {
    return await getSetting(WEBHOOK_KEYS.default) || ''
  }
  
  return url || ''
}

/**
 * 웹훅 타입별 URL 저장하기
 */
export async function setWebhookUrl(type: WebhookType, url: string): Promise<boolean> {
  const key = WEBHOOK_KEYS[type]
  return await setSetting(key, url)
}

/**
 * Make.com 웹훅 URL 가져오기 (기존 함수 - 호환성 유지)
 */
export async function getMakeWebhookUrl(): Promise<string> {
  return await getWebhookUrl('default')
}

/**
 * Make.com 웹훅 URL 저장하기 (기존 함수 - 호환성 유지)
 */
export async function setMakeWebhookUrl(url: string): Promise<boolean> {
  return await setWebhookUrl('default', url)
}

/**
 * 모든 설정 가져오기
 */
export async function getAllSettings(): Promise<Settings[]> {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .order('key')

    if (error) {
      console.error('전체 설정 조회 오류:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('전체 설정 조회 실패:', error)
    return []
  }
}

/**
 * 모든 웹훅 URL 가져오기
 */
export async function getAllWebhookUrls(): Promise<Record<WebhookType, string>> {
  const urls: Record<WebhookType, string> = {
    default: '',
    video_summary: '',
    channel_meta: ''
  }
  
  for (const type of Object.keys(WEBHOOK_KEYS) as WebhookType[]) {
    urls[type] = await getWebhookUrl(type)
  }
  
  return urls
} 