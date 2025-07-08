'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Radio, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GlassCard } from '@/components/ui/glass-card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import { triggerChannelMetaWebhook } from '@/lib/webhook'

const addChannelMetaSchema = z.object({
  channelId: z
    .string()
    .min(1, '채널 ID를 입력해주세요.')
    .refine(
      (id) => {
        // YouTube 채널 ID는 일반적으로 UC로 시작하는 24자리 문자열
        const channelIdRegex = /^UC[\w-]{22}$/
        return channelIdRegex.test(id)
      },
      '올바른 유튜브 채널 ID를 입력해주세요. (예: UCbo-KbSjJDG6JWQ_MTZ_rNA)'
    ),
})

type AddChannelMetaFormData = z.infer<typeof addChannelMetaSchema>

interface AddChannelMetaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AddChannelMetaModal({ open, onOpenChange, onSuccess }: AddChannelMetaModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<AddChannelMetaFormData>({
    resolver: zodResolver(addChannelMetaSchema),
    defaultValues: {
      channelId: '',
    },
  })

  const handleSubmit = async (data: AddChannelMetaFormData) => {
    setIsLoading(true)
    
    try {
      // 채널 메타 정보 요청 웹훅 호출
      const webhookSuccess = await triggerChannelMetaWebhook(data.channelId)
      
      if (!webhookSuccess) {
        toast({
          title: '오류',
          description: 'Make.com 웹훅 호출에 실패했습니다. 웹훅 URL을 확인해주세요.',
          variant: 'destructive',
        })
        return
      }

      // 성공 시 모달 닫기 및 콜백 호출
      toast({
        title: '채널 메타 정보 요청 전송 완료',
        description: `채널 ID: ${data.channelId}에 대한 RSS 피드 처리 요청을 Make.com으로 전송했습니다.`,
      })
      
      form.reset()
      onOpenChange(false)
      onSuccess?.()
      
    } catch (error) {
      console.error('Error requesting channel meta:', error)
      toast({
        title: '오류',
        description: '채널 메타 정보 요청 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        // URL에서 채널 ID 추출 시도
        const channelIdMatch = text.match(/channel\/(UC[\w-]{22})/);
        const channelIdFromUrl = channelIdMatch ? channelIdMatch[1] : text.trim();
        
        form.setValue('channelId', channelIdFromUrl)
        // 유효성 검사 트리거
        form.trigger('channelId')
      }
    } catch (error) {
      console.error('Failed to read clipboard:', error)
    }
  }

  const generateRssUrl = () => {
    const channelId = form.watch('channelId')
    if (channelId && channelId.length === 24 && channelId.startsWith('UC')) {
      return `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`
    }
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <GlassCard variant="modal" className="border-0 shadow-none">
          <DialogHeader className="space-y-3">
            <div className="flex items-center space-x-2">
              <Radio className="h-6 w-6 text-accent-to" />
              <DialogTitle className="text-neutral-0">
                비디오 메타 정보 추가
              </DialogTitle>
            </div>
            <DialogDescription className="text-neutral-100">
              유튜브 채널 ID를 입력하면 해당 채널의 모든 비디오 메타 정보가 대시보드에 추가됩니다.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 mt-6">
              <FormField
                control={form.control}
                name="channelId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-0">유튜브 채널 ID</FormLabel>
                    <FormControl>
                      <div className="flex space-x-2">
                        <Input
                          {...field}
                          placeholder="UCbo-KbSjJDG6JWQ_MTZ_rNA"
                          className="flex-1 bg-primary-700/60 border-white/20 text-neutral-0 placeholder:text-neutral-100"
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handlePaste}
                          disabled={isLoading}
                          className="text-neutral-100 border-neutral-100 hover:bg-primary-500"
                        >
                          붙여넣기
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription className="text-neutral-100 text-xs">
                      채널 ID는 UC로 시작하는 24자리 문자열입니다. 채널 URL에서 찾을 수 있습니다.
                    </FormDescription>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              {/* RSS URL 미리보기 */}
              {generateRssUrl() && (
                <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <p className="text-xs text-blue-100 mb-2">생성될 RSS URL:</p>
                  <code className="text-xs text-blue-300 break-all">
                    {generateRssUrl()}
                  </code>
                </div>
              )}

              {/* 진행 상태 표시 */}
              {isLoading && (
                <div className="flex items-center space-x-3 p-4 bg-accent-from/10 rounded-lg border border-accent-from/20">
                  <Loader2 className="h-4 w-4 animate-spin text-accent-to" />
                  <div className="text-sm text-neutral-100">
                    Make.com에 채널 메타 정보 요청을 전송하는 중...
                  </div>
                </div>
              )}

              {/* 안내 메시지 */}
              <div className="flex items-start space-x-3 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <AlertCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-100 space-y-1">
                  <p>• 채널 ID 입력 시 해당 채널의 RSS 피드가 Make.com으로 전송됩니다.</p>
                  <p>• 채널의 모든 비디오 메타 정보가 대시보드에 순차적으로 추가됩니다.</p>
                  <p>• 이미 추가된 비디오는 중복으로 추가되지 않습니다.</p>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                  className="text-neutral-100 border-neutral-100 hover:bg-primary-500"
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="cta-button"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      전송 중...
                    </>
                  ) : (
                    '메타 정보 요청'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </GlassCard>
      </DialogContent>
    </Dialog>
  )
} 