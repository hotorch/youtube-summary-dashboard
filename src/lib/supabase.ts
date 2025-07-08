import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

// 환경변수는 .env.local에서 설정해야 합니다
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pxrwpwzxjhzbgoxltdtk.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4cndwd3p4amh6YmdveGx0ZHRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4NTQ4NTEsImV4cCI6MjA2NzQzMDg1MX0.xn3Nm33tcWcaV-vfdXV6cfsjdBzD5VZ2S6JK7dykyx0'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // PRD에 따라 로그인 없이 사용
  },
}) 