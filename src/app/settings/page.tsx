'use client'

import { AppLayout } from '@/components/layout/app-layout'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Settings, Webhook, Database, Tag, Sparkles, Radio } from 'lucide-react'
import { useState, useEffect } from 'react'
import { 
  getWebhookUrl, 
  setWebhookUrl, 
  WebhookType,
  getAllWebhookUrls
} from '@/lib/settings'
import { useToast } from '@/hooks/use-toast'

export default function SettingsPage() {
  const [webhookUrls, setWebhookUrls] = useState<Record<WebhookType, string>>({
    default: '',
    video_summary: 'https://hook.eu2.make.com/1vmq85bvseml9jehaf48caw25pojxeo3',
    channel_meta: 'https://hook.eu2.make.com/rl20ksysotuxl2x8yijcsch0bh7i6los'
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // 페이지 로드 시 기존 웹훅 URL들 불러오기
  useEffect(() => {
    loadWebhookUrls()
  }, [])

  // 요청된 웹훅 URL들을 자동 설정
  useEffect(() => {
    const initializeWebhooks = async () => {
      try {
        // 비디오 요약 웹훅 URL 저장
        await setWebhookUrl('video_summary', 'https://hook.eu2.make.com/1vmq85bvseml9jehaf48caw25pojxeo3')
        
        // 채널 메타정보 웹훅 URL 저장
        await setWebhookUrl('channel_meta', 'https://hook.eu2.make.com/rl20ksysotuxl2x8yijcsch0bh7i6los')
        
        console.log('웹훅 URL 초기화 완료')
      } catch (error) {
        console.error('웹훅 URL 초기화 실패:', error)
      }
    }

    if (!isLoading) {
      initializeWebhooks()
    }
  }, [isLoading])

  const loadWebhookUrls = async () => {
    try {
      const urls = await getAllWebhookUrls()
      
      // 기본값이 있으면 유지, 없으면 요청된 URL로 설정
      setWebhookUrls(prev => ({
        default: urls.default || prev.default,
        video_summary: urls.video_summary || prev.video_summary,
        channel_meta: urls.channel_meta || prev.channel_meta
      }))
    } catch (error) {
      console.error('웹훅 URL 로드 실패:', error)
      toast({
        title: "오류",
        description: "웹훅 URL을 불러오는데 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveWebhook = async (type: WebhookType) => {
    const url = webhookUrls[type]
    
    if (!url.trim()) {
      toast({
        title: "입력 오류",
        description: "웹훅 URL을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    // URL 형식 검증
    try {
      new URL(url)
    } catch (error) {
      toast({
        title: "URL 형식 오류",
        description: "올바른 URL 형식이 아닙니다.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const success = await setWebhookUrl(type, url)
      
      if (success) {
        toast({
          title: "저장 완료",
          description: `${getWebhookTypeLabel(type)} 웹훅 URL이 성공적으로 저장되었습니다.`,
        })
      } else {
        toast({
          title: "저장 실패",
          description: "웹훅 URL 저장에 실패했습니다. 다시 시도해주세요.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('웹훅 URL 저장 실패:', error)
      toast({
        title: "오류",
        description: "웹훅 URL 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const getWebhookTypeLabel = (type: WebhookType) => {
    switch (type) {
      case 'video_summary':
        return '비디오 요약'
      case 'channel_meta':
        return '채널 메타정보'
      case 'default':
        return '기본'
      default:
        return type
    }
  }

  const getWebhookTypeIcon = (type: WebhookType) => {
    switch (type) {
      case 'video_summary':
        return <Sparkles className="h-4 w-4" />
      case 'channel_meta':
        return <Radio className="h-4 w-4" />
      default:
        return <Webhook className="h-4 w-4" />
    }
  }

  const updateWebhookUrl = (type: WebhookType, value: string) => {
    setWebhookUrls(prev => ({
      ...prev,
      [type]: value
    }))
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <Settings className="h-8 w-8 text-accent-to" />
          <h1 className="text-3xl font-bold text-neutral-0">설정</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Make.com 통합 설정 */}
          <div className="lg:col-span-2">
            <GlassCard className="space-y-6">
              <div className="flex items-center space-x-3">
                <Webhook className="h-6 w-6 text-accent-to" />
                <h2 className="text-xl font-semibold text-neutral-0">Make.com 웹훅 설정</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 비디오 요약 웹훅 */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5 text-accent-to" />
                    <Label htmlFor="video-summary-webhook" className="text-neutral-0 font-medium">
                      비디오 요약 웹훅 URL
                    </Label>
                  </div>
                  <Input
                    id="video-summary-webhook"
                    type="url"
                    placeholder="https://hook.eu2.make.com/..."
                    value={webhookUrls.video_summary}
                    onChange={(e) => updateWebhookUrl('video_summary', e.target.value)}
                    className="bg-primary-700/60 border-white/20 text-neutral-0 placeholder:text-neutral-100"
                    disabled={isLoading || isSaving}
                  />
                  <p className="text-xs text-neutral-100">
                    비디오 요약 버튼 클릭 시 사용되는 웹훅 URL
                  </p>
                  <Button 
                    onClick={() => handleSaveWebhook('video_summary')}
                    disabled={isSaving || isLoading}
                    className="cta-button w-full"
                    size="sm"
                  >
                    {isSaving ? '저장 중...' : '저장'}
                  </Button>
                </div>

                {/* 채널 메타정보 웹훅 */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Radio className="h-5 w-5 text-accent-to" />
                    <Label htmlFor="channel-meta-webhook" className="text-neutral-0 font-medium">
                      채널 메타정보 웹훅 URL
                    </Label>
                  </div>
                  <Input
                    id="channel-meta-webhook"
                    type="url"
                    placeholder="https://hook.eu2.make.com/..."
                    value={webhookUrls.channel_meta}
                    onChange={(e) => updateWebhookUrl('channel_meta', e.target.value)}
                    className="bg-primary-700/60 border-white/20 text-neutral-0 placeholder:text-neutral-100"
                    disabled={isLoading || isSaving}
                  />
                  <p className="text-xs text-neutral-100">
                    채널 메타정보 추가 버튼 클릭 시 사용되는 웹훅 URL
                  </p>
                  <Button 
                    onClick={() => handleSaveWebhook('channel_meta')}
                    disabled={isSaving || isLoading}
                    className="cta-button w-full"
                    size="sm"
                  >
                    {isSaving ? '저장 중...' : '저장'}
                  </Button>
                </div>

                {/* 기본 웹훅 (호환성) */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Webhook className="h-5 w-5 text-accent-to" />
                    <Label htmlFor="default-webhook" className="text-neutral-0 font-medium">
                      기본 웹훅 URL
                    </Label>
                  </div>
                  <Input
                    id="default-webhook"
                    type="url"
                    placeholder="https://hook.make.com/..."
                    value={webhookUrls.default}
                    onChange={(e) => updateWebhookUrl('default', e.target.value)}
                    className="bg-primary-700/60 border-white/20 text-neutral-0 placeholder:text-neutral-100"
                    disabled={isLoading || isSaving}
                  />
                  <p className="text-xs text-neutral-100">
                    특정 웹훅 URL이 없을 때 사용되는 기본 웹훅 URL
                  </p>
                  <Button 
                    onClick={() => handleSaveWebhook('default')}
                    disabled={isSaving || isLoading}
                    className="cta-button w-full"
                    size="sm"
                  >
                    {isSaving ? '저장 중...' : '저장'}
                  </Button>
                </div>
              </div>

              {/* 현재 설정된 웹훅 상태 */}
              <div className="border-t border-white/10 pt-6">
                <h3 className="font-medium text-neutral-0 mb-3">현재 웹훅 설정 상태</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {Object.entries(webhookUrls).map(([type, url]) => (
                    <div key={type} className="flex items-center justify-between p-3 bg-primary-500/20 rounded-lg">
                      <div className="flex items-center space-x-2">
                        {getWebhookTypeIcon(type as WebhookType)}
                        <span className="text-sm text-neutral-100">
                          {getWebhookTypeLabel(type as WebhookType)}
                        </span>
                      </div>
                      <Badge className={url ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}>
                        {url ? '설정됨' : '미설정'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          </div>

          {/* 데이터베이스 정보 */}
          <GlassCard className="space-y-6">
            <div className="flex items-center space-x-3">
              <Database className="h-6 w-6 text-accent-to" />
              <h2 className="text-xl font-semibold text-neutral-0">데이터베이스 현황</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-primary-500/20 rounded-lg">
                  <div className="text-2xl font-bold text-accent-to">7</div>
                  <div className="text-sm text-neutral-100">저장된 영상</div>
                </div>
                <div className="text-center p-4 bg-primary-500/20 rounded-lg">
                  <div className="text-2xl font-bold text-accent-to">5</div>
                  <div className="text-sm text-neutral-100">채널</div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-neutral-0">처리 상태</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    요약 완료: 7개
                  </Badge>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                    STT 완료: 7개
                  </Badge>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* 태그 관리 */}
          <GlassCard className="space-y-6">
            <div className="flex items-center space-x-3">
              <Tag className="h-6 w-6 text-accent-to" />
              <h2 className="text-xl font-semibold text-neutral-0">태그 관리</h2>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {['React', 'TypeScript', 'JavaScript', 'Python', 'AI', '백엔드', '프론트엔드', '웹개발', '알고리즘', 'Next.js'].map((tag) => (
                  <Badge 
                    key={tag}
                    variant="secondary" 
                    className="bg-accent-from/20 text-accent-to border-accent-from/30"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex space-x-2">
                <Input
                  placeholder="새 태그 이름"
                  className="flex-1 bg-primary-700/60 border-white/20 text-neutral-0 placeholder:text-neutral-100"
                />
                <Button 
                  variant="outline"
                  className="text-neutral-100 border-neutral-100 hover:bg-primary-500"
                >
                  추가
                </Button>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </AppLayout>
  )
} 