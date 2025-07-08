'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // 메인 페이지 접속시 대시보드로 리다이렉트
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-primary-900 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent-to mx-auto mb-4" />
        <p className="text-neutral-100">대시보드로 이동 중...</p>
      </div>
    </div>
  );
}
