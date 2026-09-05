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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ads_highlight: {
        Row: {
          created_at: string | null
          ends_at: string | null
          id: number
          price: number | null
          starts_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          ends_at?: string | null
          id?: number
          price?: number | null
          starts_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          ends_at?: string | null
          id?: number
          price?: number | null
          starts_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ads_highlight_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_user_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ads_highlight_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ads_highlight_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_public"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: string | null
          payload: Json | null
          record_id: string | null
          table_name: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          payload?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          payload?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      cities: {
        Row: {
          active: boolean
          created_at: string | null
          ibge_code: string | null
          id: string
          name: string
          population: number | null
          state: string
        }
        Insert: {
          active?: boolean
          created_at?: string | null
          ibge_code?: string | null
          id?: string
          name: string
          population?: number | null
          state: string
        }
        Update: {
          active?: boolean
          created_at?: string | null
          ibge_code?: string | null
          id?: string
          name?: string
          population?: number | null
          state?: string
        }
        Relationships: []
      }
      colaboradores_autorizados: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      contact_unlocks: {
        Row: {
          created_at: string | null
          id: string
          user_id: string
          worker_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          user_id: string
          worker_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          user_id?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_unlocks_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "admin_user_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_unlocks_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_unlocks_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "users_public"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          contractor_id: string
          created_at: string
          id: string
          updated_at: string
          worker_id: string
        }
        Insert: {
          contractor_id: string
          created_at?: string
          id?: string
          updated_at?: string
          worker_id: string
        }
        Update: {
          contractor_id?: string
          created_at?: string
          id?: string
          updated_at?: string
          worker_id?: string
        }
        Relationships: []
      }
      destaque_orders: {
        Row: {
          amount: number
          created_at: string
          days: number
          id: string
          mercadopago_payment_id: string | null
          qr_code: string | null
          qr_code_base64: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          days: number
          id?: string
          mercadopago_payment_id?: string | null
          qr_code?: string | null
          qr_code_base64?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          days?: number
          id?: string
          mercadopago_payment_id?: string | null
          qr_code?: string | null
          qr_code_base64?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_change_requests: {
        Row: {
          attempts: number
          code_hash: string
          created_at: string
          expires_at: string
          id: string
          new_email: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          attempts?: number
          code_hash: string
          created_at?: string
          expires_at: string
          id?: string
          new_email: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          attempts?: number
          code_hash?: string
          created_at?: string
          expires_at?: string
          id?: string
          new_email?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_change_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_user_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_change_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_change_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_public"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          user_id: string
          worker_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          worker_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "admin_user_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "users_public"
            referencedColumns: ["id"]
          },
        ]
      }
      job_applications: {
        Row: {
          applicant_id: string
          cover_letter: string | null
          created_at: string
          id: string
          job_posting_id: string
          proposed_price: number | null
          status: string
          updated_at: string
        }
        Insert: {
          applicant_id: string
          cover_letter?: string | null
          created_at?: string
          id?: string
          job_posting_id: string
          proposed_price?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          applicant_id?: string
          cover_letter?: string | null
          created_at?: string
          id?: string
          job_posting_id?: string
          proposed_price?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "admin_user_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applications_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applications_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "users_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applications_job_posting_id_fkey"
            columns: ["job_posting_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
        ]
      }
      job_postings: {
        Row: {
          category_id: string | null
          city_id: string | null
          company: string | null
          contact_phone: string | null
          created_at: string | null
          custom_category: string | null
          description: string | null
          id: string
          is_active: boolean | null
          location: string | null
          neighborhood: string | null
          posted_by: string | null
          price: string | null
          salary_range: string | null
          status: string | null
          title: string
          updated_at: string | null
          urgent: boolean | null
          user_id: string | null
        }
        Insert: {
          category_id?: string | null
          city_id?: string | null
          company?: string | null
          contact_phone?: string | null
          created_at?: string | null
          custom_category?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          neighborhood?: string | null
          posted_by?: string | null
          price?: string | null
          salary_range?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          urgent?: boolean | null
          user_id?: string | null
        }
        Update: {
          category_id?: string | null
          city_id?: string | null
          company?: string | null
          contact_phone?: string | null
          created_at?: string | null
          custom_category?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          neighborhood?: string | null
          posted_by?: string | null
          price?: string | null
          salary_range?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          urgent?: boolean | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_postings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_postings_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_postings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_user_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_postings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_postings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_public"
            referencedColumns: ["id"]
          },
        ]
      }
      logs_busca: {
        Row: {
          created_at: string | null
          encontrou_resultado: boolean | null
          id: string
          termo_buscado: string
        }
        Insert: {
          created_at?: string | null
          encontrou_resultado?: boolean | null
          id?: string
          termo_buscado: string
        }
        Update: {
          created_at?: string | null
          encontrou_resultado?: boolean | null
          id?: string
          termo_buscado?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          media_type: string | null
          media_url: string | null
          read: boolean
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          media_type?: string | null
          media_url?: string | null
          read?: boolean
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          media_type?: string | null
          media_url?: string | null
          read?: boolean
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      national_launch_notification_log: {
        Row: {
          auth_id: string
          created_at: string
          email: string
          email_error: string | null
          email_sent_at: string | null
          email_status: string
          id: string
          in_app_sent_at: string | null
          in_app_status: string
          phone_verified_at_seed: boolean
          user_id: string
        }
        Insert: {
          auth_id: string
          created_at?: string
          email: string
          email_error?: string | null
          email_sent_at?: string | null
          email_status?: string
          id?: string
          in_app_sent_at?: string | null
          in_app_status?: string
          phone_verified_at_seed?: boolean
          user_id: string
        }
        Update: {
          auth_id?: string
          created_at?: string
          email?: string
          email_error?: string | null
          email_sent_at?: string | null
          email_status?: string
          id?: string
          in_app_sent_at?: string | null
          in_app_status?: string
          phone_verified_at_seed?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "national_launch_notification_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "admin_user_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "national_launch_notification_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "national_launch_notification_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users_public"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          title?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ocupacao_termos_busca: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          id: string
          ocupacao_id: string
          peso_relevancia: number
          termo: string
          termo_norm: string
          tipo_termo: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          id?: string
          ocupacao_id: string
          peso_relevancia?: number
          termo: string
          termo_norm: string
          tipo_termo: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          id?: string
          ocupacao_id?: string
          peso_relevancia?: number
          termo?: string
          termo_norm?: string
          tipo_termo?: string
        }
        Relationships: [
          {
            foreignKeyName: "ocupacao_termos_busca_ocupacao_id_fkey"
            columns: ["ocupacao_id"]
            isOneToOne: false
            referencedRelation: "ocupacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      ocupacoes: {
        Row: {
          ativo: boolean | null
          categoria_principal: string | null
          created_at: string | null
          descricao_simples: string | null
          id: string
          nivel_instrucao: string | null
          nome_oficial: string
          slug: string
          tipo_trabalho: string | null
        }
        Insert: {
          ativo?: boolean | null
          categoria_principal?: string | null
          created_at?: string | null
          descricao_simples?: string | null
          id?: string
          nivel_instrucao?: string | null
          nome_oficial: string
          slug: string
          tipo_trabalho?: string | null
        }
        Update: {
          ativo?: boolean | null
          categoria_principal?: string | null
          created_at?: string | null
          descricao_simples?: string | null
          id?: string
          nivel_instrucao?: string | null
          nome_oficial?: string
          slug?: string
          tipo_trabalho?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number | null
          created_at: string | null
          gateway: string | null
          id: string
          mercadopago_payment_id: string | null
          method: string | null
          qr_code: string | null
          qr_code_base64: string | null
          raw: Json | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          gateway?: string | null
          id?: string
          mercadopago_payment_id?: string | null
          method?: string | null
          qr_code?: string | null
          qr_code_base64?: string | null
          raw?: Json | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          gateway?: string | null
          id?: string
          mercadopago_payment_id?: string | null
          method?: string | null
          qr_code?: string | null
          qr_code_base64?: string | null
          raw?: Json | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_user_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_public"
            referencedColumns: ["id"]
          },
        ]
      }
      phone_verification_codes: {
        Row: {
          attempts: number
          created_at: string
          expires_at: string
          id: string
          phone: string
          status: string
          twilio_sid: string | null
          user_id: string
          verified_at: string | null
        }
        Insert: {
          attempts?: number
          created_at?: string
          expires_at: string
          id?: string
          phone: string
          status?: string
          twilio_sid?: string | null
          user_id: string
          verified_at?: string | null
        }
        Update: {
          attempts?: number
          created_at?: string
          expires_at?: string
          id?: string
          phone?: string
          status?: string
          twilio_sid?: string | null
          user_id?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "phone_verification_codes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_user_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "phone_verification_codes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "phone_verification_codes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_public"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          created_at: string | null
          id: number
          name: string
          price: number
          priority: number | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          name: string
          price: number
          priority?: number | null
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
          price?: number
          priority?: number | null
        }
        Relationships: []
      }
      profile_views: {
        Row: {
          id: string
          viewed_at: string | null
          viewed_profile_id: string
          viewer_id: string
        }
        Insert: {
          id?: string
          viewed_at?: string | null
          viewed_profile_id: string
          viewer_id: string
        }
        Update: {
          id?: string
          viewed_at?: string | null
          viewed_profile_id?: string
          viewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_views_viewed_profile_id_fkey"
            columns: ["viewed_profile_id"]
            isOneToOne: false
            referencedRelation: "admin_user_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_views_viewed_profile_id_fkey"
            columns: ["viewed_profile_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_views_viewed_profile_id_fkey"
            columns: ["viewed_profile_id"]
            isOneToOne: false
            referencedRelation: "users_public"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          city: string | null
          cpf: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          city?: string | null
          cpf?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          city?: string | null
          cpf?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      registrations: {
        Row: {
          cidade: string
          created_at: string | null
          email: string
          id: string
          nome: string
          phone: string | null
          source: string | null
          tipo_interesse: string
        }
        Insert: {
          cidade: string
          created_at?: string | null
          email: string
          id?: string
          nome: string
          phone?: string | null
          source?: string | null
          tipo_interesse: string
        }
        Update: {
          cidade?: string
          created_at?: string | null
          email?: string
          id?: string
          nome?: string
          phone?: string | null
          source?: string | null
          tipo_interesse?: string
        }
        Relationships: []
      }
      signup_errors: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: number
          stage: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: number
          stage?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: number
          stage?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      subcategories: {
        Row: {
          category_id: string | null
          created_at: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      termos_busca: {
        Row: {
          ativo: boolean | null
          id: string
          ocupacao_id: string | null
          peso_relevancia: number | null
          termo: string
          tipo_termo: string | null
        }
        Insert: {
          ativo?: boolean | null
          id?: string
          ocupacao_id?: string | null
          peso_relevancia?: number | null
          termo: string
          tipo_termo?: string | null
        }
        Update: {
          ativo?: boolean | null
          id?: string
          ocupacao_id?: string | null
          peso_relevancia?: number | null
          termo?: string
          tipo_termo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "termos_busca_ocupacao_id_fkey"
            columns: ["ocupacao_id"]
            isOneToOne: false
            referencedRelation: "ocupacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_credits: {
        Row: {
          credits: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          credits?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          credits?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          role_name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          role_name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          role_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          address: string | null
          auth_id: string | null
          avatar_url: string | null
          category: string | null
          category_id: string | null
          cep: string | null
          city: string | null
          city_id: string | null
          cpf: string | null
          created_at: string | null
          description: string | null
          destaque_expires_at: string | null
          display_name: string | null
          email: string
          free_posts_remaining: number | null
          house_number: string | null
          id: string
          is_tester: boolean | null
          jobs_done: number | null
          last_mode: string | null
          last_usage_at: string | null
          name: string
          neighborhood: string | null
          phone: string
          phone_type: string | null
          phone_verified: boolean
          phone_verified_at: string | null
          plan_active: boolean | null
          plan_type: string | null
          price: string | null
          profile_photo: string | null
          rating_avg: number | null
          rating_count: number | null
          state: string | null
          subcategory_id: string | null
          subscription_end: string | null
          subscription_start: string | null
          type: string | null
          updated_at: string | null
          user_role: string | null
          verified: boolean | null
        }
        Insert: {
          address?: string | null
          auth_id?: string | null
          avatar_url?: string | null
          category?: string | null
          category_id?: string | null
          cep?: string | null
          city?: string | null
          city_id?: string | null
          cpf?: string | null
          created_at?: string | null
          description?: string | null
          destaque_expires_at?: string | null
          display_name?: string | null
          email: string
          free_posts_remaining?: number | null
          house_number?: string | null
          id?: string
          is_tester?: boolean | null
          jobs_done?: number | null
          last_mode?: string | null
          last_usage_at?: string | null
          name: string
          neighborhood?: string | null
          phone: string
          phone_type?: string | null
          phone_verified?: boolean
          phone_verified_at?: string | null
          plan_active?: boolean | null
          plan_type?: string | null
          price?: string | null
          profile_photo?: string | null
          rating_avg?: number | null
          rating_count?: number | null
          state?: string | null
          subcategory_id?: string | null
          subscription_end?: string | null
          subscription_start?: string | null
          type?: string | null
          updated_at?: string | null
          user_role?: string | null
          verified?: boolean | null
        }
        Update: {
          address?: string | null
          auth_id?: string | null
          avatar_url?: string | null
          category?: string | null
          category_id?: string | null
          cep?: string | null
          city?: string | null
          city_id?: string | null
          cpf?: string | null
          created_at?: string | null
          description?: string | null
          destaque_expires_at?: string | null
          display_name?: string | null
          email?: string
          free_posts_remaining?: number | null
          house_number?: string | null
          id?: string
          is_tester?: boolean | null
          jobs_done?: number | null
          last_mode?: string | null
          last_usage_at?: string | null
          name?: string
          neighborhood?: string | null
          phone?: string
          phone_type?: string | null
          phone_verified?: boolean
          phone_verified_at?: string | null
          plan_active?: boolean | null
          plan_type?: string | null
          price?: string | null
          profile_photo?: string | null
          rating_avg?: number | null
          rating_count?: number | null
          state?: string | null
          subcategory_id?: string | null
          subscription_end?: string | null
          subscription_start?: string | null
          type?: string | null
          updated_at?: string | null
          user_role?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "users_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      worker_services: {
        Row: {
          active: boolean | null
          availability: string | null
          category_id: string | null
          confidence_score: number | null
          created_at: string | null
          custom_category: string | null
          description: string | null
          id: string
          occupation_id: string | null
          price: string | null
          profession_raw: string | null
          subcategory_id: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          active?: boolean | null
          availability?: string | null
          category_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          custom_category?: string | null
          description?: string | null
          id?: string
          occupation_id?: string | null
          price?: string | null
          profession_raw?: string | null
          subcategory_id?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          active?: boolean | null
          availability?: string | null
          category_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          custom_category?: string | null
          description?: string | null
          id?: string
          occupation_id?: string | null
          price?: string | null
          profession_raw?: string | null
          subcategory_id?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "worker_services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worker_services_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worker_services_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "admin_user_full"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worker_services_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worker_services_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_public"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      admin_dashboard_stats: {
        Row: {
          clients_total: number | null
          generated_at: string | null
          providers_active: number | null
          revenue_total: number | null
          total_users: number | null
        }
        Relationships: []
      }
      admin_user_full: {
        Row: {
          auth_id: string | null
          city: string | null
          cpf: string | null
          created_at: string | null
          email: string | null
          id: string | null
          name: string | null
          neighborhood: string | null
          phone: string | null
          profile_photo: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          auth_id?: string | null
          city?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          id?: string | null
          name?: string | null
          neighborhood?: string | null
          phone?: string | null
          profile_photo?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          auth_id?: string | null
          city?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          id?: string | null
          name?: string | null
          neighborhood?: string | null
          phone?: string | null
          profile_photo?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      admin_user_list: {
        Row: {
          address: string | null
          auth_id: string | null
          avatar_url: string | null
          category_id: string | null
          city: string | null
          city_id: string | null
          cpf: string | null
          created_at: string | null
          description: string | null
          display_name: string | null
          email: string | null
          free_posts_remaining: number | null
          id: string | null
          is_tester: boolean | null
          jobs_done: number | null
          last_mode: string | null
          last_usage_at: string | null
          name: string | null
          neighborhood: string | null
          phone: string | null
          phone_type: string | null
          plan_active: boolean | null
          price: string | null
          rating_avg: number | null
          rating_count: number | null
          state: string | null
          subcategory_id: string | null
          type: string | null
          updated_at: string | null
          user_role: string | null
          verified: boolean | null
        }
        Relationships: []
      }
      users_public: {
        Row: {
          category: string | null
          city: string | null
          city_id: string | null
          created_at: string | null
          description: string | null
          destaque_expires_at: string | null
          id: string | null
          jobs_done: number | null
          name: string | null
          neighborhood: string | null
          plan_active: boolean | null
          price: string | null
          profile_photo: string | null
          rating_avg: number | null
          rating_count: number | null
          state: string | null
          type: string | null
          verified: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "users_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      _admin_all_users_internal: {
        Args: never
        Returns: {
          address: string | null
          auth_id: string | null
          avatar_url: string | null
          category: string | null
          category_id: string | null
          cep: string | null
          city: string | null
          city_id: string | null
          cpf: string | null
          created_at: string | null
          description: string | null
          destaque_expires_at: string | null
          display_name: string | null
          email: string
          free_posts_remaining: number | null
          house_number: string | null
          id: string
          is_tester: boolean | null
          jobs_done: number | null
          last_mode: string | null
          last_usage_at: string | null
          name: string
          neighborhood: string | null
          phone: string
          phone_type: string | null
          phone_verified: boolean
          phone_verified_at: string | null
          plan_active: boolean | null
          plan_type: string | null
          price: string | null
          profile_photo: string | null
          rating_avg: number | null
          rating_count: number | null
          state: string | null
          subcategory_id: string | null
          subscription_end: string | null
          subscription_start: string | null
          type: string | null
          updated_at: string | null
          user_role: string | null
          verified: boolean | null
        }[]
        SetofOptions: {
          from: "*"
          to: "users"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      buscar_e_logar_ocupacoes: {
        Args: { termo_txt: string }
        Returns: {
          nome_oficial: string
          ocupacao_id: string
          similaridade: number
          slug: string
        }[]
      }
      buscar_ocupacoes: {
        Args: { termo_usuario: string }
        Returns: {
          nome_oficial: string
          ocupacao_id: string
          similaridade: number
          slug: string
        }[]
      }
      check_possible_duplicate_signup: {
        Args: { p_city_id: string; p_exclude_id: string; p_name: string }
        Returns: boolean
      }
      get_admin_count: { Args: { metric_type: string }; Returns: number }
      get_admin_records: {
        Args: { metric_type: string }
        Returns: {
          address: string | null
          auth_id: string | null
          avatar_url: string | null
          category: string | null
          category_id: string | null
          cep: string | null
          city: string | null
          city_id: string | null
          cpf: string | null
          created_at: string | null
          description: string | null
          destaque_expires_at: string | null
          display_name: string | null
          email: string
          free_posts_remaining: number | null
          house_number: string | null
          id: string
          is_tester: boolean | null
          jobs_done: number | null
          last_mode: string | null
          last_usage_at: string | null
          name: string
          neighborhood: string | null
          phone: string
          phone_type: string | null
          phone_verified: boolean
          phone_verified_at: string | null
          plan_active: boolean | null
          plan_type: string | null
          price: string | null
          profile_photo: string | null
          rating_avg: number | null
          rating_count: number | null
          state: string | null
          subcategory_id: string | null
          subscription_end: string | null
          subscription_start: string | null
          type: string | null
          updated_at: string | null
          user_role: string | null
          verified: boolean | null
        }[]
        SetofOptions: {
          from: "*"
          to: "users"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_admin_users: {
        Args: never
        Returns: {
          auth_id: string
          category: string
          city: string
          cpf: string
          created_at: string
          email: string
          free_posts_remaining: number
          id: string
          is_tester: boolean
          last_usage_at: string
          name: string
          neighborhood: string
          phone: string
          plan_active: boolean
          profile_photo: string
          state: string
          subcategory: string
          user_role: string
          verified: boolean
          view_credits: number
        }[]
      }
      get_user_details_by_id: {
        Args: { target_user_id: string }
        Returns: {
          address: string | null
          auth_id: string | null
          avatar_url: string | null
          category: string | null
          category_id: string | null
          cep: string | null
          city: string | null
          city_id: string | null
          cpf: string | null
          created_at: string | null
          description: string | null
          destaque_expires_at: string | null
          display_name: string | null
          email: string
          free_posts_remaining: number | null
          house_number: string | null
          id: string
          is_tester: boolean | null
          jobs_done: number | null
          last_mode: string | null
          last_usage_at: string | null
          name: string
          neighborhood: string | null
          phone: string
          phone_type: string | null
          phone_verified: boolean
          phone_verified_at: string | null
          plan_active: boolean | null
          plan_type: string | null
          price: string | null
          profile_photo: string | null
          rating_avg: number | null
          rating_count: number | null
          state: string | null
          subcategory_id: string | null
          subscription_end: string | null
          subscription_start: string | null
          type: string | null
          updated_at: string | null
          user_role: string | null
          verified: boolean | null
        }
        SetofOptions: {
          from: "*"
          to: "users"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_worker_contact: {
        Args: { p_worker_id: string }
        Returns: {
          email: string
          phone: string
        }[]
      }
      has_role: { Args: { p_role: string; p_user: string }; Returns: boolean }
      has_unlock_capacity: { Args: { p_auth_id: string }; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
      normalize_busca_texto: { Args: { input: string }; Returns: string }
      search_ocupacoes: {
        Args: { lim?: number; min_sim?: number; q: string }
        Returns: {
          categoria_principal: string
          descricao_simples: string
          nivel_instrucao: string
          nome_oficial: string
          ocupacao_id: string
          similarity_score: number
          slug: string
          termo_match: string
          tipo_trabalho: string
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      unaccent: { Args: { "": string }; Returns: string }
    }
    Enums: {
      app_role: "admin" | "user"
      job_status: "published" | "in_progress" | "done" | "cancelled" | "open"
      user_type: "contractor" | "worker"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: ["admin", "user"],
      job_status: ["published", "in_progress", "done", "cancelled", "open"],
      user_type: ["contractor", "worker"],
    },
  },
} as const
