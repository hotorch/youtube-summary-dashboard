import { NextRequest, NextResponse } from 'next/server'
import { createVideoFromMake } from '@/lib/videos'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Make.com에서 보내는 필수 필드 검증
    if (!body.video_id) {
      return NextResponse.json(
        { error: 'video_id is required' },
        { status: 400 }
      )
    }

    // 비디오 생성
    const video = await createVideoFromMake({
      video_id: body.video_id,
      title: body.title,
      summary: body.summary,
      thumbnail_url: body.thumbnail_url,
      duration_sec: body.duration_sec ? parseInt(body.duration_sec) : undefined,
      publish_date: body.publish_date,
      views: body.views ? parseInt(body.views) : undefined,
      channel_name: body.channel_name,
      transcript: body.transcript,
      transcript_language: body.transcript_language || 'ko',
    })

    if (!video) {
      return NextResponse.json(
        { error: 'Failed to create video' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      video: video
    })

  } catch (error) {
    console.error('비디오 생성 API 오류:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 