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
      admin_audit_log: {
        Row: {
          action_type: string
          admin_user_id: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          action_type: string
          admin_user_id: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          action_type?: string
          admin_user_id?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      agent_reports: {
        Row: {
          agent_category: string
          agent_name: string
          created_at: string
          description: string | null
          details: Json | null
          id: string
          report_type: string
          reviewed_at: string | null
          reviewed_by: string | null
          severity: string
          status: string
          title: string
        }
        Insert: {
          agent_category: string
          agent_name: string
          created_at?: string
          description?: string | null
          details?: Json | null
          id?: string
          report_type?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity?: string
          status?: string
          title: string
        }
        Update: {
          agent_category?: string
          agent_name?: string
          created_at?: string
          description?: string | null
          details?: Json | null
          id?: string
          report_type?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
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
          {
            foreignKeyName: "api_usage_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          category: string
          created_at: string
          description: string
          icon: string
          id: string
          is_active: boolean
          name: string
          points_value: number
          rarity: string
          slug: string
          unlock_criteria: Json
        }
        Insert: {
          category?: string
          created_at?: string
          description: string
          icon: string
          id?: string
          is_active?: boolean
          name: string
          points_value?: number
          rarity?: string
          slug: string
          unlock_criteria?: Json
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          is_active?: boolean
          name?: string
          points_value?: number
          rarity?: string
          slug?: string
          unlock_criteria?: Json
        }
        Relationships: []
      }
      community_profiles: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          current_level: number
          current_streak: number
          display_name: string | null
          email: string
          email_verified_at: string | null
          id: string
          interests: string[] | null
          last_activity_date: string | null
          longest_streak: number
          newsletter_opt_in: boolean
          newsletter_opt_in_at: string | null
          referral_code: string | null
          roles: string[]
          source: Database["public"]["Enums"]["community_source"]
          status: Database["public"]["Enums"]["community_status"]
          total_points: number
          trust_score: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          current_level?: number
          current_streak?: number
          display_name?: string | null
          email: string
          email_verified_at?: string | null
          id?: string
          interests?: string[] | null
          last_activity_date?: string | null
          longest_streak?: number
          newsletter_opt_in?: boolean
          newsletter_opt_in_at?: string | null
          referral_code?: string | null
          roles?: string[]
          source?: Database["public"]["Enums"]["community_source"]
          status?: Database["public"]["Enums"]["community_status"]
          total_points?: number
          trust_score?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          current_level?: number
          current_streak?: number
          display_name?: string | null
          email?: string
          email_verified_at?: string | null
          id?: string
          interests?: string[] | null
          last_activity_date?: string | null
          longest_streak?: number
          newsletter_opt_in?: boolean
          newsletter_opt_in_at?: string | null
          referral_code?: string | null
          roles?: string[]
          source?: Database["public"]["Enums"]["community_source"]
          status?: Database["public"]["Enums"]["community_status"]
          total_points?: number
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
      contributor_levels: {
        Row: {
          color: string
          created_at: string
          icon: string
          id: number
          level_number: number
          min_points: number
          name: string
          perks: string[] | null
        }
        Insert: {
          color?: string
          created_at?: string
          icon?: string
          id?: number
          level_number: number
          min_points: number
          name: string
          perks?: string[] | null
        }
        Update: {
          color?: string
          created_at?: string
          icon?: string
          id?: number
          level_number?: number
          min_points?: number
          name?: string
          perks?: string[] | null
        }
        Relationships: []
      }
      corporate_sponsor_requests: {
        Row: {
          admin_notes: string | null
          company_name: string
          contact_email: string
          created_at: string
          id: string
          notes: string | null
          processed_at: string | null
          requested_amount_cents: number
          status: string
          tier: string | null
          vat_number: string | null
        }
        Insert: {
          admin_notes?: string | null
          company_name: string
          contact_email: string
          created_at?: string
          id?: string
          notes?: string | null
          processed_at?: string | null
          requested_amount_cents: number
          status?: string
          tier?: string | null
          vat_number?: string | null
        }
        Update: {
          admin_notes?: string | null
          company_name?: string
          contact_email?: string
          created_at?: string
          id?: string
          notes?: string | null
          processed_at?: string | null
          requested_amount_cents?: number
          status?: string
          tier?: string | null
          vat_number?: string | null
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
      health_alerts: {
        Row: {
          alert_type: string
          created_at: string
          id: string
          message: string
          notified_at: string
          resolved_at: string | null
          service_name: string
          severity: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          id?: string
          message: string
          notified_at?: string
          resolved_at?: string | null
          service_name: string
          severity: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          id?: string
          message?: string
          notified_at?: string
          resolved_at?: string | null
          service_name?: string
          severity?: string
        }
        Relationships: []
      }
      ip_rate_limits: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          ip_address: string
          request_count: number
          window_start: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          ip_address: string
          request_count?: number
          window_start: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          ip_address?: string
          request_count?: number
          window_start?: string
        }
        Relationships: []
      }
      launch_notifications: {
        Row: {
          created_at: string
          email: string
          id: string
          notified_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          notified_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          notified_at?: string | null
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
      notification_channels: {
        Row: {
          channel_type: string
          cooldown_minutes: number
          created_at: string
          created_by: string | null
          email_addresses: string[] | null
          id: string
          is_active: boolean
          last_notified_at: string | null
          name: string
          notify_categories: string[]
          notify_on_severity: string[]
          updated_at: string
          webhook_url: string | null
        }
        Insert: {
          channel_type: string
          cooldown_minutes?: number
          created_at?: string
          created_by?: string | null
          email_addresses?: string[] | null
          id?: string
          is_active?: boolean
          last_notified_at?: string | null
          name: string
          notify_categories?: string[]
          notify_on_severity?: string[]
          updated_at?: string
          webhook_url?: string | null
        }
        Update: {
          channel_type?: string
          cooldown_minutes?: number
          created_at?: string
          created_by?: string | null
          email_addresses?: string[] | null
          id?: string
          is_active?: boolean
          last_notified_at?: string | null
          name?: string
          notify_categories?: string[]
          notify_on_severity?: string[]
          updated_at?: string
          webhook_url?: string | null
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          agent_report_id: string | null
          channel_id: string | null
          delivery_status: string
          error_message: string | null
          health_alert_id: string | null
          id: string
          message: string | null
          notification_type: string
          response_code: number | null
          sent_at: string
          severity: string
          title: string
        }
        Insert: {
          agent_report_id?: string | null
          channel_id?: string | null
          delivery_status?: string
          error_message?: string | null
          health_alert_id?: string | null
          id?: string
          message?: string | null
          notification_type: string
          response_code?: number | null
          sent_at?: string
          severity: string
          title: string
        }
        Update: {
          agent_report_id?: string | null
          channel_id?: string | null
          delivery_status?: string
          error_message?: string | null
          health_alert_id?: string | null
          id?: string
          message?: string | null
          notification_type?: string
          response_code?: number | null
          sent_at?: string
          severity?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_agent_report_id_fkey"
            columns: ["agent_report_id"]
            isOneToOne: false
            referencedRelation: "agent_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_logs_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "notification_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_logs_health_alert_id_fkey"
            columns: ["health_alert_id"]
            isOneToOne: false
            referencedRelation: "health_alerts"
            referencedColumns: ["id"]
          },
        ]
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
      point_transactions: {
        Row: {
          action_type: string
          created_at: string
          description: string | null
          id: string
          points: number
          profile_id: string
          reference_id: string | null
          reference_type: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          description?: string | null
          id?: string
          points: number
          profile_id: string
          reference_id?: string | null
          reference_type?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          description?: string | null
          id?: string
          points?: number
          profile_id?: string
          reference_id?: string | null
          reference_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "point_transactions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "community_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "point_transactions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_community_profiles"
            referencedColumns: ["id"]
          },
        ]
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
      referrals: {
        Row: {
          created_at: string
          id: string
          referral_code_used: string
          referred_email: string
          referred_profile_id: string | null
          referrer_id: string
          status: string
          verified_at: string | null
          xp_awarded: boolean
          xp_awarded_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          referral_code_used: string
          referred_email: string
          referred_profile_id?: string | null
          referrer_id: string
          status?: string
          verified_at?: string | null
          xp_awarded?: boolean
          xp_awarded_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          referral_code_used?: string
          referred_email?: string
          referred_profile_id?: string | null
          referrer_id?: string
          status?: string
          verified_at?: string | null
          xp_awarded?: boolean
          xp_awarded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_profile_id_fkey"
            columns: ["referred_profile_id"]
            isOneToOne: false
            referencedRelation: "community_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referred_profile_id_fkey"
            columns: ["referred_profile_id"]
            isOneToOne: false
            referencedRelation: "public_community_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "community_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "public_community_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      supporters: {
        Row: {
          amount_cents: number
          cancelled_at: string | null
          company_name: string | null
          created_at: string
          currency: string
          email: string
          id: string
          is_active: boolean
          metadata: Json | null
          notes: string | null
          stripe_checkout_session_id: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          support_mode: Database["public"]["Enums"]["support_mode"]
          supporter_tier: Database["public"]["Enums"]["supporter_tier"]
          updated_at: string
          user_id: string | null
          vat_number: string | null
        }
        Insert: {
          amount_cents: number
          cancelled_at?: string | null
          company_name?: string | null
          created_at?: string
          currency?: string
          email: string
          id?: string
          is_active?: boolean
          metadata?: Json | null
          notes?: string | null
          stripe_checkout_session_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          support_mode: Database["public"]["Enums"]["support_mode"]
          supporter_tier?: Database["public"]["Enums"]["supporter_tier"]
          updated_at?: string
          user_id?: string | null
          vat_number?: string | null
        }
        Update: {
          amount_cents?: number
          cancelled_at?: string | null
          company_name?: string | null
          created_at?: string
          currency?: string
          email?: string
          id?: string
          is_active?: boolean
          metadata?: Json | null
          notes?: string | null
          stripe_checkout_session_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          support_mode?: Database["public"]["Enums"]["support_mode"]
          supporter_tier?: Database["public"]["Enums"]["supporter_tier"]
          updated_at?: string
          user_id?: string | null
          vat_number?: string | null
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
      user_badges: {
        Row: {
          awarded_at: string
          awarded_reason: string | null
          badge_id: string
          id: string
          profile_id: string
        }
        Insert: {
          awarded_at?: string
          awarded_reason?: string | null
          badge_id: string
          id?: string
          profile_id: string
        }
        Update: {
          awarded_at?: string
          awarded_reason?: string | null
          badge_id?: string
          id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "community_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_community_profiles"
            referencedColumns: ["id"]
          },
        ]
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
      xp_multiplier_events: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          end_at: string
          event_type: string
          icon: string | null
          id: string
          is_active: boolean
          multiplier: number
          name: string
          start_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_at: string
          event_type?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          multiplier?: number
          name: string
          start_at: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_at?: string
          event_type?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          multiplier?: number
          name?: string
          start_at?: string
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
      admin_user_overview: {
        Row: {
          city: string | null
          community_status:
            | Database["public"]["Enums"]["community_status"]
            | null
          country: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          profile_id: string | null
          role: Database["public"]["Enums"]["app_role"] | null
          role_id: string | null
          trust_score: number | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
      api_keys_safe: {
        Row: {
          created_at: string | null
          description: string | null
          id: string | null
          last_used_at: string | null
          name: string | null
          prefix: string | null
          rate_limit_per_day: number | null
          rate_limit_per_minute: number | null
          scopes: string[] | null
          status: string | null
          total_requests: number | null
          usage_notification_sent_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string | null
          last_used_at?: string | null
          name?: string | null
          prefix?: string | null
          rate_limit_per_day?: number | null
          rate_limit_per_minute?: number | null
          scopes?: string[] | null
          status?: string | null
          total_requests?: number | null
          usage_notification_sent_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string | null
          last_used_at?: string | null
          name?: string | null
          prefix?: string | null
          rate_limit_per_day?: number | null
          rate_limit_per_minute?: number | null
          scopes?: string[] | null
          status?: string | null
          total_requests?: number | null
          usage_notification_sent_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      public_community_profiles: {
        Row: {
          city: string | null
          country: string | null
          created_at: string | null
          display_name: string | null
          id: string | null
          interests: string[] | null
          roles: string[] | null
          status: Database["public"]["Enums"]["community_status"] | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string | null
          interests?: string[] | null
          roles?: string[] | null
          status?: Database["public"]["Enums"]["community_status"] | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string | null
          interests?: string[] | null
          roles?: string[] | null
          status?: Database["public"]["Enums"]["community_status"] | null
        }
        Relationships: []
      }
    }
    Functions: {
      award_badge: {
        Args: { p_badge_slug: string; p_profile_id: string; p_reason?: string }
        Returns: boolean
      }
      award_points: {
        Args: {
          p_action_type: string
          p_description?: string
          p_points: number
          p_profile_id: string
          p_reference_id?: string
          p_reference_type?: string
        }
        Returns: {
          level_up: boolean
          new_level: number
          new_total: number
        }[]
      }
      check_ip_rate_limit: {
        Args: {
          p_endpoint: string
          p_ip_address: string
          p_limit_per_minute?: number
        }
        Returns: {
          allowed: boolean
          current_count: number
          limit_remaining: number
          reset_at: string
        }[]
      }
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
      check_referral_badges: {
        Args: { p_profile_id: string }
        Returns: undefined
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
      cleanup_old_ip_rate_limits: { Args: never; Returns: number }
      enqueue_media_job: {
        Args: {
          p_entity_id: string
          p_entity_name: string
          p_entity_type: string
          p_priority?: number
        }
        Returns: string
      }
      generate_referral_code: { Args: never; Returns: string }
      get_current_xp_multiplier: {
        Args: never
        Returns: {
          ends_at: string
          event_icon: string
          event_name: string
          multiplier: number
        }[]
      }
      get_daily_usage: { Args: { p_api_key_id: string }; Returns: number }
      grant_admin_role: { Args: { target_user_id: string }; Returns: boolean }
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
      revoke_admin_role: { Args: { target_user_id: string }; Returns: boolean }
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
      update_activity_streak: {
        Args: { p_profile_id: string }
        Returns: {
          current_streak: number
          longest_streak: number
          streak_increased: boolean
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
      support_mode: "one_time" | "recurring" | "corporate"
      supporter_tier:
        | "free"
        | "member"
        | "patron"
        | "founding"
        | "bronze"
        | "silver"
        | "gold"
        | "custom"
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
      support_mode: ["one_time", "recurring", "corporate"],
      supporter_tier: [
        "free",
        "member",
        "patron",
        "founding",
        "bronze",
        "silver",
        "gold",
        "custom",
      ],
    },
  },
} as const
