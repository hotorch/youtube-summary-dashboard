'use client'

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { VideoSummaryWithTags } from '@/lib/database.types'

export function useVideos(searchQuery?: string) {
  return useQuery({
    queryKey: ['videos', searchQuery],
    queryFn: async (): Promise<VideoSummaryWithTags[]> => {
      let query = supabase
        .from('video_summary')
        .select(`
          *,
          channel:channel_id(*),
          video_tag(
            tag:tag_id(*)
          )
        `)
        .order('publish_date', { ascending: false })

      // 검색 쿼리가 있으면 필터 적용
      if (searchQuery && searchQuery.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,summary.ilike.%${searchQuery}%`)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching videos:', error)
        throw error
      }

      // 데이터 변환: video_tag 배열을 tags 배열로 변환
      return (data || []).map((video: any) => {
        const { video_tag, ...videoData } = video
        return {
          ...videoData,
          channel: video.channel || null,
          tags: video_tag?.map((vt: any) => vt.tag).filter(Boolean) || []
        } as VideoSummaryWithTags
      })
    },
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
    gcTime: 1000 * 60 * 10, // 10분간 가비지 컬렉션 지연
  })
} 