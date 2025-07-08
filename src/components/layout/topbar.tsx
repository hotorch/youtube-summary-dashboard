'use client'

import { Search, Plus, Youtube } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

interface TopbarProps {
  onAddVideo?: () => void
  onSearch?: (query: string) => void
  searchQuery?: string
}

export function Topbar({ onAddVideo, onSearch, searchQuery = '' }: TopbarProps) {
  const [query, setQuery] = useState(searchQuery)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value
    setQuery(newQuery)
    onSearch?.(newQuery)
  }

  return (
    <GlassCard variant="navbar" className="sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Youtube className="h-8 w-8 text-accent-to" />
          <h1 className="text-xl font-bold text-neutral-0">
            YouTube 요약
          </h1>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-100" />
            <Input
              type="text"
              placeholder="영상 제목이나 내용 검색..."
              value={query}
              onChange={handleSearch}
              className="search-input pl-10"
            />
          </div>
        </div>

        {/* Add Video Button */}
        <Button
          onClick={onAddVideo}
          className="cta-button"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          영상 추가
        </Button>
      </div>
    </GlassCard>
  )
} 