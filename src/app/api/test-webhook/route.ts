import { NextRequest, NextResponse } from 'next/server'
import { triggerVideoAddedWebhook } from '@/lib/webhook'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { videoId, videoUrl } = body

    if (!videoId || !videoUrl) {
      return NextResponse.json(
        { error: 'videoId와 videoUrl이 필요합니다.' },
        { status: 400 }
      )
    }

    console.log('웹훅 테스트 시작:', { videoId, videoUrl })

    // 웹훅 호출
    const success = await triggerVideoAddedWebhook(videoId, videoUrl)

    return NextResponse.json({
      success,
      message: success ? '웹훅이 성공적으로 전송되었습니다.' : '웹훅 전송에 실패했습니다.',
      videoId,
      videoUrl,
    })
  } catch (error) {
    console.error('웹훅 테스트 API 오류:', error)
    return NextResponse.json(
      { error: '웹훅 테스트 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
} 