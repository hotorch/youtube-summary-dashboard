export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      channel: {
        Row: {
          category: string | null
          channel_id: string
          channel_name: string | null
          created_at: string | null
          id: string
          is_on: boolean | null
          notes: string | null
          primary_language: string | null
          rss_url: string | null
        }
        Insert: {
          category?: string | null
          channel_id: string
          channel_name?: string | null
          created_at?: string | null
          id?: string
          is_on?: boolean | null
          notes?: string | null
          primary_language?: string | null
          rss_url?: string | null
        }
        Update: {
          category?: string | null
          channel_id?: string
          channel_name?: string | null
          created_at?: string | null
          id?: string
          is_on?: boolean | null
          notes?: string | null
          primary_language?: string | null
          rss_url?: string | null
        }
        Relationships: []
      }
      pending_job: {
        Row: {
          created_at: string | null
          id: string
          retry_count: number | null
          status: string
          updated_at: string | null
          video_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          retry_count?: number | null
          status: string
          updated_at?: string | null
          video_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          retry_count?: number | null
          status?: string
          updated_at?: string | null
          video_id?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          key: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          key: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          key?: string
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      tag: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      video_summary: {
        Row: {
          ai_updated: boolean | null
          channel_id: string | null
          created_at: string | null
          duration_sec: number | null
          id: string
          meta_loaded: boolean | null
          publish_date: string | null
          search_vector: unknown | null
          star_rating: number | null
          stt_processed: boolean | null
          summary: string | null
          thumbnail_url: string | null
          title: string | null
          transcript: string | null
          transcript_language: string | null
          updated_at: string | null
          video_id: string
          views: number | null
        }
        Insert: {
          ai_updated?: boolean | null
          channel_id?: string | null
          created_at?: string | null
          duration_sec?: number | null
          id?: string
          meta_loaded?: boolean | null
          publish_date?: string | null
          search_vector?: unknown | null
          star_rating?: number | null
          stt_processed?: boolean | null
          summary?: string | null
          thumbnail_url?: string | null
          title?: string | null
          transcript?: string | null
          transcript_language?: string | null
          updated_at?: string | null
          video_id: string
          views?: number | null
        }
        Update: {
          ai_updated?: boolean | null
          channel_id?: string | null
          created_at?: string | null
          duration_sec?: number | null
          id?: string
          meta_loaded?: boolean | null
          publish_date?: string | null
          search_vector?: unknown | null
          star_rating?: number | null
          stt_processed?: boolean | null
          summary?: string | null
          thumbnail_url?: string | null
          title?: string | null
          transcript?: string | null
          transcript_language?: string | null
          updated_at?: string | null
          video_id?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "video_summary_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "channel"
            referencedColumns: ["id"]
          },
        ]
      }
      video_tag: {
        Row: {
          tag_id: string
          video_summary_id: string
        }
        Insert: {
          tag_id: string
          video_summary_id: string
        }
        Update: {
          tag_id?: string
          video_summary_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_tag_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tag"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_tag_video_summary_id_fkey"
            columns: ["video_summary_id"]
            isOneToOne: false
            referencedRelation: "video_summary"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

// Helper types for easier usage
export type VideoSummary = Tables<'video_summary'>
export type Channel = Tables<'channel'>
export type Tag = Tables<'tag'>
export type VideoTag = Tables<'video_tag'>
export type PendingJob = Tables<'pending_job'>
export type Settings = Tables<'settings'>

export type VideoSummaryWithChannel = VideoSummary & {
  channel: Channel | null
}

export type VideoSummaryWithTags = VideoSummary & {
  channel: Channel | null
  tags: Tag[]
} 