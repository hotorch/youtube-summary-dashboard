'use client'

import { Topbar } from './topbar'
import { Sidebar } from './sidebar'
import { AddVideoModal } from '@/components/video/add-video-modal'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddVideoModalOpen, setIsAddVideoModalOpen] = useState(false)
  const router = useRouter()
  const queryClient = useQueryClient()

  const handleAddVideo = () => {
    setIsAddVideoModalOpen(true)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    // URL에 검색 쿼리 반영
    const params = new URLSearchParams()
    if (query.trim()) {
      params.set('query', query)
    }
    router.push(`/dashboard?${params.toString()}`)
  }

  const handleVideoAddSuccess = () => {
    // React Query 캐시 무효화하여 비디오 목록 새로고침
    queryClient.invalidateQueries({ queryKey: ['videos'] })
  }

  return (
    <div className="min-h-screen bg-primary-900">
      <Topbar 
        onAddVideo={handleAddVideo}
        onSearch={handleSearch}
        searchQuery={searchQuery}
      />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 lg:ml-64 p-6">
          {children}
        </main>
      </div>

      <AddVideoModal
        open={isAddVideoModalOpen}
        onOpenChange={setIsAddVideoModalOpen}
        onSuccess={handleVideoAddSuccess}
      />
    </div>
  )
} 