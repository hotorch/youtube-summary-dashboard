'use client'

import { AppLayout } from '@/components/layout/app-layout'
import { VideoSummaryCard } from '@/components/video/video-summary-card'
import { VideoDetailDrawer } from '@/components/video/video-detail-drawer'
import { AddChannelMetaModal } from '@/components/video/add-channel-meta-modal'
import { useVideos } from '@/hooks/use-videos'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Calendar, Grid, Loader2, Radio } from 'lucide-react'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { VideoSummaryWithTags } from '@/lib/database.types'
import { useQueryClient } from '@tanstack/react-query'

function DashboardContent() {
  const searchParams = useSearchParams()
  const view = searchParams?.get('view') || 'calendar'
  const searchQuery = searchParams?.get('query') || ''
  
  const [selectedVideo, setSelectedVideo] = useState<VideoSummaryWithTags | null>(null)
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false)
  const [isChannelMetaModalOpen, setIsChannelMetaModalOpen] = useState(false)
  
  const queryClient = useQueryClient()
  const { data: videos, isLoading, error } = useVideos(searchQuery)

  // Make.com에서 처리 완료된 새 비디오를 감지하기 위한 자동 새로고침
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      // 비디오 목록을 자동으로 새로고침
      queryClient.invalidateQueries({ queryKey: ['videos'] })
    }, 30000) // 30초마다 새로고침

    return () => clearInterval(refreshInterval)
  }, [])

  const handleVideoClick = (video: VideoSummaryWithTags) => {
    setSelectedVideo(video)
    setIsDetailDrawerOpen(true)
  }

  const handleChannelMetaSuccess = () => {
    // 채널 메타 정보 요청 성공 시 비디오 목록 새로고침
    queryClient.invalidateQueries({ queryKey: ['videos'] })
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-accent-to mx-auto mb-4" />
            <p className="text-neutral-100">영상 목록을 불러오는 중...</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout>
        <GlassCard className="text-center py-12">
          <p className="text-red-400 mb-4">영상을 불러오는 중 오류가 발생했습니다.</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
            className="text-neutral-0 border-neutral-100 hover:bg-primary-500"
          >
            다시 시도
          </Button>
        </GlassCard>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-0 mb-2">
              YouTube 요약 대시보드
            </h1>
            <p className="text-neutral-100">
              {videos?.length || 0}개의 영상 요약이 있습니다
            </p>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-3">
            {/* Channel Meta Add Button */}
            <Button
              onClick={() => setIsChannelMetaModalOpen(true)}
              className="cta-button"
            >
              <Radio className="h-4 w-4 mr-2" />
              비디오 메타 정보 추가
            </Button>
            
            {/* View Toggle */}
            <div className="flex items-center space-x-2">
              <Button
                variant={view === 'calendar' ? 'default' : 'outline'}
                size="sm"
                className={view === 'calendar' ? 'cta-button' : 'text-neutral-100 border-neutral-100 hover:bg-primary-500'}
              >
                <Calendar className="h-4 w-4 mr-2" />
                캘린더
              </Button>
              <Button
                variant={view === 'list' ? 'default' : 'outline'}
                size="sm"
                className={view === 'list' ? 'cta-button' : 'text-neutral-100 border-neutral-100 hover:bg-primary-500'}
              >
                <Grid className="h-4 w-4 mr-2" />
                리스트
              </Button>
            </div>
          </div>
        </div>

        {/* Search Results Info */}
        {searchQuery && (
          <GlassCard className="p-4">
            <p className="text-neutral-100">
              <span className="text-accent-to font-semibold">"{searchQuery}"</span>
              에 대한 검색 결과 {videos?.length || 0}개
            </p>
          </GlassCard>
        )}

        {/* Videos Grid */}
        {videos && videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                         {videos.map((video) => (
               <VideoSummaryCard
                 key={video.id}
                 video={video}
                 onClick={() => handleVideoClick(video)}
               />
             ))}
          </div>
        ) : (
          <GlassCard className="text-center py-12">
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-neutral-0 mb-4">
                {searchQuery ? '검색 결과가 없습니다' : '저장된 영상이 없습니다'}
              </h3>
              <p className="text-neutral-100 mb-6">
                {searchQuery 
                  ? '다른 검색어를 시도해보세요.' 
                  : '첫 번째 YouTube 채널의 메타 정보를 추가해보세요.'
                }
              </p>
              {!searchQuery && (
                <Button 
                  className="cta-button"
                  onClick={() => setIsChannelMetaModalOpen(true)}
                >
                  <Radio className="h-4 w-4 mr-2" />
                  비디오 메타 정보 추가
                </Button>
              )}
            </div>
          </GlassCard>
        )}

        <VideoDetailDrawer
          video={selectedVideo}
          open={isDetailDrawerOpen}
          onOpenChange={setIsDetailDrawerOpen}
        />

        <AddChannelMetaModal
          open={isChannelMetaModalOpen}
          onOpenChange={setIsChannelMetaModalOpen}
          onSuccess={handleChannelMetaSuccess}
        />
      </div>
    </AppLayout>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-accent-to mx-auto mb-4" />
            <p className="text-neutral-100">페이지를 불러오는 중...</p>
          </div>
        </div>
      </AppLayout>
    }>
      <DashboardContent />
    </Suspense>
  )
} 