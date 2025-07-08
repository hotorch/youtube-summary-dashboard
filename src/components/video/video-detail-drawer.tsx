'use client'

import { useState } from 'react'
import { VideoSummaryWithTags } from '@/lib/database.types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { 
  Eye, 
  Clock, 
  Calendar, 
  Star, 
  ExternalLink, 
  Play,
  FileText,
  MessageSquare,
  Loader2,
  Sparkles
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import Image from 'next/image'
import { useToast } from '@/hooks/use-toast'
import { triggerVideoAddedWebhook } from '@/lib/webhook'

interface VideoDetailDrawerProps {
  video: VideoSummaryWithTags | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VideoDetailDrawer({ video, open, onOpenChange }: VideoDetailDrawerProps) {
  const [isSummaryLoading, setIsSummaryLoading] = useState(false)
  const { toast } = useToast()

  if (!video) return null

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    if (hours > 0) {
      return `${hours}시간 ${minutes}분 ${remainingSeconds}초`
    }
    return `${minutes}분 ${remainingSeconds}초`
  }

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`
    }
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`
    }
    return views.toLocaleString()
  }

  const getYouTubeUrl = () => {
    return `https://www.youtube.com/watch?v=${video.video_id}`
  }

  const handleRequestSummary = async () => {
    setIsSummaryLoading(true)
    
    try {
      const success = await triggerVideoAddedWebhook(video.video_id, getYouTubeUrl())
      
      if (success) {
        toast({
          title: '비디오 요약 요청 완료',
          description: 'Make.com으로 요약 요청을 전송했습니다. 처리 완료 시 업데이트됩니다.',
        })
      } else {
        toast({
          title: '오류',
          description: 'Make.com 웹훅 호출에 실패했습니다. 웹훅 URL을 확인해주세요.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error requesting video summary:', error)
      toast({
        title: '오류',
        description: '비디오 요약 요청 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setIsSummaryLoading(false)
    }
  }

  const handleCopySummary = async () => {
    if (video.summary) {
      try {
        await navigator.clipboard.writeText(video.summary)
        toast({
          title: '복사 완료',
          description: '요약이 클립보드에 복사되었습니다.',
        })
      } catch (error) {
        console.error('Failed to copy summary:', error)
        toast({
          title: '복사 실패',
          description: '요약 복사에 실패했습니다.',
          variant: 'destructive',
        })
      }
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[600px] bg-primary-900 border-l border-white/10">
        <div className="flex flex-col h-full">
          <SheetHeader className="space-y-3 pb-6 border-b border-white/10">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <SheetTitle className="text-neutral-0 text-lg leading-tight">
                  {video.title}
                </SheetTitle>
                {video.channel && (
                  <SheetDescription className="text-neutral-100 mt-2">
                    {video.channel.channel_name}
                  </SheetDescription>
                )}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(getYouTubeUrl(), '_blank')}
                className="ml-4 text-neutral-100 border-neutral-100 hover:bg-primary-500"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                YouTube에서 보기
              </Button>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto space-y-6 py-6">
            {/* 썸네일 */}
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <Image
                src={video.thumbnail_url || 'https://picsum.photos/seed/default/640/360'}
                alt={video.title || ''}
                fill
                className="object-cover"
              />
              
              {/* 재생 오버레이 */}
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center group hover:bg-black/40 transition-colors">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => window.open(getYouTubeUrl(), '_blank')}
                  className="text-white hover:text-accent-to group-hover:scale-110 transition-transform"
                >
                  <Play className="h-12 w-12" />
                </Button>
              </div>
            </div>

            {/* 메타데이터 */}
            <GlassCard className="space-y-4">
              <h3 className="font-semibold text-neutral-0 flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                영상 정보
              </h3>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                {video.duration_sec && (
                  <div className="flex items-center space-x-2 text-neutral-100">
                    <Clock className="h-4 w-4" />
                    <span>{formatDuration(video.duration_sec)}</span>
                  </div>
                )}
                
                {video.views && (
                  <div className="flex items-center space-x-2 text-neutral-100">
                    <Eye className="h-4 w-4" />
                    <span>{formatViews(video.views)} 조회수</span>
                  </div>
                )}
                
                {video.publish_date && (
                  <div className="flex items-center space-x-2 text-neutral-100">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {formatDistanceToNow(new Date(video.publish_date), { 
                        addSuffix: true, 
                        locale: ko 
                      })}
                    </span>
                  </div>
                )}
                
                {video.star_rating && (
                  <div className="flex items-center space-x-2 text-neutral-100">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{video.star_rating}/5</span>
                  </div>
                )}
              </div>

              {/* 처리 상태 */}
              <div className="flex flex-wrap gap-2">
                {video.ai_updated && (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    요약 완료
                  </Badge>
                )}
                
                {video.stt_processed && (
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                    STT 완료
                  </Badge>
                )}
                
                {!video.ai_updated && (
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                    처리 중
                  </Badge>
                )}
              </div>
            </GlassCard>

            {/* 태그 */}
            {video.tags && video.tags.length > 0 && (
              <GlassCard className="space-y-3">
                <h3 className="font-semibold text-neutral-0">태그</h3>
                <div className="flex flex-wrap gap-2">
                  {video.tags.map((tag) => (
                    <Badge 
                      key={tag.id} 
                      variant="secondary" 
                      className="bg-accent-from/20 text-accent-to border-accent-from/30"
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* 요약 */}
            {video.summary && (
              <GlassCard className="space-y-3">
                <h3 className="font-semibold text-neutral-0 flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  요약
                </h3>
                <p className="text-neutral-100 leading-relaxed whitespace-pre-wrap">
                  {video.summary}
                </p>
              </GlassCard>
            )}

            {/* STT 트랜스크립트 */}
            {video.transcript && (
              <GlassCard className="space-y-3">
                <h3 className="font-semibold text-neutral-0 flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  전체 대본 (STT)
                </h3>
                <div className="max-h-96 overflow-y-auto">
                  <p className="text-neutral-100 text-sm leading-relaxed whitespace-pre-wrap">
                    {video.transcript}
                  </p>
                </div>
              </GlassCard>
            )}
          </div>

          {/* 하단 액션 버튼 */}
          <div className="border-t border-white/10 pt-4 flex space-x-3">
            <Button
              variant="outline"
              onClick={() => window.open(getYouTubeUrl(), '_blank')}
              className="flex-1 text-neutral-100 border-neutral-100 hover:bg-primary-500"
            >
              <Play className="h-4 w-4 mr-2" />
              YouTube에서 재생
            </Button>

            {/* 비디오 요약 버튼 */}
            <Button
              onClick={handleRequestSummary}
              disabled={isSummaryLoading}
              className="cta-button"
            >
              {isSummaryLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  요약 중...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  비디오 요약
                </>
              )}
            </Button>
            
            {video.summary && (
              <Button
                variant="outline"
                onClick={handleCopySummary}
                className="text-neutral-100 border-neutral-100 hover:bg-primary-500"
              >
                요약 복사
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
} 