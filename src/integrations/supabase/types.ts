export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          created_at: string
          event_name: string
          event_type: string
          id: string
          metadata: Json | null
          page_path: string | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_name: string
          event_type: string
          id?: string
          metadata?: Json | null
          page_path?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_name?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          page_path?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      analytics_insights: {
        Row: {
          content: string
          data: Json | null
          expires_at: string | null
          generated_at: string
          id: string
          insight_type: string
          title: string
        }
        Insert: {
          content: string
          data?: Json | null
          expires_at?: string | null
          generated_at?: string
          id?: string
          insight_type: string
          title: string
        }
        Update: {
          content?: string
          data?: Json | null
          expires_at?: string | null
          generated_at?: string
          id?: string
          insight_type?: string
          title?: string
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key_hash: string
          last_used_at: string | null
          name: string
          prefix: string
          rate_limit_per_day: number
          rate_limit_per_minute: number
          scopes: string[]
          status: string
          total_requests: number
          usage_notification_sent_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key_hash: string
          last_used_at?: string | null
          name?: string
          prefix: string
          rate_limit_per_day?: number
          rate_limit_per_minute?: number
          scopes?: string[]
          status?: string
          total_requests?: number
          usage_notification_sent_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key_hash?: string
          last_used_at?: string | null
          name?: string
          prefix?: string
          rate_limit_per_day?: number
          rate_limit_per_minute?: number
          scopes?: string[]
          status?: string
          total_requests?: number
          usage_notification_sent_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      api_usage: {
        Row: {
          api_key_id: string
          created_at: string
          endpoint: string
          id: string
          request_count: number
          user_id: string
          window_start: string
        }
        Insert: {
          api_key_id: string
          created_at?: string
          endpoint: string
          id?: string
          request_count?: number
          user_id: string
          window_start?: string
        }
        Update: {
          api_key_id?: string
          created_at?: string
          endpoint?: string
          id?: string
          request_count?: number
          user_id?: string
          window_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_usage_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      community_profiles: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          display_name: string | null
          email: string
          email_verified_at: string | null
          id: string
          interests: string[] | null
          newsletter_opt_in: boolean
          newsletter_opt_in_at: string | null
          roles: string[]
          source: Database["public"]["Enums"]["community_source"]
          status: Database["public"]["Enums"]["community_status"]
          trust_score: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          email_verified_at?: string | null
          id?: string
          interests?: string[] | null
          newsletter_opt_in?: boolean
          newsletter_opt_in_at?: string | null
          roles?: string[]
          source?: Database["public"]["Enums"]["community_source"]
          status?: Database["public"]["Enums"]["community_status"]
          trust_score?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          email_verified_at?: string | null
          id?: string
          interests?: string[] | null
          newsletter_opt_in?: boolean
          newsletter_opt_in_at?: string | null
          roles?: string[]
          source?: Database["public"]["Enums"]["community_source"]
          status?: Database["public"]["Enums"]["community_status"]
          trust_score?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      community_submissions: {
        Row: {
          additional_info: string | null
          admin_notes: string | null
          consent_confirmed: boolean
          consent_text_version: string | null
          created_at: string
          description: string | null
          email: string | null
          entity_id: string | null
          entity_type: string | null
          file_urls: string[] | null
          id: string
          location: string | null
          media_metadata: Json | null
          name: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          social_links: Json | null
          status: string
          submission_type: string | null
          updated_at: string
          user_id: string | null
          website_url: string | null
        }
        Insert: {
          additional_info?: string | null
          admin_notes?: string | null
          consent_confirmed?: boolean
          consent_text_version?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          entity_id?: string | null
          entity_type?: string | null
          file_urls?: string[] | null
          id?: string
          location?: string | null
          media_metadata?: Json | null
          name?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          social_links?: Json | null
          status?: string
          submission_type?: string | null
          updated_at?: string
          user_id?: string | null
          website_url?: string | null
        }
        Update: {
          additional_info?: string | null
          admin_notes?: string | null
          consent_confirmed?: boolean
          consent_text_version?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          entity_id?: string | null
          entity_type?: string | null
          file_urls?: string[] | null
          id?: string
          location?: string | null
          media_metadata?: Json | null
          name?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          social_links?: Json | null
          status?: string
          submission_type?: string | null
          updated_at?: string
          user_id?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      content_sync: {
        Row: {
          corrections: Json | null
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          last_synced_at: string | null
          original_data: Json
          photo_source: string | null
          photo_url: string | null
          status: string
          updated_at: string
          verified_data: Json | null
        }
        Insert: {
          corrections?: Json | null
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          last_synced_at?: string | null
          original_data: Json
          photo_source?: string | null
          photo_url?: string | null
          status?: string
          updated_at?: string
          verified_data?: Json | null
        }
        Update: {
          corrections?: Json | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          last_synced_at?: string | null
          original_data?: Json
          photo_source?: string | null
          photo_url?: string | null
          status?: string
          updated_at?: string
          verified_data?: Json | null
        }
        Relationships: []
      }
      dj_artists: {
        Row: {
          artist_name: string
          born: string | null
          created_at: string | null
          died: string | null
          embedding: string | null
          id: number
          known_for: string | null
          labels: string[] | null
          nationality: string | null
          rank: number
          real_name: string | null
          subgenres: string[] | null
          top_tracks: string[] | null
          years_active: string | null
        }
        Insert: {
          artist_name: string
          born?: string | null
          created_at?: string | null
          died?: string | null
          embedding?: string | null
          id?: number
          known_for?: string | null
          labels?: string[] | null
          nationality?: string | null
          rank: number
          real_name?: string | null
          subgenres?: string[] | null
          top_tracks?: string[] | null
          years_active?: string | null
        }
        Update: {
          artist_name?: string
          born?: string | null
          created_at?: string | null
          died?: string | null
          embedding?: string | null
          id?: number
          known_for?: string | null
          labels?: string[] | null
          nationality?: string | null
          rank?: number
          real_name?: string | null
          subgenres?: string[] | null
          top_tracks?: string[] | null
          years_active?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          chunk_index: number | null
          content: string
          created_at: string
          embedding: string | null
          id: string
          metadata: Json | null
          source: string | null
          title: string
          updated_at: string
        }
        Insert: {
          chunk_index?: number | null
          content: string
          created_at?: string
          embedding?: string | null
          id?: string
          metadata?: Json | null
          source?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          chunk_index?: number | null
          content?: string
          created_at?: string
          embedding?: string | null
          id?: string
          metadata?: Json | null
          source?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_events: {
        Row: {
          created_at: string
          email: string
          event_type: string
          id: string
          metadata: Json | null
          provider_message_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          event_type: string
          id?: string
          metadata?: Json | null
          provider_message_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          provider_message_id?: string | null
        }
        Relationships: []
      }
      media_assets: {
        Row: {
          alt_text: string | null
          copyright_risk: string | null
          created_at: string
          entity_id: string
          entity_name: string
          entity_type: string
          final_selected: boolean | null
          id: string
          license_name: string | null
          license_status: string | null
          license_url: string | null
          match_score: number | null
          meta: Json | null
          openai_verified: boolean | null
          provider: string | null
          quality_score: number | null
          reasoning_summary: string | null
          source_url: string | null
          storage_path: string | null
          storage_url: string | null
          tags: Json | null
          updated_at: string
        }
        Insert: {
          alt_text?: string | null
          copyright_risk?: string | null
          created_at?: string
          entity_id: string
          entity_name: string
          entity_type: string
          final_selected?: boolean | null
          id?: string
          license_name?: string | null
          license_status?: string | null
          license_url?: string | null
          match_score?: number | null
          meta?: Json | null
          openai_verified?: boolean | null
          provider?: string | null
          quality_score?: number | null
          reasoning_summary?: string | null
          source_url?: string | null
          storage_path?: string | null
          storage_url?: string | null
          tags?: Json | null
          updated_at?: string
        }
        Update: {
          alt_text?: string | null
          copyright_risk?: string | null
          created_at?: string
          entity_id?: string
          entity_name?: string
          entity_type?: string
          final_selected?: boolean | null
          id?: string
          license_name?: string | null
          license_status?: string | null
          license_url?: string | null
          match_score?: number | null
          meta?: Json | null
          openai_verified?: boolean | null
          provider?: string | null
          quality_score?: number | null
          reasoning_summary?: string | null
          source_url?: string | null
          storage_path?: string | null
          storage_url?: string | null
          tags?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      media_pipeline_jobs: {
        Row: {
          attempts: number | null
          completed_at: string | null
          created_at: string
          entity_id: string
          entity_name: string
          entity_type: string
          error_log: string | null
          id: string
          max_attempts: number | null
          priority: number | null
          result: Json | null
          started_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          attempts?: number | null
          completed_at?: string | null
          created_at?: string
          entity_id: string
          entity_name: string
          entity_type: string
          error_log?: string | null
          id?: string
          max_attempts?: number | null
          priority?: number | null
          result?: Json | null
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          attempts?: number | null
          completed_at?: string | null
          created_at?: string
          entity_id?: string
          entity_name?: string
          entity_type?: string
          error_log?: string | null
          id?: string
          max_attempts?: number | null
          priority?: number | null
          result?: Json | null
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      pending_webhook_events: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          event_type: string
          id: string
          payload: Json
          processed: boolean
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          event_type: string
          id?: string
          payload: Json
          processed?: boolean
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          event_type?: string
          id?: string
          payload?: Json
          processed?: boolean
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      td_article_entities: {
        Row: {
          article_id: string
          entity_id: string
        }
        Insert: {
          article_id: string
          entity_id: string
        }
        Update: {
          article_id?: string
          entity_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "td_article_entities_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "td_news_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "td_article_entities_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "td_knowledge_entities"
            referencedColumns: ["id"]
          },
        ]
      }
      td_knowledge_entities: {
        Row: {
          aliases: string[] | null
          city: string | null
          country: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          source_urls: string[] | null
          type: string
          updated_at: string
        }
        Insert: {
          aliases?: string[] | null
          city?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          source_urls?: string[] | null
          type: string
          updated_at?: string
        }
        Update: {
          aliases?: string[] | null
          city?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          source_urls?: string[] | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      td_news_agent_runs: {
        Row: {
          candidates: Json | null
          chosen_story: Json | null
          created_at: string
          error_log: string | null
          final_article_id: string | null
          id: string
          rejected: Json | null
          run_date: string
          sources_checked: Json | null
          status: string
        }
        Insert: {
          candidates?: Json | null
          chosen_story?: Json | null
          created_at?: string
          error_log?: string | null
          final_article_id?: string | null
          id?: string
          rejected?: Json | null
          run_date?: string
          sources_checked?: Json | null
          status?: string
        }
        Update: {
          candidates?: Json | null
          chosen_story?: Json | null
          created_at?: string
          error_log?: string | null
          final_article_id?: string | null
          id?: string
          rejected?: Json | null
          run_date?: string
          sources_checked?: Json | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_final_article"
            columns: ["final_article_id"]
            isOneToOne: false
            referencedRelation: "td_news_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      td_news_articles: {
        Row: {
          author_pseudonym: string
          body_markdown: string
          city_tags: string[] | null
          confidence_score: number | null
          created_at: string
          entity_tags: string[] | null
          genre_tags: string[] | null
          id: string
          published_at: string | null
          source_snapshots: Json | null
          source_urls: string[] | null
          status: string
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author_pseudonym: string
          body_markdown: string
          city_tags?: string[] | null
          confidence_score?: number | null
          created_at?: string
          entity_tags?: string[] | null
          genre_tags?: string[] | null
          id?: string
          published_at?: string | null
          source_snapshots?: Json | null
          source_urls?: string[] | null
          status?: string
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author_pseudonym?: string
          body_markdown?: string
          city_tags?: string[] | null
          confidence_score?: number | null
          created_at?: string
          entity_tags?: string[] | null
          genre_tags?: string[] | null
          id?: string
          published_at?: string | null
          source_snapshots?: Json | null
          source_urls?: string[] | null
          status?: string
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      webhook_deliveries: {
        Row: {
          created_at: string
          duration_ms: number | null
          event_type: string
          id: string
          payload: Json
          response_body: string | null
          response_status: number | null
          success: boolean
          webhook_id: string
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          event_type: string
          id?: string
          payload: Json
          response_body?: string | null
          response_status?: number | null
          success?: boolean
          webhook_id: string
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          event_type?: string
          id?: string
          payload?: Json
          response_body?: string | null
          response_status?: number | null
          success?: boolean
          webhook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_deliveries_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      webhooks: {
        Row: {
          created_at: string
          events: string[]
          failure_count: number
          id: string
          last_error: string | null
          last_failure_at: string | null
          last_success_at: string | null
          last_triggered_at: string | null
          name: string
          secret: string
          status: string
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          events?: string[]
          failure_count?: number
          id?: string
          last_error?: string | null
          last_failure_at?: string | null
          last_success_at?: string | null
          last_triggered_at?: string | null
          name?: string
          secret: string
          status?: string
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          events?: string[]
          failure_count?: number
          id?: string
          last_error?: string | null
          last_failure_at?: string | null
          last_success_at?: string | null
          last_triggered_at?: string | null
          name?: string
          secret?: string
          status?: string
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      youtube_cache: {
        Row: {
          artist_name: string
          created_at: string
          expires_at: string
          id: string
          videos: Json
        }
        Insert: {
          artist_name: string
          created_at?: string
          expires_at?: string
          id?: string
          videos?: Json
        }
        Update: {
          artist_name?: string
          created_at?: string
          expires_at?: string
          id?: string
          videos?: Json
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_rate_limit: {
        Args: {
          p_api_key_id: string
          p_endpoint: string
          p_limit_per_minute?: number
          p_user_id: string
        }
        Returns: {
          allowed: boolean
          current_count: number
          limit_remaining: number
          reset_at: string
        }[]
      }
      claim_next_media_job: {
        Args: never
        Returns: {
          attempts: number
          entity_id: string
          entity_name: string
          entity_type: string
          job_id: string
        }[]
      }
      cleanup_old_api_usage: { Args: never; Returns: number }
      enqueue_media_job: {
        Args: {
          p_entity_id: string
          p_entity_name: string
          p_entity_type: string
          p_priority?: number
        }
        Returns: string
      }
      get_daily_usage: { Args: { p_api_key_id: string }; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_verified_community_member: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      match_documents: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          content: string
          id: string
          metadata: Json
          similarity: number
          source: string
          title: string
        }[]
      }
      search_dj_artists: {
        Args: {
          match_count?: number
          query_embedding: string
          similarity_threshold?: number
        }
        Returns: {
          artist_name: string
          id: number
          known_for: string
          labels: string[]
          nationality: string
          rank: number
          real_name: string
          similarity: number
          subgenres: string[]
          top_tracks: string[]
          years_active: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user"
      community_source:
        | "upload_widget"
        | "newsletter"
        | "api_signup"
        | "community_page"
        | "other"
      community_status: "pending" | "verified" | "banned"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      community_source: [
        "upload_widget",
        "newsletter",
        "api_signup",
        "community_page",
        "other",
      ],
      community_status: ["pending", "verified", "banned"],
    },
  },
} as const
