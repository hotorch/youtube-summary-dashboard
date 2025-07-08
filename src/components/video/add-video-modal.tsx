'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Youtube, Loader2, AlertCircle } from 'lucide-react'
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
import { addVideo, extractVideoId } from '@/lib/videos'

const addVideoSchema = z.object({
  url: z
    .string()
    .min(1, '유튜브 URL을 입력해주세요.')
    .refine(
      (url) => {
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/
        return youtubeRegex.test(url)
      },
      '올바른 유튜브 URL을 입력해주세요.'
    ),
})

type AddVideoFormData = z.infer<typeof addVideoSchema>

interface AddVideoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AddVideoModal({ open, onOpenChange, onSuccess }: AddVideoModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<AddVideoFormData>({
    resolver: zodResolver(addVideoSchema),
    defaultValues: {
      url: '',
    },
  })

  const handleSubmit = async (data: AddVideoFormData) => {
    setIsLoading(true)
    
    try {
      const videoId = extractVideoId(data.url)
      
      if (!videoId) {
        toast({
          title: '오류',
          description: '유효한 유튜브 URL이 아닙니다.',
          variant: 'destructive',
        })
        return
      }

      // 실제 비디오 추가 API 호출
      const result = await addVideo({
        url: data.url,
        videoId: videoId,
      })

      if (result.success) {
        // 성공 시 모달 닫기 및 콜백 호출
        toast({
          title: '요약 요청 전송 완료',
          description: result.message || 'Make.com으로 요약 요청을 전송했습니다. 처리 완료 시 대시보드에 표시됩니다.',
        })
        
        form.reset()
        onOpenChange(false)
        onSuccess?.()
      } else {
        toast({
          title: '오류',
          description: result.error || '영상 추가에 실패했습니다.',
          variant: 'destructive',
        })
      }
      
    } catch (error) {
      console.error('Error adding video:', error)
      toast({
        title: '오류',
        description: '영상 추가 중 오류가 발생했습니다.',
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
        form.setValue('url', text)
        // 유효성 검사 트리거
        form.trigger('url')
      }
    } catch (error) {
      console.error('Failed to read clipboard:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <GlassCard variant="modal" className="border-0 shadow-none">
          <DialogHeader className="space-y-3">
            <div className="flex items-center space-x-2">
              <Youtube className="h-6 w-6 text-accent-to" />
              <DialogTitle className="text-neutral-0">
                YouTube 영상 추가
              </DialogTitle>
            </div>
            <DialogDescription className="text-neutral-100">
              요약하고 싶은 YouTube 영상의 URL을 입력해주세요.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 mt-6">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-0">YouTube URL</FormLabel>
                    <FormControl>
                      <div className="flex space-x-2">
                        <Input
                          {...field}
                          placeholder="https://www.youtube.com/watch?v=..."
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
                      YouTube 영상 페이지에서 URL을 복사해 붙여넣으세요.
                    </FormDescription>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              {/* 진행 상태 표시 */}
              {isLoading && (
                <div className="flex items-center space-x-3 p-4 bg-accent-from/10 rounded-lg border border-accent-from/20">
                  <Loader2 className="h-4 w-4 animate-spin text-accent-to" />
                                  <div className="text-sm text-neutral-100">
                  Make.com에 요약 요청을 전송하는 중...
                </div>
                </div>
              )}

              {/* 안내 메시지 */}
              <div className="flex items-start space-x-3 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <AlertCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-100 space-y-1">
                  <p>• 영상 추가 시 Make.com 웹훅으로 요약 요청이 전송됩니다.</p>
                  <p>• 요약 생성 완료 시 자동으로 대시보드에 표시됩니다.</p>
                  <p>• 이미 추가된 영상은 중복으로 추가되지 않습니다.</p>
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
                  disabled={isLoading || !form.formState.isValid}
                  className="cta-button"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      처리 중...
                    </>
                  ) : (
                    '영상 추가'
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