import { supabase } from './supabase'
import { VideoSummary } from './database.types'
import { triggerVideoAddedWebhook } from './webhook'

export interface AddVideoRequest {
  url: string
  videoId: string
}

export interface AddVideoResponse {
  success: boolean
  message?: string
  error?: string
}

/**
 * YouTube URL에서 비디오 ID를 추출하는 함수
 */
export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  
  return null
}

/**
 * 비디오가 이미 존재하는지 확인하는 함수
 */
export async function checkVideoExists(videoId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('video_summary')
      .select('id')
      .eq('video_id', videoId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('비디오 존재 확인 오류:', error)
      return false
    }

    return !!data
  } catch (error) {
    console.error('비디오 존재 확인 실패:', error)
    return false
  }
}

/**
 * 비디오 추가 요청을 처리하는 메인 함수
 * 이제 데이터베이스에 직접 저장하지 않고 Make.com 웹훅만 호출
 */
export async function addVideo(request: AddVideoRequest): Promise<AddVideoResponse> {
  const { url, videoId } = request

  try {
    // 1. 비디오가 이미 존재하는지 확인
    const exists = await checkVideoExists(videoId)
    if (exists) {
      return {
        success: false,
        error: '이미 추가된 영상입니다.'
      }
    }

    // 2. Make.com 웹훅 호출 (데이터베이스 저장은 Make.com에서 처리)
    const webhookSuccess = await triggerVideoAddedWebhook(videoId, url)
    
    if (!webhookSuccess) {
      return {
        success: false,
        error: 'Make.com 웹훅 호출에 실패했습니다. 웹훅 URL을 확인해주세요.'
      }
    }

    return {
      success: true,
      message: 'Make.com으로 요약 요청을 전송했습니다. 처리 완료 시 대시보드에 표시됩니다.'
    }
  } catch (error) {
    console.error('비디오 추가 처리 실패:', error)
    return {
      success: false,
      error: '비디오 추가 중 오류가 발생했습니다.'
    }
  }
}

/**
 * Make.com에서 호출할 비디오 생성 함수
 */
export async function createVideoFromMake(videoData: {
  video_id: string
  title?: string
  summary?: string
  thumbnail_url?: string
  duration_sec?: number
  publish_date?: string
  views?: number
  channel_name?: string
  transcript?: string
  transcript_language?: string
}): Promise<VideoSummary | null> {
  try {
    const { data, error } = await supabase
      .from('video_summary')
      .insert({
        video_id: videoData.video_id,
        title: videoData.title,
        summary: videoData.summary,
        thumbnail_url: videoData.thumbnail_url || `https://img.youtube.com/vi/${videoData.video_id}/maxresdefault.jpg`,
        duration_sec: videoData.duration_sec,
        publish_date: videoData.publish_date,
        views: videoData.views,
        transcript: videoData.transcript,
        transcript_language: videoData.transcript_language || 'ko',
        meta_loaded: true,
        ai_updated: !!videoData.summary,
        stt_processed: !!videoData.transcript,
      })
      .select()
      .single()

    if (error) {
      console.error('Make.com에서 비디오 생성 오류:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Make.com에서 비디오 생성 실패:', error)
    return null
  }
}

/**
 * 비디오 메타데이터를 업데이트하는 함수 (기존 비디오 업데이트용)
 */
export async function updateVideoMetadata(
  videoId: string,
  metadata: {
    title?: string
    duration_sec?: number
    publish_date?: string
    views?: number
    channel_name?: string
    summary?: string
    transcript?: string
  }
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('video_summary')
      .update({
        ...metadata,
        meta_loaded: true,
        ai_updated: !!metadata.summary,
        stt_processed: !!metadata.transcript,
        updated_at: new Date().toISOString(),
      })
      .eq('video_id', videoId)

    if (error) {
      console.error('비디오 메타데이터 업데이트 오류:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('비디오 메타데이터 업데이트 실패:', error)
    return false
  }
} 