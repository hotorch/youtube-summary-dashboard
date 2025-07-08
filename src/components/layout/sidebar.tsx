'use client'

import { Calendar, List, Settings, ChevronLeft, ChevronRight } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  const navItems = [
    {
      title: '대시보드',
      href: '/dashboard',
      icon: Calendar,
      children: [
        { title: '캘린더 뷰', href: '/dashboard?view=calendar' },
        { title: '리스트 뷰', href: '/dashboard?view=list' },
      ],
    },
    {
      title: '설정',
      href: '/settings',
      icon: Settings,
      children: [
        { title: '인증 정보', href: '/settings/credentials' },
        { title: '통합 설정', href: '/settings/integrations' },
      ],
    },
  ]

  return (
    <GlassCard 
      className={cn(
        'fixed left-0 top-0 h-full transition-all duration-300 z-40',
        isCollapsed ? 'w-16' : 'w-64',
        'lg:relative lg:translate-x-0',
        className
      )}
    >
      <div className="flex flex-col h-full">
        {/* Toggle Button */}
        <div className="flex justify-end p-4 border-b border-white/10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-neutral-100 hover:text-neutral-0"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname?.startsWith(item.href)
            
            return (
              <div key={item.href}>
                <Link href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      'w-full justify-start text-neutral-100 hover:text-neutral-0 hover:bg-primary-500/30',
                      isActive && 'bg-accent-to/20 text-accent-to',
                      isCollapsed && 'px-2'
                    )}
                  >
                    <item.icon className={cn('h-5 w-5', !isCollapsed && 'mr-3')} />
                    {!isCollapsed && item.title}
                  </Button>
                </Link>

                {/* Sub Navigation */}
                {!isCollapsed && item.children && isActive && (
                  <div className="ml-4 mt-2 space-y-1">
                    {item.children.map((child) => (
                      <Link key={child.href} href={child.href}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-neutral-100 hover:text-neutral-0 hover:bg-primary-500/20"
                        >
                          {child.title}
                        </Button>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </div>
    </GlassCard>
  )
} 