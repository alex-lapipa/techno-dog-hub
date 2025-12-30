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
      agent_status: {
        Row: {
          agent_name: string
          avg_duration_ms: number | null
          category: string | null
          config: Json | null
          created_at: string
          error_count: number | null
          function_name: string
          id: string
          last_error_at: string | null
          last_error_message: string | null
          last_run_at: string | null
          last_success_at: string | null
          run_count: number | null
          status: string
          success_count: number | null
          updated_at: string
        }
        Insert: {
          agent_name: string
          avg_duration_ms?: number | null
          category?: string | null
          config?: Json | null
          created_at?: string
          error_count?: number | null
          function_name: string
          id?: string
          last_error_at?: string | null
          last_error_message?: string | null
          last_run_at?: string | null
          last_success_at?: string | null
          run_count?: number | null
          status?: string
          success_count?: number | null
          updated_at?: string
        }
        Update: {
          agent_name?: string
          avg_duration_ms?: number | null
          category?: string | null
          config?: Json | null
          created_at?: string
          error_count?: number | null
          function_name?: string
          id?: string
          last_error_at?: string | null
          last_error_message?: string | null
          last_run_at?: string | null
          last_success_at?: string | null
          run_count?: number | null
          status?: string
          success_count?: number | null
          updated_at?: string
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
      artist_aliases: {
        Row: {
          alias_id: string
          alias_name: string
          alias_type: string | null
          artist_id: string
          created_at: string | null
          source_system: string | null
        }
        Insert: {
          alias_id?: string
          alias_name: string
          alias_type?: string | null
          artist_id: string
          created_at?: string | null
          source_system?: string | null
        }
        Update: {
          alias_id?: string
          alias_name?: string
          alias_type?: string | null
          artist_id?: string
          created_at?: string | null
          source_system?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artist_aliases_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "canonical_artists"
            referencedColumns: ["artist_id"]
          },
        ]
      }
      artist_assets: {
        Row: {
          alt_text: string | null
          artist_id: string
          asset_id: string
          asset_type: string
          author: string | null
          copyright_status: string | null
          created_at: string | null
          is_primary: boolean | null
          license: string | null
          license_url: string | null
          quality_score: number | null
          source_name: string | null
          source_record_id: string | null
          source_system: string | null
          source_url: string | null
          storage_path: string | null
          updated_at: string | null
          url: string
        }
        Insert: {
          alt_text?: string | null
          artist_id: string
          asset_id?: string
          asset_type?: string
          author?: string | null
          copyright_status?: string | null
          created_at?: string | null
          is_primary?: boolean | null
          license?: string | null
          license_url?: string | null
          quality_score?: number | null
          source_name?: string | null
          source_record_id?: string | null
          source_system?: string | null
          source_url?: string | null
          storage_path?: string | null
          updated_at?: string | null
          url: string
        }
        Update: {
          alt_text?: string | null
          artist_id?: string
          asset_id?: string
          asset_type?: string
          author?: string | null
          copyright_status?: string | null
          created_at?: string | null
          is_primary?: boolean | null
          license?: string | null
          license_url?: string | null
          quality_score?: number | null
          source_name?: string | null
          source_record_id?: string | null
          source_system?: string | null
          source_url?: string | null
          storage_path?: string | null
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "artist_assets_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "canonical_artists"
            referencedColumns: ["artist_id"]
          },
        ]
      }
      artist_claims: {
        Row: {
          artist_id: string
          claim_id: string
          claim_text: string
          claim_type: string
          confidence_score: number | null
          contradicts_claim_id: string | null
          created_at: string
          extraction_model: string | null
          updated_at: string
          value_structured: Json | null
          verification_model: string | null
          verification_status:
            | Database["public"]["Enums"]["claim_verification_status"]
            | null
          verified_at: string | null
        }
        Insert: {
          artist_id: string
          claim_id?: string
          claim_text: string
          claim_type: string
          confidence_score?: number | null
          contradicts_claim_id?: string | null
          created_at?: string
          extraction_model?: string | null
          updated_at?: string
          value_structured?: Json | null
          verification_model?: string | null
          verification_status?:
            | Database["public"]["Enums"]["claim_verification_status"]
            | null
          verified_at?: string | null
        }
        Update: {
          artist_id?: string
          claim_id?: string
          claim_text?: string
          claim_type?: string
          confidence_score?: number | null
          contradicts_claim_id?: string | null
          created_at?: string
          extraction_model?: string | null
          updated_at?: string
          value_structured?: Json | null
          verification_model?: string | null
          verification_status?:
            | Database["public"]["Enums"]["claim_verification_status"]
            | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artist_claims_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "canonical_artists"
            referencedColumns: ["artist_id"]
          },
          {
            foreignKeyName: "artist_claims_contradicts_claim_id_fkey"
            columns: ["contradicts_claim_id"]
            isOneToOne: false
            referencedRelation: "artist_claims"
            referencedColumns: ["claim_id"]
          },
        ]
      }
      artist_documents: {
        Row: {
          artist_id: string
          chunk_id: string | null
          chunk_index: number | null
          content: string
          created_at: string | null
          document_id: string
          document_type: string
          embedding: string | null
          metadata: Json | null
          source_record_id: string | null
          source_system: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          artist_id: string
          chunk_id?: string | null
          chunk_index?: number | null
          content: string
          created_at?: string | null
          document_id?: string
          document_type: string
          embedding?: string | null
          metadata?: Json | null
          source_record_id?: string | null
          source_system?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          artist_id?: string
          chunk_id?: string | null
          chunk_index?: number | null
          content?: string
          created_at?: string | null
          document_id?: string
          document_type?: string
          embedding?: string | null
          metadata?: Json | null
          source_record_id?: string | null
          source_system?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artist_documents_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "canonical_artists"
            referencedColumns: ["artist_id"]
          },
        ]
      }
      artist_enrichment_queue: {
        Row: {
          artist_id: string
          attempts: number | null
          created_at: string
          last_attempt_at: string | null
          last_error: string | null
          priority: number | null
          queue_id: string
          reason: string | null
          scheduled_for: string | null
          status: string | null
        }
        Insert: {
          artist_id: string
          attempts?: number | null
          created_at?: string
          last_attempt_at?: string | null
          last_error?: string | null
          priority?: number | null
          queue_id?: string
          reason?: string | null
          scheduled_for?: string | null
          status?: string | null
        }
        Update: {
          artist_id?: string
          attempts?: number | null
          created_at?: string
          last_attempt_at?: string | null
          last_error?: string | null
          priority?: number | null
          queue_id?: string
          reason?: string | null
          scheduled_for?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artist_enrichment_queue_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "canonical_artists"
            referencedColumns: ["artist_id"]
          },
        ]
      }
      artist_enrichment_runs: {
        Row: {
          artist_id: string
          created_at: string
          errors: Json | null
          finished_at: string | null
          firecrawl_urls_searched: string[] | null
          models_used: string[] | null
          run_id: string
          run_type: Database["public"]["Enums"]["enrichment_run_type"] | null
          started_at: string | null
          stats: Json | null
          status: Database["public"]["Enums"]["enrichment_run_status"] | null
        }
        Insert: {
          artist_id: string
          created_at?: string
          errors?: Json | null
          finished_at?: string | null
          firecrawl_urls_searched?: string[] | null
          models_used?: string[] | null
          run_id?: string
          run_type?: Database["public"]["Enums"]["enrichment_run_type"] | null
          started_at?: string | null
          stats?: Json | null
          status?: Database["public"]["Enums"]["enrichment_run_status"] | null
        }
        Update: {
          artist_id?: string
          created_at?: string
          errors?: Json | null
          finished_at?: string | null
          firecrawl_urls_searched?: string[] | null
          models_used?: string[] | null
          run_id?: string
          run_type?: Database["public"]["Enums"]["enrichment_run_type"] | null
          started_at?: string | null
          stats?: Json | null
          status?: Database["public"]["Enums"]["enrichment_run_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "artist_enrichment_runs_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "canonical_artists"
            referencedColumns: ["artist_id"]
          },
        ]
      }
      artist_gear: {
        Row: {
          artist_id: string
          created_at: string | null
          gear_category: string
          gear_id: string
          gear_items: string[] | null
          rider_notes: string | null
          source_system: string | null
          updated_at: string | null
        }
        Insert: {
          artist_id: string
          created_at?: string | null
          gear_category: string
          gear_id?: string
          gear_items?: string[] | null
          rider_notes?: string | null
          source_system?: string | null
          updated_at?: string | null
        }
        Update: {
          artist_id?: string
          created_at?: string | null
          gear_category?: string
          gear_id?: string
          gear_items?: string[] | null
          rider_notes?: string | null
          source_system?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artist_gear_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "canonical_artists"
            referencedColumns: ["artist_id"]
          },
        ]
      }
      artist_label_agent_runs: {
        Row: {
          created_at: string | null
          error_message: string | null
          finished_at: string | null
          id: string
          run_type: string
          started_at: string | null
          stats: Json | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          run_type: string
          started_at?: string | null
          stats?: Json | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          run_type?: string
          started_at?: string | null
          stats?: Json | null
          status?: string | null
        }
        Relationships: []
      }
      artist_label_outreach_history: {
        Row: {
          artist_id: string | null
          created_at: string | null
          date: string | null
          id: string
          label_contact_id: string | null
          label_id: string | null
          manager_id: string | null
          message_summary: string | null
          next_action_date: string | null
          outreach_type: string | null
          response_notes: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          artist_id?: string | null
          created_at?: string | null
          date?: string | null
          id?: string
          label_contact_id?: string | null
          label_id?: string | null
          manager_id?: string | null
          message_summary?: string | null
          next_action_date?: string | null
          outreach_type?: string | null
          response_notes?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          artist_id?: string | null
          created_at?: string | null
          date?: string | null
          id?: string
          label_contact_id?: string | null
          label_id?: string | null
          manager_id?: string | null
          message_summary?: string | null
          next_action_date?: string | null
          outreach_type?: string | null
          response_notes?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artist_label_outreach_history_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artist_label_outreach_history_label_contact_id_fkey"
            columns: ["label_contact_id"]
            isOneToOne: false
            referencedRelation: "label_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artist_label_outreach_history_label_id_fkey"
            columns: ["label_id"]
            isOneToOne: false
            referencedRelation: "labels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artist_label_outreach_history_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "artist_managers"
            referencedColumns: ["id"]
          },
        ]
      }
      artist_label_scrape_audit: {
        Row: {
          action: string
          created_at: string | null
          data_extracted: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          source_url: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          data_extracted?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          source_url?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          data_extracted?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          source_url?: string | null
        }
        Relationships: []
      }
      artist_label_segments: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          filters_json: Json | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          filters_json?: Json | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          filters_json?: Json | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      artist_labels: {
        Row: {
          artist_id: string | null
          created_at: string | null
          evidence_url: string | null
          id: string
          label_id: string | null
          notes: string | null
          relationship_type: string | null
        }
        Insert: {
          artist_id?: string | null
          created_at?: string | null
          evidence_url?: string | null
          id?: string
          label_id?: string | null
          notes?: string | null
          relationship_type?: string | null
        }
        Update: {
          artist_id?: string | null
          created_at?: string | null
          evidence_url?: string | null
          id?: string
          label_id?: string | null
          notes?: string | null
          relationship_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artist_labels_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artist_labels_label_id_fkey"
            columns: ["label_id"]
            isOneToOne: false
            referencedRelation: "labels"
            referencedColumns: ["id"]
          },
        ]
      }
      artist_managers: {
        Row: {
          address: string | null
          artist_id: string | null
          best_approach_notes: string | null
          collaboration_policy_summary: string | null
          company_website: string | null
          contact_form_url: string | null
          created_at: string | null
          data_source_url: string | null
          email: string | null
          enrichment_confidence: number | null
          id: string
          last_verified_at: string | null
          location_city: string | null
          location_country: string | null
          management_company: string | null
          manager_name: string
          manager_role: string | null
          outreach_channel_preference: string | null
          phone: string | null
          professional_social_links_json: Json | null
          region_coverage: string | null
          relationship_status: string | null
          updated_at: string | null
          what_they_dislike: string | null
          what_they_like: string | null
        }
        Insert: {
          address?: string | null
          artist_id?: string | null
          best_approach_notes?: string | null
          collaboration_policy_summary?: string | null
          company_website?: string | null
          contact_form_url?: string | null
          created_at?: string | null
          data_source_url?: string | null
          email?: string | null
          enrichment_confidence?: number | null
          id?: string
          last_verified_at?: string | null
          location_city?: string | null
          location_country?: string | null
          management_company?: string | null
          manager_name: string
          manager_role?: string | null
          outreach_channel_preference?: string | null
          phone?: string | null
          professional_social_links_json?: Json | null
          region_coverage?: string | null
          relationship_status?: string | null
          updated_at?: string | null
          what_they_dislike?: string | null
          what_they_like?: string | null
        }
        Update: {
          address?: string | null
          artist_id?: string | null
          best_approach_notes?: string | null
          collaboration_policy_summary?: string | null
          company_website?: string | null
          contact_form_url?: string | null
          created_at?: string | null
          data_source_url?: string | null
          email?: string | null
          enrichment_confidence?: number | null
          id?: string
          last_verified_at?: string | null
          location_city?: string | null
          location_country?: string | null
          management_company?: string | null
          manager_name?: string
          manager_role?: string | null
          outreach_channel_preference?: string | null
          phone?: string | null
          professional_social_links_json?: Json | null
          region_coverage?: string | null
          relationship_status?: string | null
          updated_at?: string | null
          what_they_dislike?: string | null
          what_they_like?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artist_managers_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists_active"
            referencedColumns: ["id"]
          },
        ]
      }
      artist_merge_candidates: {
        Row: {
          artist_a_id: string
          artist_b_id: string
          candidate_id: string
          created_at: string | null
          match_reasons: Json | null
          match_score: number
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
        }
        Insert: {
          artist_a_id: string
          artist_b_id: string
          candidate_id?: string
          created_at?: string | null
          match_reasons?: Json | null
          match_score: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Update: {
          artist_a_id?: string
          artist_b_id?: string
          candidate_id?: string
          created_at?: string | null
          match_reasons?: Json | null
          match_score?: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artist_merge_candidates_artist_a_id_fkey"
            columns: ["artist_a_id"]
            isOneToOne: false
            referencedRelation: "canonical_artists"
            referencedColumns: ["artist_id"]
          },
          {
            foreignKeyName: "artist_merge_candidates_artist_b_id_fkey"
            columns: ["artist_b_id"]
            isOneToOne: false
            referencedRelation: "canonical_artists"
            referencedColumns: ["artist_id"]
          },
        ]
      }
      artist_migration_log: {
        Row: {
          created_at: string | null
          details: Json | null
          error_message: string | null
          log_id: string
          operation: string
          source_record_id: string | null
          source_system: string | null
          success: boolean | null
          target_artist_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          error_message?: string | null
          log_id?: string
          operation: string
          source_record_id?: string | null
          source_system?: string | null
          success?: boolean | null
          target_artist_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          error_message?: string | null
          log_id?: string
          operation?: string
          source_record_id?: string | null
          source_system?: string | null
          success?: boolean | null
          target_artist_id?: string | null
        }
        Relationships: []
      }
      artist_profiles: {
        Row: {
          artist_id: string
          bio_long: string | null
          bio_short: string | null
          career_highlights: string[] | null
          collaborators: string[] | null
          confidence_score: number | null
          created_at: string | null
          crews: string[] | null
          influences: string[] | null
          key_releases: Json | null
          known_for: string | null
          labels: string[] | null
          last_synced_at: string | null
          press_notes: string | null
          profile_id: string
          social_links: Json | null
          source_payload: Json | null
          source_priority: number | null
          source_record_id: string | null
          source_system: string
          subgenres: string[] | null
          tags: string[] | null
          top_tracks: string[] | null
          updated_at: string | null
        }
        Insert: {
          artist_id: string
          bio_long?: string | null
          bio_short?: string | null
          career_highlights?: string[] | null
          collaborators?: string[] | null
          confidence_score?: number | null
          created_at?: string | null
          crews?: string[] | null
          influences?: string[] | null
          key_releases?: Json | null
          known_for?: string | null
          labels?: string[] | null
          last_synced_at?: string | null
          press_notes?: string | null
          profile_id?: string
          social_links?: Json | null
          source_payload?: Json | null
          source_priority?: number | null
          source_record_id?: string | null
          source_system: string
          subgenres?: string[] | null
          tags?: string[] | null
          top_tracks?: string[] | null
          updated_at?: string | null
        }
        Update: {
          artist_id?: string
          bio_long?: string | null
          bio_short?: string | null
          career_highlights?: string[] | null
          collaborators?: string[] | null
          confidence_score?: number | null
          created_at?: string | null
          crews?: string[] | null
          influences?: string[] | null
          key_releases?: Json | null
          known_for?: string | null
          labels?: string[] | null
          last_synced_at?: string | null
          press_notes?: string | null
          profile_id?: string
          social_links?: Json | null
          source_payload?: Json | null
          source_priority?: number | null
          source_record_id?: string | null
          source_system?: string
          subgenres?: string[] | null
          tags?: string[] | null
          top_tracks?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artist_profiles_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "canonical_artists"
            referencedColumns: ["artist_id"]
          },
        ]
      }
      artist_raw_documents: {
        Row: {
          artist_id: string | null
          content_hash: string | null
          content_json: Json | null
          content_markdown: string | null
          content_text: string | null
          created_at: string
          domain: string | null
          raw_doc_id: string
          retrieved_at: string
          url: string
        }
        Insert: {
          artist_id?: string | null
          content_hash?: string | null
          content_json?: Json | null
          content_markdown?: string | null
          content_text?: string | null
          created_at?: string
          domain?: string | null
          raw_doc_id?: string
          retrieved_at?: string
          url: string
        }
        Update: {
          artist_id?: string | null
          content_hash?: string | null
          content_json?: Json | null
          content_markdown?: string | null
          content_text?: string | null
          created_at?: string
          domain?: string | null
          raw_doc_id?: string
          retrieved_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "artist_raw_documents_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "canonical_artists"
            referencedColumns: ["artist_id"]
          },
        ]
      }
      artist_source_map: {
        Row: {
          artist_id: string | null
          created_at: string | null
          is_merged: boolean | null
          mapping_id: string
          match_confidence: number | null
          match_method: string | null
          merged_into_artist_id: string | null
          notes: string | null
          source_record_id: string
          source_system: string
          source_table: string
          updated_at: string | null
        }
        Insert: {
          artist_id?: string | null
          created_at?: string | null
          is_merged?: boolean | null
          mapping_id?: string
          match_confidence?: number | null
          match_method?: string | null
          merged_into_artist_id?: string | null
          notes?: string | null
          source_record_id: string
          source_system: string
          source_table: string
          updated_at?: string | null
        }
        Update: {
          artist_id?: string | null
          created_at?: string | null
          is_merged?: boolean | null
          mapping_id?: string
          match_confidence?: number | null
          match_method?: string | null
          merged_into_artist_id?: string | null
          notes?: string | null
          source_record_id?: string
          source_system?: string
          source_table?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artist_source_map_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "canonical_artists"
            referencedColumns: ["artist_id"]
          },
          {
            foreignKeyName: "artist_source_map_merged_into_artist_id_fkey"
            columns: ["merged_into_artist_id"]
            isOneToOne: false
            referencedRelation: "canonical_artists"
            referencedColumns: ["artist_id"]
          },
        ]
      }
      artist_sources: {
        Row: {
          claim_id: string
          created_at: string
          domain: string | null
          is_primary_source: boolean | null
          publish_date: string | null
          quote_snippet: string | null
          raw_doc_id: string | null
          retrieved_at: string
          source_id: string
          source_quality_score: number | null
          title: string | null
          url: string
        }
        Insert: {
          claim_id: string
          created_at?: string
          domain?: string | null
          is_primary_source?: boolean | null
          publish_date?: string | null
          quote_snippet?: string | null
          raw_doc_id?: string | null
          retrieved_at?: string
          source_id?: string
          source_quality_score?: number | null
          title?: string | null
          url: string
        }
        Update: {
          claim_id?: string
          created_at?: string
          domain?: string | null
          is_primary_source?: boolean | null
          publish_date?: string | null
          quote_snippet?: string | null
          raw_doc_id?: string | null
          retrieved_at?: string
          source_id?: string
          source_quality_score?: number | null
          title?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "artist_sources_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "artist_claims"
            referencedColumns: ["claim_id"]
          },
          {
            foreignKeyName: "artist_sources_raw_doc_id_fkey"
            columns: ["raw_doc_id"]
            isOneToOne: false
            referencedRelation: "artist_raw_documents"
            referencedColumns: ["raw_doc_id"]
          },
        ]
      }
      artists_active: {
        Row: {
          active_status: string | null
          artist_aliases: Json | null
          artist_name: string
          artist_website_url: string | null
          canonical_artist_id: string | null
          city_base: string | null
          country_base: string | null
          created_at: string | null
          evidence_of_activity: string | null
          id: string
          last_verified_at: string | null
          main_social_links_json: Json | null
          region_focus: string | null
          source_urls_json: Json | null
          updated_at: string | null
          verification_confidence: number | null
        }
        Insert: {
          active_status?: string | null
          artist_aliases?: Json | null
          artist_name: string
          artist_website_url?: string | null
          canonical_artist_id?: string | null
          city_base?: string | null
          country_base?: string | null
          created_at?: string | null
          evidence_of_activity?: string | null
          id?: string
          last_verified_at?: string | null
          main_social_links_json?: Json | null
          region_focus?: string | null
          source_urls_json?: Json | null
          updated_at?: string | null
          verification_confidence?: number | null
        }
        Update: {
          active_status?: string | null
          artist_aliases?: Json | null
          artist_name?: string
          artist_website_url?: string | null
          canonical_artist_id?: string | null
          city_base?: string | null
          country_base?: string | null
          created_at?: string | null
          evidence_of_activity?: string | null
          id?: string
          last_verified_at?: string | null
          main_social_links_json?: Json | null
          region_focus?: string | null
          source_urls_json?: Json | null
          updated_at?: string | null
          verification_confidence?: number | null
        }
        Relationships: []
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
      brand_contacts: {
        Row: {
          brand_id: string | null
          contact_form_url: string | null
          contact_person_name: string | null
          contact_relevance_score: number | null
          contact_type: string
          created_at: string | null
          created_by: string | null
          department: string | null
          do_not_do: string | null
          email: string | null
          enrichment_confidence: number | null
          id: string
          last_verified_at: string | null
          mailing_address: string | null
          notes_on_how_to_approach: string | null
          phone: string | null
          preferred_contact_method: string | null
          region_coverage: string | null
          role_title: string | null
          social_links_json: Json | null
          source_url: string | null
          updated_at: string | null
          what_they_care_about: string | null
        }
        Insert: {
          brand_id?: string | null
          contact_form_url?: string | null
          contact_person_name?: string | null
          contact_relevance_score?: number | null
          contact_type: string
          created_at?: string | null
          created_by?: string | null
          department?: string | null
          do_not_do?: string | null
          email?: string | null
          enrichment_confidence?: number | null
          id?: string
          last_verified_at?: string | null
          mailing_address?: string | null
          notes_on_how_to_approach?: string | null
          phone?: string | null
          preferred_contact_method?: string | null
          region_coverage?: string | null
          role_title?: string | null
          social_links_json?: Json | null
          source_url?: string | null
          updated_at?: string | null
          what_they_care_about?: string | null
        }
        Update: {
          brand_id?: string | null
          contact_form_url?: string | null
          contact_person_name?: string | null
          contact_relevance_score?: number | null
          contact_type?: string
          created_at?: string | null
          created_by?: string | null
          department?: string | null
          do_not_do?: string | null
          email?: string | null
          enrichment_confidence?: number | null
          id?: string
          last_verified_at?: string | null
          mailing_address?: string | null
          notes_on_how_to_approach?: string | null
          phone?: string | null
          preferred_contact_method?: string | null
          region_coverage?: string | null
          role_title?: string | null
          social_links_json?: Json | null
          source_url?: string | null
          updated_at?: string | null
          what_they_care_about?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_contacts_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "gear_brands"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          audience_segment: Json | null
          campaign_name: string
          campaign_theme: string | null
          created_at: string | null
          created_by: string | null
          id: string
          objective: string | null
          primary_call_to_action: string | null
          stats_json: Json | null
          status: string | null
          tone: string | null
          updated_at: string | null
        }
        Insert: {
          audience_segment?: Json | null
          campaign_name: string
          campaign_theme?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          objective?: string | null
          primary_call_to_action?: string | null
          stats_json?: Json | null
          status?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Update: {
          audience_segment?: Json | null
          campaign_name?: string
          campaign_theme?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          objective?: string | null
          primary_call_to_action?: string | null
          stats_json?: Json | null
          status?: string | null
          tone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      canonical_artists: {
        Row: {
          active_years: string | null
          artist_id: string
          canonical_name: string
          city: string | null
          country: string | null
          created_at: string | null
          is_active: boolean | null
          needs_review: boolean | null
          photo_source: string | null
          photo_tags: string[] | null
          photo_url: string | null
          photo_verification_models: string[] | null
          photo_verified: boolean | null
          photo_verified_at: string | null
          primary_genre: string | null
          rank: number | null
          real_name: string | null
          region: string | null
          slug: string
          sort_name: string
          updated_at: string | null
        }
        Insert: {
          active_years?: string | null
          artist_id?: string
          canonical_name: string
          city?: string | null
          country?: string | null
          created_at?: string | null
          is_active?: boolean | null
          needs_review?: boolean | null
          photo_source?: string | null
          photo_tags?: string[] | null
          photo_url?: string | null
          photo_verification_models?: string[] | null
          photo_verified?: boolean | null
          photo_verified_at?: string | null
          primary_genre?: string | null
          rank?: number | null
          real_name?: string | null
          region?: string | null
          slug: string
          sort_name: string
          updated_at?: string | null
        }
        Update: {
          active_years?: string | null
          artist_id?: string
          canonical_name?: string
          city?: string | null
          country?: string | null
          created_at?: string | null
          is_active?: boolean | null
          needs_review?: boolean | null
          photo_source?: string | null
          photo_tags?: string[] | null
          photo_url?: string | null
          photo_verification_models?: string[] | null
          photo_verified?: boolean | null
          photo_verified_at?: string | null
          primary_genre?: string | null
          rank?: number | null
          real_name?: string | null
          region?: string | null
          slug?: string
          sort_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      collaboration_programs: {
        Row: {
          brand_id: string | null
          created_at: string | null
          decision_timeline_notes: string | null
          do_not_do: string | null
          id: string
          is_active: boolean | null
          last_verified_at: string | null
          program_name: string | null
          program_type: string
          requirements_summary: string | null
          source_url: string | null
          submission_url: string | null
          updated_at: string | null
          what_they_care_about: string | null
        }
        Insert: {
          brand_id?: string | null
          created_at?: string | null
          decision_timeline_notes?: string | null
          do_not_do?: string | null
          id?: string
          is_active?: boolean | null
          last_verified_at?: string | null
          program_name?: string | null
          program_type: string
          requirements_summary?: string | null
          source_url?: string | null
          submission_url?: string | null
          updated_at?: string | null
          what_they_care_about?: string | null
        }
        Update: {
          brand_id?: string | null
          created_at?: string | null
          decision_timeline_notes?: string | null
          do_not_do?: string | null
          id?: string
          is_active?: boolean | null
          last_verified_at?: string | null
          program_name?: string | null
          program_type?: string
          requirements_summary?: string | null
          source_url?: string | null
          submission_url?: string | null
          updated_at?: string | null
          what_they_care_about?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collaboration_programs_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "gear_brands"
            referencedColumns: ["id"]
          },
        ]
      }
      collective_activities: {
        Row: {
          activity_type: string | null
          collective_id: string | null
          created_at: string | null
          description: string | null
          event_platforms_json: Json | null
          frequency: string | null
          id: string
          last_verified_at: string | null
          main_venues_json: Json | null
          recurring_event_names_json: Json | null
          source_url: string | null
          updated_at: string | null
        }
        Insert: {
          activity_type?: string | null
          collective_id?: string | null
          created_at?: string | null
          description?: string | null
          event_platforms_json?: Json | null
          frequency?: string | null
          id?: string
          last_verified_at?: string | null
          main_venues_json?: Json | null
          recurring_event_names_json?: Json | null
          source_url?: string | null
          updated_at?: string | null
        }
        Update: {
          activity_type?: string | null
          collective_id?: string | null
          created_at?: string | null
          description?: string | null
          event_platforms_json?: Json | null
          frequency?: string | null
          id?: string
          last_verified_at?: string | null
          main_venues_json?: Json | null
          recurring_event_names_json?: Json | null
          source_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collective_activities_collective_id_fkey"
            columns: ["collective_id"]
            isOneToOne: false
            referencedRelation: "collectives"
            referencedColumns: ["id"]
          },
        ]
      }
      collective_agent_runs: {
        Row: {
          created_at: string | null
          error_message: string | null
          finished_at: string | null
          id: string
          run_type: string
          started_at: string | null
          stats: Json | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          run_type: string
          started_at?: string | null
          stats?: Json | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          run_type?: string
          started_at?: string | null
          stats?: Json | null
          status?: string | null
        }
        Relationships: []
      }
      collective_key_people: {
        Row: {
          collective_id: string | null
          created_at: string | null
          email: string | null
          enrichment_confidence: number | null
          id: string
          last_verified_at: string | null
          location_city: string | null
          location_country: string | null
          notes_on_how_to_approach: string | null
          person_name: string
          phone: string | null
          preferred_contact_method: string | null
          role_title: string | null
          social_links_json: Json | null
          source_url: string | null
          updated_at: string | null
        }
        Insert: {
          collective_id?: string | null
          created_at?: string | null
          email?: string | null
          enrichment_confidence?: number | null
          id?: string
          last_verified_at?: string | null
          location_city?: string | null
          location_country?: string | null
          notes_on_how_to_approach?: string | null
          person_name: string
          phone?: string | null
          preferred_contact_method?: string | null
          role_title?: string | null
          social_links_json?: Json | null
          source_url?: string | null
          updated_at?: string | null
        }
        Update: {
          collective_id?: string | null
          created_at?: string | null
          email?: string | null
          enrichment_confidence?: number | null
          id?: string
          last_verified_at?: string | null
          location_city?: string | null
          location_country?: string | null
          notes_on_how_to_approach?: string | null
          person_name?: string
          phone?: string | null
          preferred_contact_method?: string | null
          role_title?: string | null
          social_links_json?: Json | null
          source_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collective_key_people_collective_id_fkey"
            columns: ["collective_id"]
            isOneToOne: false
            referencedRelation: "collectives"
            referencedColumns: ["id"]
          },
        ]
      }
      collective_outreach_history: {
        Row: {
          collective_id: string | null
          created_at: string | null
          date: string | null
          id: string
          key_person_id: string | null
          message_summary: string | null
          next_action_date: string | null
          outreach_type: string | null
          response_notes: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          collective_id?: string | null
          created_at?: string | null
          date?: string | null
          id?: string
          key_person_id?: string | null
          message_summary?: string | null
          next_action_date?: string | null
          outreach_type?: string | null
          response_notes?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          collective_id?: string | null
          created_at?: string | null
          date?: string | null
          id?: string
          key_person_id?: string | null
          message_summary?: string | null
          next_action_date?: string | null
          outreach_type?: string | null
          response_notes?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collective_outreach_history_collective_id_fkey"
            columns: ["collective_id"]
            isOneToOne: false
            referencedRelation: "collectives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collective_outreach_history_key_person_id_fkey"
            columns: ["key_person_id"]
            isOneToOne: false
            referencedRelation: "collective_key_people"
            referencedColumns: ["id"]
          },
        ]
      }
      collective_scrape_audit: {
        Row: {
          action: string
          created_at: string | null
          data_extracted: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          source_url: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          data_extracted?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          source_url?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          data_extracted?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          source_url?: string | null
        }
        Relationships: []
      }
      collective_segments: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          filters_json: Json | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          filters_json?: Json | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          filters_json?: Json | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      collectives: {
        Row: {
          activity_evidence: string | null
          activity_score: number | null
          anti_harassment_policy_url: string | null
          base_locations_json: Json | null
          booking_email: string | null
          city: string | null
          collaboration_email: string | null
          collaboration_preferences_summary: string | null
          collective_aliases: Json | null
          collective_name: string
          collective_type: string[] | null
          contact_email: string | null
          contact_form_url: string | null
          contact_phone: string | null
          country: string | null
          created_at: string | null
          credibility_score: number | null
          founded_year: number | null
          id: string
          inclusivity_policy_url: string | null
          last_verified_at: string | null
          manifesto_url: string | null
          philosophy_summary: string | null
          physical_address: string | null
          press_email: string | null
          primary_platforms_json: Json | null
          region: string | null
          sources_json: Json | null
          status: string | null
          techno_doc_fit_score: number | null
          updated_at: string | null
          verification_confidence: number | null
          website_url: string | null
          what_they_dislike: string | null
          what_they_like: string | null
        }
        Insert: {
          activity_evidence?: string | null
          activity_score?: number | null
          anti_harassment_policy_url?: string | null
          base_locations_json?: Json | null
          booking_email?: string | null
          city?: string | null
          collaboration_email?: string | null
          collaboration_preferences_summary?: string | null
          collective_aliases?: Json | null
          collective_name: string
          collective_type?: string[] | null
          contact_email?: string | null
          contact_form_url?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string | null
          credibility_score?: number | null
          founded_year?: number | null
          id?: string
          inclusivity_policy_url?: string | null
          last_verified_at?: string | null
          manifesto_url?: string | null
          philosophy_summary?: string | null
          physical_address?: string | null
          press_email?: string | null
          primary_platforms_json?: Json | null
          region?: string | null
          sources_json?: Json | null
          status?: string | null
          techno_doc_fit_score?: number | null
          updated_at?: string | null
          verification_confidence?: number | null
          website_url?: string | null
          what_they_dislike?: string | null
          what_they_like?: string | null
        }
        Update: {
          activity_evidence?: string | null
          activity_score?: number | null
          anti_harassment_policy_url?: string | null
          base_locations_json?: Json | null
          booking_email?: string | null
          city?: string | null
          collaboration_email?: string | null
          collaboration_preferences_summary?: string | null
          collective_aliases?: Json | null
          collective_name?: string
          collective_type?: string[] | null
          contact_email?: string | null
          contact_form_url?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string | null
          credibility_score?: number | null
          founded_year?: number | null
          id?: string
          inclusivity_policy_url?: string | null
          last_verified_at?: string | null
          manifesto_url?: string | null
          philosophy_summary?: string | null
          physical_address?: string | null
          press_email?: string | null
          primary_platforms_json?: Json | null
          region?: string | null
          sources_json?: Json | null
          status?: string | null
          techno_doc_fit_score?: number | null
          updated_at?: string | null
          verification_confidence?: number | null
          website_url?: string | null
          what_they_dislike?: string | null
          what_they_like?: string | null
        }
        Relationships: []
      }
      community_health_metrics: {
        Row: {
          created_at: string | null
          description: string | null
          how_to_measure: string | null
          id: string
          interventions_when_low: string | null
          metric_name: string
          recommended_thresholds: Json | null
          sources_json: Json | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          how_to_measure?: string | null
          id?: string
          interventions_when_low?: string | null
          metric_name: string
          recommended_thresholds?: Json | null
          sources_json?: Json | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          how_to_measure?: string | null
          id?: string
          interventions_when_low?: string | null
          metric_name?: string
          recommended_thresholds?: Json | null
          sources_json?: Json | null
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
      crm_contacts: {
        Row: {
          city: string | null
          contact_source_db: string | null
          country: string | null
          created_at: string | null
          email: string
          external_contact_id: string | null
          full_name: string
          id: string
          last_contacted_at: string | null
          last_verified_at: string | null
          organization_name: string | null
          personalization_notes: string | null
          phone: string | null
          region: string | null
          relationship_status: string | null
          role_title: string | null
          secondary_emails_json: Json | null
          stakeholder_type: string | null
          suppression_status: string | null
          tags_json: Json | null
          updated_at: string | null
          verification_confidence: number | null
        }
        Insert: {
          city?: string | null
          contact_source_db?: string | null
          country?: string | null
          created_at?: string | null
          email: string
          external_contact_id?: string | null
          full_name: string
          id?: string
          last_contacted_at?: string | null
          last_verified_at?: string | null
          organization_name?: string | null
          personalization_notes?: string | null
          phone?: string | null
          region?: string | null
          relationship_status?: string | null
          role_title?: string | null
          secondary_emails_json?: Json | null
          stakeholder_type?: string | null
          suppression_status?: string | null
          tags_json?: Json | null
          updated_at?: string | null
          verification_confidence?: number | null
        }
        Update: {
          city?: string | null
          contact_source_db?: string | null
          country?: string | null
          created_at?: string | null
          email?: string
          external_contact_id?: string | null
          full_name?: string
          id?: string
          last_contacted_at?: string | null
          last_verified_at?: string | null
          organization_name?: string | null
          personalization_notes?: string | null
          phone?: string | null
          region?: string | null
          relationship_status?: string | null
          role_title?: string | null
          secondary_emails_json?: Json | null
          stakeholder_type?: string | null
          suppression_status?: string | null
          tags_json?: Json | null
          updated_at?: string | null
          verification_confidence?: number | null
        }
        Relationships: []
      }
      data_imports: {
        Row: {
          completed_at: string | null
          created_at: string
          entity_type: string
          error_log: Json | null
          id: string
          import_name: string
          import_status: string | null
          imported_by: string | null
          records_failed: number | null
          records_imported: number | null
          source_file: string | null
          started_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          entity_type: string
          error_log?: Json | null
          id?: string
          import_name: string
          import_status?: string | null
          imported_by?: string | null
          records_failed?: number | null
          records_imported?: number | null
          source_file?: string | null
          started_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          entity_type?: string
          error_log?: Json | null
          id?: string
          import_name?: string
          import_status?: string | null
          imported_by?: string | null
          records_failed?: number | null
          records_imported?: number | null
          source_file?: string | null
          started_at?: string | null
        }
        Relationships: []
      }
      decision_records: {
        Row: {
          consequences: string | null
          context: string | null
          created_at: string | null
          decision: string | null
          decision_type: string | null
          id: string
          sources_json: Json | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          consequences?: string | null
          context?: string | null
          created_at?: string | null
          decision?: string | null
          decision_type?: string | null
          id?: string
          sources_json?: Json | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          consequences?: string | null
          context?: string | null
          created_at?: string | null
          decision?: string | null
          decision_type?: string | null
          id?: string
          sources_json?: Json | null
          status?: string | null
          title?: string
          updated_at?: string | null
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
      doggy_agent_issues: {
        Row: {
          affected_component: string | null
          affected_doggy: string | null
          auto_fixable: boolean | null
          created_at: string
          description: string
          detection_source: string
          fix_applied: boolean | null
          fix_applied_at: string | null
          fix_description: string | null
          hq_approved: boolean | null
          hq_approved_at: string | null
          hq_suggestion: string | null
          id: string
          issue_type: string
          metadata: Json | null
          resolved_at: string | null
          severity: string
        }
        Insert: {
          affected_component?: string | null
          affected_doggy?: string | null
          auto_fixable?: boolean | null
          created_at?: string
          description: string
          detection_source: string
          fix_applied?: boolean | null
          fix_applied_at?: string | null
          fix_description?: string | null
          hq_approved?: boolean | null
          hq_approved_at?: string | null
          hq_suggestion?: string | null
          id?: string
          issue_type: string
          metadata?: Json | null
          resolved_at?: string | null
          severity?: string
        }
        Update: {
          affected_component?: string | null
          affected_doggy?: string | null
          auto_fixable?: boolean | null
          created_at?: string
          description?: string
          detection_source?: string
          fix_applied?: boolean | null
          fix_applied_at?: string | null
          fix_description?: string | null
          hq_approved?: boolean | null
          hq_approved_at?: string | null
          hq_suggestion?: string | null
          id?: string
          issue_type?: string
          metadata?: Json | null
          resolved_at?: string | null
          severity?: string
        }
        Relationships: []
      }
      doggy_agent_runs: {
        Row: {
          error_message: string | null
          finished_at: string | null
          health_report: Json | null
          hq_suggestions_created: number | null
          id: string
          issues_auto_fixed: number | null
          issues_detected: number | null
          performance_score: number | null
          run_type: string
          started_at: string
          status: string
          virality_score: number | null
        }
        Insert: {
          error_message?: string | null
          finished_at?: string | null
          health_report?: Json | null
          hq_suggestions_created?: number | null
          id?: string
          issues_auto_fixed?: number | null
          issues_detected?: number | null
          performance_score?: number | null
          run_type: string
          started_at?: string
          status?: string
          virality_score?: number | null
        }
        Update: {
          error_message?: string | null
          finished_at?: string | null
          health_report?: Json | null
          hq_suggestions_created?: number | null
          id?: string
          issues_auto_fixed?: number | null
          issues_detected?: number | null
          performance_score?: number | null
          run_type?: string
          started_at?: string
          status?: string
          virality_score?: number | null
        }
        Relationships: []
      }
      doggy_analytics: {
        Row: {
          action_type: string
          created_at: string | null
          id: string
          variant_id: string | null
          variant_name: string
        }
        Insert: {
          action_type: string
          created_at?: string | null
          id?: string
          variant_id?: string | null
          variant_name: string
        }
        Update: {
          action_type?: string
          created_at?: string | null
          id?: string
          variant_id?: string | null
          variant_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "doggy_analytics_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "doggy_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      doggy_analytics_insights: {
        Row: {
          confidence_score: number | null
          consensus_models: string[] | null
          created_at: string
          data_snapshot: Json | null
          detailed_analysis: string | null
          expires_at: string | null
          id: string
          insight_type: string
          model_name: string | null
          model_used: string
          recommendations: Json | null
          summary: string
          time_period_end: string | null
          time_period_start: string | null
          title: string
        }
        Insert: {
          confidence_score?: number | null
          consensus_models?: string[] | null
          created_at?: string
          data_snapshot?: Json | null
          detailed_analysis?: string | null
          expires_at?: string | null
          id?: string
          insight_type: string
          model_name?: string | null
          model_used: string
          recommendations?: Json | null
          summary: string
          time_period_end?: string | null
          time_period_start?: string | null
          title: string
        }
        Update: {
          confidence_score?: number | null
          consensus_models?: string[] | null
          created_at?: string
          data_snapshot?: Json | null
          detailed_analysis?: string | null
          expires_at?: string | null
          id?: string
          insight_type?: string
          model_name?: string | null
          model_used?: string
          recommendations?: Json | null
          summary?: string
          time_period_end?: string | null
          time_period_start?: string | null
          title?: string
        }
        Relationships: []
      }
      doggy_auto_fixes: {
        Row: {
          after_state: Json | null
          applied_at: string
          before_state: Json | null
          fix_type: string
          id: string
          issue_id: string | null
          rollback_at: string | null
          rollback_reason: string | null
          success: boolean | null
          target_component: string
        }
        Insert: {
          after_state?: Json | null
          applied_at?: string
          before_state?: Json | null
          fix_type: string
          id?: string
          issue_id?: string | null
          rollback_at?: string | null
          rollback_reason?: string | null
          success?: boolean | null
          target_component: string
        }
        Update: {
          after_state?: Json | null
          applied_at?: string
          before_state?: Json | null
          fix_type?: string
          id?: string
          issue_id?: string | null
          rollback_at?: string | null
          rollback_reason?: string | null
          success?: boolean | null
          target_component?: string
        }
        Relationships: [
          {
            foreignKeyName: "doggy_auto_fixes_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "doggy_agent_issues"
            referencedColumns: ["id"]
          },
        ]
      }
      doggy_error_logs: {
        Row: {
          action_attempted: string | null
          created_at: string
          doggy_name: string | null
          error_message: string
          error_type: string
          id: string
          page_source: string | null
          session_id: string | null
          stack_trace: string | null
          user_agent: string | null
        }
        Insert: {
          action_attempted?: string | null
          created_at?: string
          doggy_name?: string | null
          error_message: string
          error_type: string
          id?: string
          page_source?: string | null
          session_id?: string | null
          stack_trace?: string | null
          user_agent?: string | null
        }
        Update: {
          action_attempted?: string | null
          created_at?: string
          doggy_name?: string | null
          error_message?: string
          error_type?: string
          id?: string
          page_source?: string | null
          session_id?: string | null
          stack_trace?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      doggy_page_analytics: {
        Row: {
          created_at: string
          doggy_name: string | null
          event_type: string
          id: string
          link_clicked: string | null
          metadata: Json | null
          page_source: string
          referrer: string | null
          session_id: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          doggy_name?: string | null
          event_type: string
          id?: string
          link_clicked?: string | null
          metadata?: Json | null
          page_source: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          doggy_name?: string | null
          event_type?: string
          id?: string
          link_clicked?: string | null
          metadata?: Json | null
          page_source?: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      doggy_placeholders: {
        Row: {
          created_at: string | null
          created_by: string | null
          doggy_variant: string
          entity_id: string
          entity_name: string
          entity_type: string
          id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          doggy_variant: string
          entity_id: string
          entity_name: string
          entity_type: string
          id?: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          doggy_variant?: string
          entity_id?: string
          entity_name?: string
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      doggy_share_events: {
        Row: {
          chain_depth: number | null
          click_through: boolean | null
          click_through_at: string | null
          country_code: string | null
          created_at: string
          device_type: string | null
          doggy_name: string
          doggy_slug: string | null
          id: string
          parent_share_id: string | null
          platform: string
          referrer: string | null
          referrer_platform: string | null
          session_id: string | null
          share_type: string
          share_url: string | null
          user_agent: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          variant_id: string | null
        }
        Insert: {
          chain_depth?: number | null
          click_through?: boolean | null
          click_through_at?: string | null
          country_code?: string | null
          created_at?: string
          device_type?: string | null
          doggy_name: string
          doggy_slug?: string | null
          id?: string
          parent_share_id?: string | null
          platform: string
          referrer?: string | null
          referrer_platform?: string | null
          session_id?: string | null
          share_type?: string
          share_url?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          variant_id?: string | null
        }
        Update: {
          chain_depth?: number | null
          click_through?: boolean | null
          click_through_at?: string | null
          country_code?: string | null
          created_at?: string
          device_type?: string | null
          doggy_name?: string
          doggy_slug?: string | null
          id?: string
          parent_share_id?: string | null
          platform?: string
          referrer?: string | null
          referrer_platform?: string | null
          session_id?: string | null
          share_type?: string
          share_url?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doggy_share_events_parent_share_id_fkey"
            columns: ["parent_share_id"]
            isOneToOne: false
            referencedRelation: "doggy_share_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doggy_share_events_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "doggy_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      doggy_share_leaderboard: {
        Row: {
          created_at: string
          display_name: string
          id: string
          last_share_at: string
          session_id: string | null
          share_count: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          display_name: string
          id?: string
          last_share_at?: string
          session_id?: string | null
          share_count?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          last_share_at?: string
          session_id?: string | null
          share_count?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      doggy_variants: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          name: string
          personality: string | null
          slug: string
          sort_order: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          name: string
          personality?: string | null
          slug: string
          sort_order?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          name?: string
          personality?: string | null
          slug?: string
          sort_order?: number | null
          status?: string | null
          updated_at?: string | null
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
      email_sequences: {
        Row: {
          ab_variant_group: string | null
          body_template_markdown: string
          campaign_id: string | null
          created_at: string | null
          delay_days: number | null
          id: string
          personalization_fields_json: Json | null
          safety_notes: string | null
          sequence_step: number
          subject_template: string
        }
        Insert: {
          ab_variant_group?: string | null
          body_template_markdown: string
          campaign_id?: string | null
          created_at?: string | null
          delay_days?: number | null
          id?: string
          personalization_fields_json?: Json | null
          safety_notes?: string | null
          sequence_step?: number
          subject_template: string
        }
        Update: {
          ab_variant_group?: string | null
          body_template_markdown?: string
          campaign_id?: string | null
          created_at?: string | null
          delay_days?: number | null
          id?: string
          personalization_fields_json?: Json | null
          safety_notes?: string | null
          sequence_step?: number
          subject_template?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_sequences_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      events_livecoding: {
        Row: {
          city: string | null
          collective_id: string | null
          contact_email: string | null
          country: string | null
          created_at: string | null
          event_name: string
          event_url: string | null
          id: string
          last_verified_at: string | null
          platform: string | null
          recurring: boolean | null
          region: string | null
          schedule_notes: string | null
          source_url: string | null
          updated_at: string | null
          venue: string | null
        }
        Insert: {
          city?: string | null
          collective_id?: string | null
          contact_email?: string | null
          country?: string | null
          created_at?: string | null
          event_name: string
          event_url?: string | null
          id?: string
          last_verified_at?: string | null
          platform?: string | null
          recurring?: boolean | null
          region?: string | null
          schedule_notes?: string | null
          source_url?: string | null
          updated_at?: string | null
          venue?: string | null
        }
        Update: {
          city?: string | null
          collective_id?: string | null
          contact_email?: string | null
          country?: string | null
          created_at?: string | null
          event_name?: string
          event_url?: string | null
          id?: string
          last_verified_at?: string | null
          platform?: string | null
          recurring?: boolean | null
          region?: string | null
          schedule_notes?: string | null
          source_url?: string | null
          updated_at?: string | null
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_livecoding_collective_id_fkey"
            columns: ["collective_id"]
            isOneToOne: false
            referencedRelation: "collectives"
            referencedColumns: ["id"]
          },
        ]
      }
      gear_agent_runs: {
        Row: {
          brands_processed: number | null
          completed_at: string | null
          contacts_found: number | null
          created_by: string | null
          error_message: string | null
          id: string
          models_used: string[] | null
          parameters: Json | null
          results: Json | null
          run_type: string
          started_at: string | null
          status: string | null
        }
        Insert: {
          brands_processed?: number | null
          completed_at?: string | null
          contacts_found?: number | null
          created_by?: string | null
          error_message?: string | null
          id?: string
          models_used?: string[] | null
          parameters?: Json | null
          results?: Json | null
          run_type: string
          started_at?: string | null
          status?: string | null
        }
        Update: {
          brands_processed?: number | null
          completed_at?: string | null
          contacts_found?: number | null
          created_by?: string | null
          error_message?: string | null
          id?: string
          models_used?: string[] | null
          parameters?: Json | null
          results?: Json | null
          run_type?: string
          started_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      gear_brands: {
        Row: {
          brand_aliases: Json | null
          brand_name: string
          brand_website_url: string | null
          collaboration_friendliness_score: number | null
          collaboration_policy_summary: string | null
          collaboration_policy_url: string | null
          created_at: string | null
          created_by: string | null
          headquarters_city: string | null
          headquarters_country: string | null
          id: string
          last_verified_at: string | null
          official_contact_page_url: string | null
          official_press_page_url: string | null
          ownership_notes: string | null
          parent_company_name: string | null
          parent_company_website: string | null
          primary_language: string | null
          sources_json: Json | null
          status: string | null
          support_policy_summary: string | null
          support_url: string | null
          updated_at: string | null
          verification_confidence: number | null
        }
        Insert: {
          brand_aliases?: Json | null
          brand_name: string
          brand_website_url?: string | null
          collaboration_friendliness_score?: number | null
          collaboration_policy_summary?: string | null
          collaboration_policy_url?: string | null
          created_at?: string | null
          created_by?: string | null
          headquarters_city?: string | null
          headquarters_country?: string | null
          id?: string
          last_verified_at?: string | null
          official_contact_page_url?: string | null
          official_press_page_url?: string | null
          ownership_notes?: string | null
          parent_company_name?: string | null
          parent_company_website?: string | null
          primary_language?: string | null
          sources_json?: Json | null
          status?: string | null
          support_policy_summary?: string | null
          support_url?: string | null
          updated_at?: string | null
          verification_confidence?: number | null
        }
        Update: {
          brand_aliases?: Json | null
          brand_name?: string
          brand_website_url?: string | null
          collaboration_friendliness_score?: number | null
          collaboration_policy_summary?: string | null
          collaboration_policy_url?: string | null
          created_at?: string | null
          created_by?: string | null
          headquarters_city?: string | null
          headquarters_country?: string | null
          id?: string
          last_verified_at?: string | null
          official_contact_page_url?: string | null
          official_press_page_url?: string | null
          ownership_notes?: string | null
          parent_company_name?: string | null
          parent_company_website?: string | null
          primary_language?: string | null
          sources_json?: Json | null
          status?: string | null
          support_policy_summary?: string | null
          support_url?: string | null
          updated_at?: string | null
          verification_confidence?: number | null
        }
        Relationships: []
      }
      gear_catalog: {
        Row: {
          brand: string
          category: string
          created_at: string | null
          current_price_notes: string | null
          current_price_usd_high: number | null
          current_price_usd_low: number | null
          data_sources: string[] | null
          designer: string | null
          discontinued_year: number | null
          effects_onboard: string | null
          embedding: string | null
          envelopes: string | null
          famous_tracks: Json | null
          filters: string | null
          format: string | null
          id: string
          image_attribution: Json | null
          image_url: string | null
          instrument_type: string | null
          io_connectivity: string | null
          launch_price_notes: string | null
          launch_price_usd: number | null
          lfos: string | null
          limitations: string | null
          manufacturer_company: string | null
          midi_sync: string | null
          model: string | null
          modifications: string | null
          name: string
          notable_artists: Json | null
          notable_features: string | null
          official_url: string | null
          oscillator_types: string | null
          oscillators_per_voice: string | null
          polyphony: string | null
          production_units: number | null
          related_gear: string[] | null
          release_year: number | null
          sampling_spec: string | null
          sequencer_arp: string | null
          short_description: string | null
          sources: string[] | null
          strengths: string | null
          synthesis_type: string | null
          tags: string[] | null
          techno_applications: string | null
          timbrality: string | null
          updated_at: string | null
          youtube_videos: Json | null
        }
        Insert: {
          brand: string
          category: string
          created_at?: string | null
          current_price_notes?: string | null
          current_price_usd_high?: number | null
          current_price_usd_low?: number | null
          data_sources?: string[] | null
          designer?: string | null
          discontinued_year?: number | null
          effects_onboard?: string | null
          embedding?: string | null
          envelopes?: string | null
          famous_tracks?: Json | null
          filters?: string | null
          format?: string | null
          id: string
          image_attribution?: Json | null
          image_url?: string | null
          instrument_type?: string | null
          io_connectivity?: string | null
          launch_price_notes?: string | null
          launch_price_usd?: number | null
          lfos?: string | null
          limitations?: string | null
          manufacturer_company?: string | null
          midi_sync?: string | null
          model?: string | null
          modifications?: string | null
          name: string
          notable_artists?: Json | null
          notable_features?: string | null
          official_url?: string | null
          oscillator_types?: string | null
          oscillators_per_voice?: string | null
          polyphony?: string | null
          production_units?: number | null
          related_gear?: string[] | null
          release_year?: number | null
          sampling_spec?: string | null
          sequencer_arp?: string | null
          short_description?: string | null
          sources?: string[] | null
          strengths?: string | null
          synthesis_type?: string | null
          tags?: string[] | null
          techno_applications?: string | null
          timbrality?: string | null
          updated_at?: string | null
          youtube_videos?: Json | null
        }
        Update: {
          brand?: string
          category?: string
          created_at?: string | null
          current_price_notes?: string | null
          current_price_usd_high?: number | null
          current_price_usd_low?: number | null
          data_sources?: string[] | null
          designer?: string | null
          discontinued_year?: number | null
          effects_onboard?: string | null
          embedding?: string | null
          envelopes?: string | null
          famous_tracks?: Json | null
          filters?: string | null
          format?: string | null
          id?: string
          image_attribution?: Json | null
          image_url?: string | null
          instrument_type?: string | null
          io_connectivity?: string | null
          launch_price_notes?: string | null
          launch_price_usd?: number | null
          lfos?: string | null
          limitations?: string | null
          manufacturer_company?: string | null
          midi_sync?: string | null
          model?: string | null
          modifications?: string | null
          name?: string
          notable_artists?: Json | null
          notable_features?: string | null
          official_url?: string | null
          oscillator_types?: string | null
          oscillators_per_voice?: string | null
          polyphony?: string | null
          production_units?: number | null
          related_gear?: string[] | null
          release_year?: number | null
          sampling_spec?: string | null
          sequencer_arp?: string | null
          short_description?: string | null
          sources?: string[] | null
          strengths?: string | null
          synthesis_type?: string | null
          tags?: string[] | null
          techno_applications?: string | null
          timbrality?: string | null
          updated_at?: string | null
          youtube_videos?: Json | null
        }
        Relationships: []
      }
      gear_outreach_history: {
        Row: {
          brand_id: string | null
          campaign_name: string | null
          contact_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          message_content: string | null
          message_summary: string | null
          next_action_date: string | null
          next_action_note: string | null
          outreach_date: string | null
          outreach_type: string
          response_notes: string | null
          status: string | null
          subject_line: string | null
          updated_at: string | null
        }
        Insert: {
          brand_id?: string | null
          campaign_name?: string | null
          contact_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          message_content?: string | null
          message_summary?: string | null
          next_action_date?: string | null
          next_action_note?: string | null
          outreach_date?: string | null
          outreach_type: string
          response_notes?: string | null
          status?: string | null
          subject_line?: string | null
          updated_at?: string | null
        }
        Update: {
          brand_id?: string | null
          campaign_name?: string | null
          contact_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          message_content?: string | null
          message_summary?: string | null
          next_action_date?: string | null
          next_action_note?: string | null
          outreach_date?: string | null
          outreach_type?: string
          response_notes?: string | null
          status?: string | null
          subject_line?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gear_outreach_history_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "gear_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gear_outreach_history_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "brand_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      gear_products: {
        Row: {
          brand_id: string | null
          created_at: string | null
          id: string
          key_tech_tags: string[] | null
          last_verified_at: string | null
          notable_artists_in_project: Json | null
          notes: string | null
          original_gear_id: string | null
          product_name: string
          product_page_url: string | null
          product_status: string | null
          product_type: string | null
          sources_json: Json | null
          synthesis_type: string | null
          updated_at: string | null
          year_introduced: number | null
        }
        Insert: {
          brand_id?: string | null
          created_at?: string | null
          id?: string
          key_tech_tags?: string[] | null
          last_verified_at?: string | null
          notable_artists_in_project?: Json | null
          notes?: string | null
          original_gear_id?: string | null
          product_name: string
          product_page_url?: string | null
          product_status?: string | null
          product_type?: string | null
          sources_json?: Json | null
          synthesis_type?: string | null
          updated_at?: string | null
          year_introduced?: number | null
        }
        Update: {
          brand_id?: string | null
          created_at?: string | null
          id?: string
          key_tech_tags?: string[] | null
          last_verified_at?: string | null
          notable_artists_in_project?: Json | null
          notes?: string | null
          original_gear_id?: string | null
          product_name?: string
          product_page_url?: string | null
          product_status?: string | null
          product_type?: string | null
          sources_json?: Json | null
          synthesis_type?: string | null
          updated_at?: string | null
          year_introduced?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "gear_products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "gear_brands"
            referencedColumns: ["id"]
          },
        ]
      }
      gear_scrape_audit_log: {
        Row: {
          action: string
          brand_name: string | null
          created_at: string | null
          created_by: string | null
          error_message: string | null
          id: string
          models_used: string[] | null
          parameters: Json | null
          records_affected: number | null
          source_url: string | null
          status: string | null
        }
        Insert: {
          action: string
          brand_name?: string | null
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          id?: string
          models_used?: string[] | null
          parameters?: Json | null
          records_affected?: number | null
          source_url?: string | null
          status?: string | null
        }
        Update: {
          action?: string
          brand_name?: string | null
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          id?: string
          models_used?: string[] | null
          parameters?: Json | null
          records_affected?: number | null
          source_url?: string | null
          status?: string | null
        }
        Relationships: []
      }
      governance_models: {
        Row: {
          best_for: string | null
          created_at: string | null
          description: string | null
          id: string
          model_name: string
          pros_cons: Json | null
          recommended_for_techno_doc: boolean | null
          recommended_variant_notes: string | null
          risks: string | null
          sources_json: Json | null
        }
        Insert: {
          best_for?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          model_name: string
          pros_cons?: Json | null
          recommended_for_techno_doc?: boolean | null
          recommended_variant_notes?: string | null
          risks?: string | null
          sources_json?: Json | null
        }
        Update: {
          best_for?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          model_name?: string
          pros_cons?: Json | null
          recommended_for_techno_doc?: boolean | null
          recommended_variant_notes?: string | null
          risks?: string | null
          sources_json?: Json | null
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
      journalist_contacts: {
        Row: {
          authority_score: number | null
          bio_summary: string | null
          coverage_focus_tags: string[] | null
          created_at: string | null
          created_by: string | null
          credibility_notes: string | null
          data_source_url: string | null
          email: string | null
          enrichment_confidence: number | null
          full_name: string
          gdpr_consent_note: string | null
          id: string
          is_active: boolean | null
          key_interviews: Json | null
          key_recent_articles: Json | null
          languages: string[] | null
          last_verified_at: string | null
          location_city: string | null
          location_country: string | null
          outlet_id: string | null
          phone: string | null
          preferred_contact_method: string | null
          press_submission_url: string | null
          relationship_status: string | null
          role_title: string | null
          social_links: Json | null
          underground_credibility_score: number | null
          updated_at: string | null
          website: string | null
          what_makes_them_tick: string | null
        }
        Insert: {
          authority_score?: number | null
          bio_summary?: string | null
          coverage_focus_tags?: string[] | null
          created_at?: string | null
          created_by?: string | null
          credibility_notes?: string | null
          data_source_url?: string | null
          email?: string | null
          enrichment_confidence?: number | null
          full_name: string
          gdpr_consent_note?: string | null
          id?: string
          is_active?: boolean | null
          key_interviews?: Json | null
          key_recent_articles?: Json | null
          languages?: string[] | null
          last_verified_at?: string | null
          location_city?: string | null
          location_country?: string | null
          outlet_id?: string | null
          phone?: string | null
          preferred_contact_method?: string | null
          press_submission_url?: string | null
          relationship_status?: string | null
          role_title?: string | null
          social_links?: Json | null
          underground_credibility_score?: number | null
          updated_at?: string | null
          website?: string | null
          what_makes_them_tick?: string | null
        }
        Update: {
          authority_score?: number | null
          bio_summary?: string | null
          coverage_focus_tags?: string[] | null
          created_at?: string | null
          created_by?: string | null
          credibility_notes?: string | null
          data_source_url?: string | null
          email?: string | null
          enrichment_confidence?: number | null
          full_name?: string
          gdpr_consent_note?: string | null
          id?: string
          is_active?: boolean | null
          key_interviews?: Json | null
          key_recent_articles?: Json | null
          languages?: string[] | null
          last_verified_at?: string | null
          location_city?: string | null
          location_country?: string | null
          outlet_id?: string | null
          phone?: string | null
          preferred_contact_method?: string | null
          press_submission_url?: string | null
          relationship_status?: string | null
          role_title?: string | null
          social_links?: Json | null
          underground_credibility_score?: number | null
          updated_at?: string | null
          website?: string | null
          what_makes_them_tick?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journalist_contacts_outlet_id_fkey"
            columns: ["outlet_id"]
            isOneToOne: false
            referencedRelation: "media_outlets"
            referencedColumns: ["id"]
          },
        ]
      }
      label_contacts: {
        Row: {
          best_approach_notes: string | null
          collaboration_preferences_summary: string | null
          contact_form_url: string | null
          contact_person_name: string | null
          created_at: string | null
          department: string | null
          email: string | null
          enrichment_confidence: number | null
          id: string
          label_id: string | null
          last_verified_at: string | null
          location_city: string | null
          location_country: string | null
          phone: string | null
          professional_social_links_json: Json | null
          role_title: string | null
          source_url: string | null
          updated_at: string | null
          what_they_dislike: string | null
          what_they_like: string | null
        }
        Insert: {
          best_approach_notes?: string | null
          collaboration_preferences_summary?: string | null
          contact_form_url?: string | null
          contact_person_name?: string | null
          created_at?: string | null
          department?: string | null
          email?: string | null
          enrichment_confidence?: number | null
          id?: string
          label_id?: string | null
          last_verified_at?: string | null
          location_city?: string | null
          location_country?: string | null
          phone?: string | null
          professional_social_links_json?: Json | null
          role_title?: string | null
          source_url?: string | null
          updated_at?: string | null
          what_they_dislike?: string | null
          what_they_like?: string | null
        }
        Update: {
          best_approach_notes?: string | null
          collaboration_preferences_summary?: string | null
          contact_form_url?: string | null
          contact_person_name?: string | null
          created_at?: string | null
          department?: string | null
          email?: string | null
          enrichment_confidence?: number | null
          id?: string
          label_id?: string | null
          last_verified_at?: string | null
          location_city?: string | null
          location_country?: string | null
          phone?: string | null
          professional_social_links_json?: Json | null
          role_title?: string | null
          source_url?: string | null
          updated_at?: string | null
          what_they_dislike?: string | null
          what_they_like?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "label_contacts_label_id_fkey"
            columns: ["label_id"]
            isOneToOne: false
            referencedRelation: "labels"
            referencedColumns: ["id"]
          },
        ]
      }
      labels: {
        Row: {
          address: string | null
          collaborations_policy_url: string | null
          contact_form_url: string | null
          created_at: string | null
          general_email: string | null
          headquarters_city: string | null
          headquarters_country: string | null
          id: string
          label_name: string
          label_type: string | null
          label_website_url: string | null
          last_verified_at: string | null
          notes: string | null
          parent_company: string | null
          phone: string | null
          roster_url: string | null
          sources_json: Json | null
          submissions_policy_url: string | null
          updated_at: string | null
          verification_confidence: number | null
        }
        Insert: {
          address?: string | null
          collaborations_policy_url?: string | null
          contact_form_url?: string | null
          created_at?: string | null
          general_email?: string | null
          headquarters_city?: string | null
          headquarters_country?: string | null
          id?: string
          label_name: string
          label_type?: string | null
          label_website_url?: string | null
          last_verified_at?: string | null
          notes?: string | null
          parent_company?: string | null
          phone?: string | null
          roster_url?: string | null
          sources_json?: Json | null
          submissions_policy_url?: string | null
          updated_at?: string | null
          verification_confidence?: number | null
        }
        Update: {
          address?: string | null
          collaborations_policy_url?: string | null
          contact_form_url?: string | null
          created_at?: string | null
          general_email?: string | null
          headquarters_city?: string | null
          headquarters_country?: string | null
          id?: string
          label_name?: string
          label_type?: string | null
          label_website_url?: string | null
          last_verified_at?: string | null
          notes?: string | null
          parent_company?: string | null
          phone?: string | null
          roster_url?: string | null
          sources_json?: Json | null
          submissions_policy_url?: string | null
          updated_at?: string | null
          verification_confidence?: number | null
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
      media_outlets: {
        Row: {
          activity_status: string | null
          audience_size_estimate: string | null
          authority_score: number | null
          city: string | null
          country: string | null
          created_at: string | null
          created_by: string | null
          data_source_url: string | null
          enrichment_confidence: number | null
          genres_focus: string[] | null
          id: string
          last_verified_at: string | null
          notes: string | null
          outlet_name: string
          outlet_type: string
          primary_language: string | null
          region: string | null
          underground_credibility_score: number | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          activity_status?: string | null
          audience_size_estimate?: string | null
          authority_score?: number | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          data_source_url?: string | null
          enrichment_confidence?: number | null
          genres_focus?: string[] | null
          id?: string
          last_verified_at?: string | null
          notes?: string | null
          outlet_name: string
          outlet_type: string
          primary_language?: string | null
          region?: string | null
          underground_credibility_score?: number | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          activity_status?: string | null
          audience_size_estimate?: string | null
          authority_score?: number | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          data_source_url?: string | null
          enrichment_confidence?: number | null
          genres_focus?: string[] | null
          id?: string
          last_verified_at?: string | null
          notes?: string | null
          outlet_name?: string
          outlet_type?: string
          primary_language?: string | null
          region?: string | null
          underground_credibility_score?: number | null
          updated_at?: string | null
          website_url?: string | null
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
      outreach_engine_runs: {
        Row: {
          created_at: string | null
          error_message: string | null
          finished_at: string | null
          id: string
          run_type: string
          started_at: string | null
          stats: Json | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          run_type: string
          started_at?: string | null
          stats?: Json | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          run_type?: string
          started_at?: string | null
          stats?: Json | null
          status?: string | null
        }
        Relationships: []
      }
      outreach_history: {
        Row: {
          campaign_name: string | null
          created_at: string | null
          created_by: string | null
          id: string
          journalist_id: string | null
          message_content: string | null
          message_summary: string | null
          next_action_date: string | null
          next_action_note: string | null
          outlet_id: string | null
          outreach_date: string | null
          outreach_type: string
          response_notes: string | null
          status: string | null
          subject_line: string | null
          updated_at: string | null
        }
        Insert: {
          campaign_name?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          journalist_id?: string | null
          message_content?: string | null
          message_summary?: string | null
          next_action_date?: string | null
          next_action_note?: string | null
          outlet_id?: string | null
          outreach_date?: string | null
          outreach_type: string
          response_notes?: string | null
          status?: string | null
          subject_line?: string | null
          updated_at?: string | null
        }
        Update: {
          campaign_name?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          journalist_id?: string | null
          message_content?: string | null
          message_summary?: string | null
          next_action_date?: string | null
          next_action_note?: string | null
          outlet_id?: string | null
          outreach_date?: string | null
          outreach_type?: string
          response_notes?: string | null
          status?: string | null
          subject_line?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "outreach_history_journalist_id_fkey"
            columns: ["journalist_id"]
            isOneToOne: false
            referencedRelation: "journalist_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outreach_history_outlet_id_fkey"
            columns: ["outlet_id"]
            isOneToOne: false
            referencedRelation: "media_outlets"
            referencedColumns: ["id"]
          },
        ]
      }
      outreach_messages: {
        Row: {
          body_html: string | null
          body_text: string | null
          bounce_reason: string | null
          campaign_id: string | null
          clicked_at: string | null
          contact_id: string | null
          created_at: string | null
          follow_up_due_at: string | null
          id: string
          next_action_notes: string | null
          opened_at: string | null
          reply_detected: boolean | null
          resend_message_id: string | null
          scheduled_for: string | null
          sent_at: string | null
          status: string | null
          subject: string
          updated_at: string | null
        }
        Insert: {
          body_html?: string | null
          body_text?: string | null
          bounce_reason?: string | null
          campaign_id?: string | null
          clicked_at?: string | null
          contact_id?: string | null
          created_at?: string | null
          follow_up_due_at?: string | null
          id?: string
          next_action_notes?: string | null
          opened_at?: string | null
          reply_detected?: boolean | null
          resend_message_id?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          subject: string
          updated_at?: string | null
        }
        Update: {
          body_html?: string | null
          body_text?: string | null
          bounce_reason?: string | null
          campaign_id?: string | null
          clicked_at?: string | null
          contact_id?: string | null
          created_at?: string | null
          follow_up_due_at?: string | null
          id?: string
          next_action_notes?: string | null
          opened_at?: string | null
          reply_detected?: boolean | null
          resend_message_id?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "outreach_messages_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outreach_messages_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
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
      playbook_agent_runs: {
        Row: {
          created_at: string | null
          error_message: string | null
          finished_at: string | null
          id: string
          run_type: string
          started_at: string | null
          stats: Json | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          run_type: string
          started_at?: string | null
          stats?: Json | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          run_type?: string
          started_at?: string | null
          stats?: Json | null
          status?: string | null
        }
        Relationships: []
      }
      playbook_sections: {
        Row: {
          created_at: string | null
          id: string
          last_updated_at: string | null
          section_content_markdown: string | null
          section_description: string | null
          section_key: string
          section_title: string
          sources_json: Json | null
          status: string | null
          updated_by: string | null
          version_number: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_updated_at?: string | null
          section_content_markdown?: string | null
          section_description?: string | null
          section_key: string
          section_title: string
          sources_json?: Json | null
          status?: string | null
          updated_by?: string | null
          version_number?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_updated_at?: string | null
          section_content_markdown?: string | null
          section_description?: string | null
          section_key?: string
          section_title?: string
          sources_json?: Json | null
          status?: string | null
          updated_by?: string | null
          version_number?: number | null
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
      policies: {
        Row: {
          created_at: string | null
          enforcement_process: string | null
          escalation_path: string | null
          id: string
          last_verified_at: string | null
          policy_content_markdown: string | null
          policy_name: string
          policy_type: string | null
          sources_json: Json | null
        }
        Insert: {
          created_at?: string | null
          enforcement_process?: string | null
          escalation_path?: string | null
          id?: string
          last_verified_at?: string | null
          policy_content_markdown?: string | null
          policy_name: string
          policy_type?: string | null
          sources_json?: Json | null
        }
        Update: {
          created_at?: string | null
          enforcement_process?: string | null
          escalation_path?: string | null
          id?: string
          last_verified_at?: string | null
          policy_content_markdown?: string | null
          policy_name?: string
          policy_type?: string | null
          sources_json?: Json | null
        }
        Relationships: []
      }
      pr_agent_runs: {
        Row: {
          completed_at: string | null
          contacts_processed: number | null
          created_by: string | null
          error_message: string | null
          id: string
          models_used: string[] | null
          outlets_processed: number | null
          parameters: Json | null
          results: Json | null
          run_type: string
          started_at: string | null
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          contacts_processed?: number | null
          created_by?: string | null
          error_message?: string | null
          id?: string
          models_used?: string[] | null
          outlets_processed?: number | null
          parameters?: Json | null
          results?: Json | null
          run_type: string
          started_at?: string | null
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          contacts_processed?: number | null
          created_by?: string | null
          error_message?: string | null
          id?: string
          models_used?: string[] | null
          outlets_processed?: number | null
          parameters?: Json | null
          results?: Json | null
          run_type?: string
          started_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      pr_lists_segments: {
        Row: {
          contact_ids: string[] | null
          created_at: string | null
          created_by: string | null
          description: string | null
          filters_json: Json | null
          id: string
          is_active: boolean | null
          name: string
          outlet_ids: string[] | null
          segment_type: string | null
          updated_at: string | null
        }
        Insert: {
          contact_ids?: string[] | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          filters_json?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          outlet_ids?: string[] | null
          segment_type?: string | null
          updated_at?: string | null
        }
        Update: {
          contact_ids?: string[] | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          filters_json?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          outlet_ids?: string[] | null
          segment_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pr_scrape_audit_log: {
        Row: {
          action: string
          created_at: string | null
          created_by: string | null
          error_message: string | null
          id: string
          models_used: string[] | null
          parameters: Json | null
          records_affected: number | null
          source_url: string | null
          status: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          id?: string
          models_used?: string[] | null
          parameters?: Json | null
          records_affected?: number | null
          source_url?: string | null
          status?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          id?: string
          models_used?: string[] | null
          parameters?: Json | null
          records_affected?: number | null
          source_url?: string | null
          status?: string | null
        }
        Relationships: []
      }
      principles_values: {
        Row: {
          created_at: string | null
          do_list: Json | null
          dont_list: Json | null
          id: string
          last_verified_at: string | null
          practical_examples: Json | null
          principle_name: string
          principle_summary: string | null
          related_policies: Json | null
          sources_json: Json | null
          why_it_matters: string | null
        }
        Insert: {
          created_at?: string | null
          do_list?: Json | null
          dont_list?: Json | null
          id?: string
          last_verified_at?: string | null
          practical_examples?: Json | null
          principle_name: string
          principle_summary?: string | null
          related_policies?: Json | null
          sources_json?: Json | null
          why_it_matters?: string | null
        }
        Update: {
          created_at?: string | null
          do_list?: Json | null
          dont_list?: Json | null
          id?: string
          last_verified_at?: string | null
          practical_examples?: Json | null
          principle_name?: string
          principle_summary?: string | null
          related_policies?: Json | null
          sources_json?: Json | null
          why_it_matters?: string | null
        }
        Relationships: []
      }
      processes_workflows: {
        Row: {
          common_failure_modes: string | null
          created_at: string | null
          id: string
          last_verified_at: string | null
          required_roles_json: Json | null
          sources_json: Json | null
          steps_json: Json | null
          success_metrics: string | null
          templates_linked: Json | null
          tools_needed_json: Json | null
          workflow_category: string | null
          workflow_name: string
        }
        Insert: {
          common_failure_modes?: string | null
          created_at?: string | null
          id?: string
          last_verified_at?: string | null
          required_roles_json?: Json | null
          sources_json?: Json | null
          steps_json?: Json | null
          success_metrics?: string | null
          templates_linked?: Json | null
          tools_needed_json?: Json | null
          workflow_category?: string | null
          workflow_name: string
        }
        Update: {
          common_failure_modes?: string | null
          created_at?: string | null
          id?: string
          last_verified_at?: string | null
          required_roles_json?: Json | null
          sources_json?: Json | null
          steps_json?: Json | null
          success_metrics?: string | null
          templates_linked?: Json | null
          tools_needed_json?: Json | null
          workflow_category?: string | null
          workflow_name?: string
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
      referrals: {
        Row: {
          created_at: string
          email_notification_sent_at: string | null
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
          email_notification_sent_at?: string | null
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
          email_notification_sent_at?: string | null
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
      source_domain_registry: {
        Row: {
          category: string | null
          created_at: string
          display_name: string | null
          domain: string
          domain_id: string
          is_blocked: boolean | null
          is_primary_source: boolean | null
          notes: string | null
          quality_score: number | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          display_name?: string | null
          domain: string
          domain_id?: string
          is_blocked?: boolean | null
          is_primary_source?: boolean | null
          notes?: string | null
          quality_score?: number | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          display_name?: string | null
          domain?: string
          domain_id?: string
          is_blocked?: boolean | null
          is_primary_source?: boolean | null
          notes?: string | null
          quality_score?: number | null
          updated_at?: string
        }
        Relationships: []
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
      suppression_list: {
        Row: {
          added_at: string | null
          email: string
          id: string
          reason: string | null
        }
        Insert: {
          added_at?: string | null
          email: string
          id?: string
          reason?: string | null
        }
        Update: {
          added_at?: string | null
          email?: string
          id?: string
          reason?: string | null
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
      techno_journalists: {
        Row: {
          bio: string | null
          city: string | null
          contact_form_url: string | null
          country: string | null
          created_at: string
          email: string | null
          focus_areas: Json | null
          id: string
          imported_at: string | null
          journalist_name: string
          journalist_name_citation: string | null
          last_verified_at: string | null
          linkedin_url: string | null
          location: string | null
          location_citation: string | null
          notes: string | null
          publications: Json | null
          region: string | null
          relationship_status: string | null
          sources_json: Json | null
          stakeholder_type: string | null
          techno_doc_fit_score: number | null
          twitter_handle: string | null
          updated_at: string
          verification_confidence: number | null
          website_url: string | null
        }
        Insert: {
          bio?: string | null
          city?: string | null
          contact_form_url?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          focus_areas?: Json | null
          id?: string
          imported_at?: string | null
          journalist_name: string
          journalist_name_citation?: string | null
          last_verified_at?: string | null
          linkedin_url?: string | null
          location?: string | null
          location_citation?: string | null
          notes?: string | null
          publications?: Json | null
          region?: string | null
          relationship_status?: string | null
          sources_json?: Json | null
          stakeholder_type?: string | null
          techno_doc_fit_score?: number | null
          twitter_handle?: string | null
          updated_at?: string
          verification_confidence?: number | null
          website_url?: string | null
        }
        Update: {
          bio?: string | null
          city?: string | null
          contact_form_url?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          focus_areas?: Json | null
          id?: string
          imported_at?: string | null
          journalist_name?: string
          journalist_name_citation?: string | null
          last_verified_at?: string | null
          linkedin_url?: string | null
          location?: string | null
          location_citation?: string | null
          notes?: string | null
          publications?: Json | null
          region?: string | null
          relationship_status?: string | null
          sources_json?: Json | null
          stakeholder_type?: string | null
          techno_doc_fit_score?: number | null
          twitter_handle?: string | null
          updated_at?: string
          verification_confidence?: number | null
          website_url?: string | null
        }
        Relationships: []
      }
      templates_assets: {
        Row: {
          created_at: string | null
          id: string
          last_verified_at: string | null
          sources_json: Json | null
          template_content_markdown: string | null
          template_name: string
          template_type: string | null
          usage_instructions: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_verified_at?: string | null
          sources_json?: Json | null
          template_content_markdown?: string | null
          template_name: string
          template_type?: string | null
          usage_instructions?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_verified_at?: string | null
          sources_json?: Json | null
          template_content_markdown?: string | null
          template_name?: string
          template_type?: string | null
          usage_instructions?: string | null
        }
        Relationships: []
      }
      templates_library: {
        Row: {
          best_used_when: string | null
          body_template_markdown: string
          created_at: string | null
          do_not_use_when: string | null
          id: string
          purpose: string | null
          stakeholder_type: string | null
          subject_template: string
          template_name: string
          tone: string | null
          updated_at: string | null
        }
        Insert: {
          best_used_when?: string | null
          body_template_markdown: string
          created_at?: string | null
          do_not_use_when?: string | null
          id?: string
          purpose?: string | null
          stakeholder_type?: string | null
          subject_template: string
          template_name: string
          tone?: string | null
          updated_at?: string | null
        }
        Update: {
          best_used_when?: string | null
          body_template_markdown?: string
          created_at?: string | null
          do_not_use_when?: string | null
          id?: string
          purpose?: string | null
          stakeholder_type?: string | null
          subject_template?: string
          template_name?: string
          tone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tkt_events: {
        Row: {
          created_at: string
          description: string | null
          doors_open: string | null
          end_date: string | null
          id: string
          image_url: string | null
          name: string
          organization_id: string
          settings: Json | null
          slug: string
          start_date: string
          status: string
          updated_at: string
          venue_address: string | null
          venue_name: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          doors_open?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          name: string
          organization_id: string
          settings?: Json | null
          slug: string
          start_date: string
          status?: string
          updated_at?: string
          venue_address?: string | null
          venue_name?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          doors_open?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          name?: string
          organization_id?: string
          settings?: Json | null
          slug?: string
          start_date?: string
          status?: string
          updated_at?: string
          venue_address?: string | null
          venue_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tkt_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "tkt_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tkt_order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          quantity: number
          subtotal_cents: number
          ticket_type_id: string
          unit_price_cents: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          quantity: number
          subtotal_cents: number
          ticket_type_id: string
          unit_price_cents: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          quantity?: number
          subtotal_cents?: number
          ticket_type_id?: string
          unit_price_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "tkt_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "tkt_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tkt_order_items_ticket_type_id_fkey"
            columns: ["ticket_type_id"]
            isOneToOne: false
            referencedRelation: "tkt_ticket_types"
            referencedColumns: ["id"]
          },
        ]
      }
      tkt_orders: {
        Row: {
          created_at: string
          currency: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          event_id: string
          id: string
          metadata: Json | null
          notes: string | null
          order_number: string
          payment_method: string | null
          payment_reference: string | null
          status: string
          total_cents: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          event_id: string
          id?: string
          metadata?: Json | null
          notes?: string | null
          order_number: string
          payment_method?: string | null
          payment_reference?: string | null
          status?: string
          total_cents: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          event_id?: string
          id?: string
          metadata?: Json | null
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          payment_reference?: string | null
          status?: string
          total_cents?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tkt_orders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "tkt_events"
            referencedColumns: ["id"]
          },
        ]
      }
      tkt_organizations: {
        Row: {
          contact_email: string | null
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          name: string
          settings: Json | null
          slug: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          contact_email?: string | null
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          settings?: Json | null
          slug: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          contact_email?: string | null
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          settings?: Json | null
          slug?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      tkt_ticket_types: {
        Row: {
          created_at: string
          currency: string
          description: string | null
          event_id: string
          id: string
          is_active: boolean
          max_per_order: number | null
          name: string
          price_cents: number
          quantity_sold: number
          quantity_total: number
          sale_end: string | null
          sale_start: string | null
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          description?: string | null
          event_id: string
          id?: string
          is_active?: boolean
          max_per_order?: number | null
          name: string
          price_cents: number
          quantity_sold?: number
          quantity_total: number
          sale_end?: string | null
          sale_start?: string | null
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          description?: string | null
          event_id?: string
          id?: string
          is_active?: boolean
          max_per_order?: number | null
          name?: string
          price_cents?: number
          quantity_sold?: number
          quantity_total?: number
          sale_end?: string | null
          sale_start?: string | null
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tkt_ticket_types_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "tkt_events"
            referencedColumns: ["id"]
          },
        ]
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
      unified_artist_view: {
        Row: {
          artist_id: string | null
          canonical_created_at: string | null
          canonical_name: string | null
          canonical_rank: number | null
          canonical_updated_at: string | null
          city: string | null
          country: string | null
          has_embedding: boolean | null
          is_active: boolean | null
          known_for: string | null
          labels: string[] | null
          link_status: string | null
          mapping_id: string | null
          match_confidence: number | null
          match_method: string | null
          nationality: string | null
          needs_review: boolean | null
          photo_url: string | null
          photo_verified: boolean | null
          rag_id: number | null
          rag_name: string | null
          rag_rank: number | null
          real_name: string | null
          region: string | null
          slug: string | null
          source_system: string | null
          subgenres: string[] | null
          top_tracks: string[] | null
          years_active: string | null
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
      find_unlinked_artists: {
        Args: { p_limit?: number }
        Returns: {
          id: string
          name: string
          potential_match_id: string
          potential_match_name: string
          similarity: number
          source: string
        }[]
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
      get_source_map_stats: {
        Args: never
        Returns: {
          canonical_only: number
          link_percentage: number
          linked_count: number
          rag_only: number
          total_canonical: number
          total_rag: number
        }[]
      }
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
      normalize_artist_name: { Args: { name: string }; Returns: string }
      revoke_admin_role: { Args: { target_user_id: string }; Returns: boolean }
      search_artist_documents: {
        Args: {
          filter_artist_id?: string
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          artist_id: string
          content: string
          document_id: string
          document_type: string
          similarity: number
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
      search_gear_by_embedding: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          brand: string
          category: string
          id: string
          name: string
          short_description: string
          similarity: number
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
      claim_verification_status:
        | "unverified"
        | "partially_verified"
        | "verified"
        | "disputed"
      community_source:
        | "upload_widget"
        | "newsletter"
        | "api_signup"
        | "community_page"
        | "other"
      community_status: "pending" | "verified" | "banned"
      enrichment_run_status:
        | "pending"
        | "running"
        | "success"
        | "failed"
        | "partial"
      enrichment_run_type: "scheduled" | "manual" | "backlog" | "priority"
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
      claim_verification_status: [
        "unverified",
        "partially_verified",
        "verified",
        "disputed",
      ],
      community_source: [
        "upload_widget",
        "newsletter",
        "api_signup",
        "community_page",
        "other",
      ],
      community_status: ["pending", "verified", "banned"],
      enrichment_run_status: [
        "pending",
        "running",
        "success",
        "failed",
        "partial",
      ],
      enrichment_run_type: ["scheduled", "manual", "backlog", "priority"],
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
