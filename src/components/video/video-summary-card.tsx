'use client'

import { VideoSummaryWithTags } from '@/lib/database.types'
import { GlassCard } from '@/components/ui/glass-card'
import { Badge } from '@/components/ui/badge'
import { Clock, Eye, Star, Calendar } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import Image from 'next/image'

interface VideoSummaryCardProps {
  video: VideoSummaryWithTags
  onClick?: () => void
}

export function VideoSummaryCard({ video, onClick }: VideoSummaryCardProps) {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`
    }
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`
    }
    return views.toString()
  }

  return (
    <GlassCard 
      className="cursor-pointer hover:scale-105 transition-transform duration-200 p-0 overflow-hidden"
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video">
        <Image
          src={video.thumbnail_url || 'https://picsum.photos/seed/default/320/180'}
          alt={video.title || ''}
          fill
          className="object-cover"
        />
        
        {/* Duration Badge */}
        {video.duration_sec && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {formatDuration(video.duration_sec)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="font-semibold text-neutral-0 line-clamp-2 text-sm leading-tight">
          {video.title}
        </h3>

        {/* Channel */}
        {video.channel && (
          <p className="text-xs text-neutral-100">
            {video.channel.channel_name}
          </p>
        )}

        {/* Summary */}
        {video.summary && (
          <p className="text-xs text-neutral-100 line-clamp-3 leading-relaxed">
            {video.summary}
          </p>
        )}

        {/* Tags */}
        {video.tags && video.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {video.tags.slice(0, 3).map((tag) => (
              <Badge 
                key={tag.id} 
                variant="secondary" 
                className="text-xs bg-accent-from/20 text-accent-to border-accent-from/30"
              >
                {tag.name}
              </Badge>
            ))}
            {video.tags.length > 3 && (
              <Badge 
                variant="secondary" 
                className="text-xs bg-neutral-700/20 text-neutral-100"
              >
                +{video.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-neutral-100">
          <div className="flex items-center space-x-3">
            {video.views && (
              <div className="flex items-center space-x-1">
                <Eye className="h-3 w-3" />
                <span>{formatViews(video.views)}</span>
              </div>
            )}
            
            {video.star_rating && (
              <div className="flex items-center space-x-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>{video.star_rating}</span>
              </div>
            )}
          </div>

          {/* Publish Date */}
          {video.publish_date && (
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>
                {formatDistanceToNow(new Date(video.publish_date), { 
                  addSuffix: true, 
                  locale: ko 
                })}
              </span>
            </div>
          )}
        </div>

        {/* Status Indicators */}
        <div className="flex items-center space-x-2">
          {video.ai_updated && (
            <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
              요약 완료
            </Badge>
          )}
          
          {video.stt_processed && (
            <Badge className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
              STT 완료
            </Badge>
          )}
          
          {!video.ai_updated && (
            <Badge className="text-xs bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
              처리 중
            </Badge>
          )}
        </div>
      </div>
    </GlassCard>
  )
} 