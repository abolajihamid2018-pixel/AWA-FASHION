// Generated from the Supabase project schema (Supabase MCP `generate_typescript_types`).
// Regenerate after schema changes. Helper generics omitted for brevity.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.18'
  }
  public: {
    Tables: {
      request_events: {
        Row: {
          actor_user_id: string | null
          created_at: string
          event_type: string
          from_status: Database['public']['Enums']['request_status'] | null
          id: number
          request_id: string
          to_status: Database['public']['Enums']['request_status'] | null
        }
        Insert: {
          actor_user_id?: string | null
          created_at?: string
          event_type: string
          from_status?: Database['public']['Enums']['request_status'] | null
          id?: never
          request_id: string
          to_status?: Database['public']['Enums']['request_status'] | null
        }
        Update: {
          actor_user_id?: string | null
          created_at?: string
          event_type?: string
          from_status?: Database['public']['Enums']['request_status'] | null
          id?: never
          request_id?: string
          to_status?: Database['public']['Enums']['request_status'] | null
        }
        Relationships: [
          {
            foreignKeyName: 'request_events_request_id_fkey'
            columns: ['request_id']
            isOneToOne: false
            referencedRelation: 'requests'
            referencedColumns: ['id']
          },
        ]
      }
      requests: {
        Row: {
          ai_confidence: string | null
          ai_error: string | null
          ai_needs_review: boolean | null
          ai_processed_at: string | null
          ai_reason: string | null
          ai_status: Database['public']['Enums']['ai_status']
          ai_suggested_service_id: string | null
          ai_summary: string | null
          created_at: string
          enquiry: string | null
          id: string
          patient_email: string
          patient_name: string
          patient_phone: string | null
          preferred_date: string | null
          preferred_time: string
          reference_code: string
          service_id: string
          status: Database['public']['Enums']['request_status']
          status_token_hash: string
          updated_at: string
        }
        Insert: {
          ai_confidence?: string | null
          ai_error?: string | null
          ai_needs_review?: boolean | null
          ai_processed_at?: string | null
          ai_reason?: string | null
          ai_status?: Database['public']['Enums']['ai_status']
          ai_suggested_service_id?: string | null
          ai_summary?: string | null
          created_at?: string
          enquiry?: string | null
          id?: string
          patient_email: string
          patient_name: string
          patient_phone?: string | null
          preferred_date?: string | null
          preferred_time?: string
          reference_code: string
          service_id: string
          status?: Database['public']['Enums']['request_status']
          status_token_hash: string
          updated_at?: string
        }
        Update: {
          ai_confidence?: string | null
          ai_error?: string | null
          ai_needs_review?: boolean | null
          ai_processed_at?: string | null
          ai_reason?: string | null
          ai_status?: Database['public']['Enums']['ai_status']
          ai_suggested_service_id?: string | null
          ai_summary?: string | null
          created_at?: string
          enquiry?: string | null
          id?: string
          patient_email?: string
          patient_name?: string
          patient_phone?: string | null
          preferred_date?: string | null
          preferred_time?: string
          reference_code?: string
          service_id?: string
          status?: Database['public']['Enums']['request_status']
          status_token_hash?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'requests_ai_suggested_service_id_fkey'
            columns: ['ai_suggested_service_id']
            isOneToOne: false
            referencedRelation: 'services'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'requests_service_id_fkey'
            columns: ['service_id']
            isOneToOne: false
            referencedRelation: 'services'
            referencedColumns: ['id']
          },
        ]
      }
      services: {
        Row: {
          created_at: string
          description: string
          id: string
          is_active: boolean
          kind: Database['public']['Enums']['service_kind']
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          is_active?: boolean
          kind?: Database['public']['Enums']['service_kind']
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          kind?: Database['public']['Enums']['service_kind']
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      staff: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_request_status: { Args: { p_token: string }; Returns: Json }
      submit_request: {
        Args: {
          p_consent: boolean
          p_email: string
          p_enquiry: string
          p_name: string
          p_phone: string
          p_preferred_date: string
          p_preferred_time: string
          p_service_id: string
        }
        Returns: Json
      }
    }
    Enums: {
      ai_status: 'pending' | 'completed' | 'failed' | 'skipped'
      request_status: 'submitted' | 'in_review' | 'approved' | 'declined' | 'cancelled'
      service_kind: 'appointment' | 'administrative'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
