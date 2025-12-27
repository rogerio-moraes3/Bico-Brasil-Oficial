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
      appointments: {
        Row: {
          contractor_id: string
          created_at: string | null
          id: string
          job_id: string | null
          notes: string | null
          scheduled_date: string
          status: string | null
          updated_at: string | null
          worker_id: string
        }
        Insert: {
          contractor_id: string
          created_at?: string | null
          id?: string
          job_id?: string | null
          notes?: string | null
          scheduled_date: string
          status?: string | null
          updated_at?: string | null
          worker_id: string
        }
        Update: {
          contractor_id?: string
          created_at?: string | null
          id?: string
          job_id?: string | null
          notes?: string | null
          scheduled_date?: string
          status?: string | null
          updated_at?: string | null
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
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
      badges: {
        Row: {
          created_at: string | null
          criteria: string
          description: string | null
          icon: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          criteria: string
          description?: string | null
          icon: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          criteria?: string
          description?: string | null
          icon?: string
          id?: string
          name?: string
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
          id: string
          name: string
          state: string
        }
        Insert: {
          active?: boolean
          created_at?: string | null
          id?: string
          name: string
          state?: string
        }
        Update: {
          active?: boolean
          created_at?: string | null
          id?: string
          name?: string
          state?: string
        }
        Relationships: []
      }
      colaboradores_autorizados: {
        Row: {
          created_at: string | null
          created_by: string | null
          email: string
          id: string
          nome: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          email: string
          id?: string
          nome?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          email?: string
          id?: string
          nome?: string | null
        }
        Relationships: []
      }
      community_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_worker_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ranking_top_contractors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ranking_top_workers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      community_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_worker_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ranking_top_contractors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ranking_top_workers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          category: string
          comments_count: number | null
          content: string
          created_at: string | null
          id: string
          likes_count: number | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          comments_count?: number | null
          content: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          comments_count?: number | null
          content?: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_worker_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ranking_top_contractors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ranking_top_workers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "public_worker_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_unlocks_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "ranking_top_contractors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_unlocks_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "ranking_top_workers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_unlocks_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          subject: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          subject: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          subject?: string
        }
        Relationships: []
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
          external_reference: string | null
          id: string
          paid_at: string | null
          payment_id: string | null
          preference_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          days: number
          external_reference?: string | null
          id?: string
          paid_at?: string | null
          payment_id?: string | null
          preference_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          days?: number
          external_reference?: string | null
          id?: string
          paid_at?: string | null
          payment_id?: string | null
          preference_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_log: {
        Row: {
          created_at: string | null
          email: string
          error: string | null
          id: string
          payload: Json | null
          status: string | null
          tipo: string
        }
        Insert: {
          created_at?: string | null
          email: string
          error?: string | null
          id?: string
          payload?: Json | null
          status?: string | null
          tipo: string
        }
        Update: {
          created_at?: string | null
          email?: string
          error?: string | null
          id?: string
          payload?: Json | null
          status?: string | null
          tipo?: string
        }
        Relationships: []
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
            referencedRelation: "public_worker_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "ranking_top_contractors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "ranking_top_workers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      job_contacts: {
        Row: {
          contactor_id: string | null
          created_at: string
          id: string
          job_id: string
        }
        Insert: {
          contactor_id?: string | null
          created_at?: string
          id?: string
          job_id: string
        }
        Update: {
          contactor_id?: string | null
          created_at?: string
          id?: string
          job_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_contacts_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_postings: {
        Row: {
          category_id: string | null
          city_id: string | null
          created_at: string | null
          custom_category: string | null
          date_time: string | null
          description: string
          id: string
          is_test: boolean | null
          neighborhood: string
          status: string | null
          title: string
          updated_at: string | null
          urgent: boolean | null
          user_id: string
        }
        Insert: {
          category_id?: string | null
          city_id?: string | null
          created_at?: string | null
          custom_category?: string | null
          date_time?: string | null
          description: string
          id?: string
          is_test?: boolean | null
          neighborhood: string
          status?: string | null
          title: string
          updated_at?: string | null
          urgent?: boolean | null
          user_id: string
        }
        Update: {
          category_id?: string | null
          city_id?: string | null
          created_at?: string | null
          custom_category?: string | null
          date_time?: string | null
          description?: string
          id?: string
          is_test?: boolean | null
          neighborhood?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          urgent?: boolean | null
          user_id?: string
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
            referencedRelation: "public_worker_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_postings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ranking_top_contractors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_postings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ranking_top_workers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_postings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      job_views: {
        Row: {
          created_at: string
          id: string
          job_id: string
          viewer_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          viewer_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          viewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_views_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          address: string | null
          category: string
          city: string | null
          city_id: string | null
          contractor_comment: string | null
          contractor_id: string | null
          contractor_name: string
          contractor_phone: string
          created_at: string | null
          date_time: string | null
          description: string
          id: string
          neighborhood: string | null
          rating_contractor: number | null
          rating_worker: number | null
          status: Database["public"]["Enums"]["job_status"] | null
          subcategory: string | null
          title: string
          updated_at: string | null
          urgent: boolean | null
          worker_comment: string | null
          worker_id: string | null
        }
        Insert: {
          address?: string | null
          category: string
          city?: string | null
          city_id?: string | null
          contractor_comment?: string | null
          contractor_id?: string | null
          contractor_name: string
          contractor_phone: string
          created_at?: string | null
          date_time?: string | null
          description: string
          id?: string
          neighborhood?: string | null
          rating_contractor?: number | null
          rating_worker?: number | null
          status?: Database["public"]["Enums"]["job_status"] | null
          subcategory?: string | null
          title: string
          updated_at?: string | null
          urgent?: boolean | null
          worker_comment?: string | null
          worker_id?: string | null
        }
        Update: {
          address?: string | null
          category?: string
          city?: string | null
          city_id?: string | null
          contractor_comment?: string | null
          contractor_id?: string | null
          contractor_name?: string
          contractor_phone?: string
          created_at?: string | null
          date_time?: string | null
          description?: string
          id?: string
          neighborhood?: string | null
          rating_contractor?: number | null
          rating_worker?: number | null
          status?: Database["public"]["Enums"]["job_status"] | null
          subcategory?: string | null
          title?: string
          updated_at?: string | null
          urgent?: boolean | null
          worker_comment?: string | null
          worker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "public_worker_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "ranking_top_contractors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "ranking_top_workers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_contractor_id_fkey"
            columns: ["contractor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "public_worker_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "ranking_top_contractors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "ranking_top_workers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
      notifications: {
        Row: {
          created_at: string | null
          id: string
          link: string | null
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          link?: string | null
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          link?: string | null
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          expiration_date: string | null
          gateway: Database["public"]["Enums"]["payment_gateway"] | null
          id: string
          is_test: boolean | null
          mercadopago_payment_id: string | null
          plan_type: string | null
          qr_code: string | null
          qr_code_base64: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          subscription_end: string | null
          subscription_start: string | null
          updated_at: string | null
          user_id: string
          webhook_response: Json | null
        }
        Insert: {
          amount?: number
          created_at?: string | null
          expiration_date?: string | null
          gateway?: Database["public"]["Enums"]["payment_gateway"] | null
          id?: string
          is_test?: boolean | null
          mercadopago_payment_id?: string | null
          plan_type?: string | null
          qr_code?: string | null
          qr_code_base64?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          subscription_end?: string | null
          subscription_start?: string | null
          updated_at?: string | null
          user_id: string
          webhook_response?: Json | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          expiration_date?: string | null
          gateway?: Database["public"]["Enums"]["payment_gateway"] | null
          id?: string
          is_test?: boolean | null
          mercadopago_payment_id?: string | null
          plan_type?: string | null
          qr_code?: string | null
          qr_code_base64?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          subscription_end?: string | null
          subscription_start?: string | null
          updated_at?: string | null
          user_id?: string
          webhook_response?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_worker_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ranking_top_contractors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ranking_top_workers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      pre_cadastro: {
        Row: {
          cidade: string
          created_at: string | null
          email: string
          id: string
          nome: string
          tipo_interesse: string
        }
        Insert: {
          cidade: string
          created_at?: string | null
          email: string
          id?: string
          nome: string
          tipo_interesse: string
        }
        Update: {
          cidade?: string
          created_at?: string | null
          email?: string
          id?: string
          nome?: string
          tipo_interesse?: string
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
            referencedRelation: "public_worker_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_views_viewed_profile_id_fkey"
            columns: ["viewed_profile_id"]
            isOneToOne: false
            referencedRelation: "ranking_top_contractors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_views_viewed_profile_id_fkey"
            columns: ["viewed_profile_id"]
            isOneToOne: false
            referencedRelation: "ranking_top_workers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_views_viewed_profile_id_fkey"
            columns: ["viewed_profile_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string | null
          endpoint: string
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string | null
          endpoint: string
          id?: string
          p256dh: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: []
      }
      ratings: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          job_id: string
          rated_user_id: string
          rating: number
          rating_user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          job_id: string
          rated_user_id: string
          rating: number
          rating_user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          job_id?: string
          rated_user_id?: string
          rating?: number
          rating_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_rated_user_id_fkey"
            columns: ["rated_user_id"]
            isOneToOne: false
            referencedRelation: "public_worker_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_rated_user_id_fkey"
            columns: ["rated_user_id"]
            isOneToOne: false
            referencedRelation: "ranking_top_contractors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_rated_user_id_fkey"
            columns: ["rated_user_id"]
            isOneToOne: false
            referencedRelation: "ranking_top_workers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_rated_user_id_fkey"
            columns: ["rated_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_rating_user_id_fkey"
            columns: ["rating_user_id"]
            isOneToOne: false
            referencedRelation: "public_worker_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_rating_user_id_fkey"
            columns: ["rating_user_id"]
            isOneToOne: false
            referencedRelation: "ranking_top_contractors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_rating_user_id_fkey"
            columns: ["rating_user_id"]
            isOneToOne: false
            referencedRelation: "ranking_top_workers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_rating_user_id_fkey"
            columns: ["rating_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
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
      services: {
        Row: {
          category: string
          created_at: string | null
          id: string
          service_description: string | null
          service_title: string
          subcategory: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          service_description?: string | null
          service_title: string
          subcategory?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          service_description?: string | null
          service_title?: string
          subcategory?: string | null
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
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string | null
          id?: string
          user_id?: string
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
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_worker_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ranking_top_contractors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ranking_top_workers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          address: string | null
          auth_id: string | null
          availability: string | null
          category: string | null
          city: string
          city_id: string | null
          cpf: string | null
          created_at: string | null
          description: string | null
          destaque_expires_at: string | null
          email: string | null
          free_posts_remaining: number | null
          id: string
          is_test: boolean | null
          is_tester: boolean | null
          jobs_done: number | null
          last_usage_at: string | null
          name: string
          neighborhood: string | null
          phone: string | null
          phone_type: string | null
          plan_active: boolean | null
          plan_type: string | null
          price: string | null
          primary_contact_method: string | null
          profile_photo: string | null
          rating_avg: number | null
          rating_count: number | null
          state: string | null
          street_number: string | null
          subcategory: string | null
          subscription_end: string | null
          subscription_start: string | null
          type: Database["public"]["Enums"]["user_type"]
          updated_at: string | null
          usage_count: number | null
          user_role: string | null
          verification_document: string | null
          verification_status: string | null
          verified: boolean | null
          view_credits: number | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          auth_id?: string | null
          availability?: string | null
          category?: string | null
          city?: string
          city_id?: string | null
          cpf?: string | null
          created_at?: string | null
          description?: string | null
          destaque_expires_at?: string | null
          email?: string | null
          free_posts_remaining?: number | null
          id?: string
          is_test?: boolean | null
          is_tester?: boolean | null
          jobs_done?: number | null
          last_usage_at?: string | null
          name?: string
          neighborhood?: string | null
          phone?: string | null
          phone_type?: string | null
          plan_active?: boolean | null
          plan_type?: string | null
          price?: string | null
          primary_contact_method?: string | null
          profile_photo?: string | null
          rating_avg?: number | null
          rating_count?: number | null
          state?: string | null
          street_number?: string | null
          subcategory?: string | null
          subscription_end?: string | null
          subscription_start?: string | null
          type?: Database["public"]["Enums"]["user_type"]
          updated_at?: string | null
          usage_count?: number | null
          user_role?: string | null
          verification_document?: string | null
          verification_status?: string | null
          verified?: boolean | null
          view_credits?: number | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          auth_id?: string | null
          availability?: string | null
          category?: string | null
          city?: string
          city_id?: string | null
          cpf?: string | null
          created_at?: string | null
          description?: string | null
          destaque_expires_at?: string | null
          email?: string | null
          free_posts_remaining?: number | null
          id?: string
          is_test?: boolean | null
          is_tester?: boolean | null
          jobs_done?: number | null
          last_usage_at?: string | null
          name?: string
          neighborhood?: string | null
          phone?: string | null
          phone_type?: string | null
          plan_active?: boolean | null
          plan_type?: string | null
          price?: string | null
          primary_contact_method?: string | null
          profile_photo?: string | null
          rating_avg?: number | null
          rating_count?: number | null
          state?: string | null
          street_number?: string | null
          subcategory?: string | null
          subscription_end?: string | null
          subscription_start?: string | null
          type?: Database["public"]["Enums"]["user_type"]
          updated_at?: string | null
          usage_count?: number | null
          user_role?: string | null
          verification_document?: string | null
          verification_status?: string | null
          verified?: boolean | null
          view_credits?: number | null
          zip_code?: string | null
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
          created_at: string | null
          custom_category: string | null
          description: string
          id: string
          is_test: boolean | null
          price: number | null
          subcategory_id: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          availability?: string | null
          category_id?: string | null
          created_at?: string | null
          custom_category?: string | null
          description: string
          id?: string
          is_test?: boolean | null
          price?: number | null
          subcategory_id?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          availability?: string | null
          category_id?: string | null
          created_at?: string | null
          custom_category?: string | null
          description?: string
          id?: string
          is_test?: boolean | null
          price?: number | null
          subcategory_id?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
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
            referencedRelation: "public_worker_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worker_services_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ranking_top_contractors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worker_services_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "ranking_top_workers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worker_services_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_worker_profiles: {
        Row: {
          availability: string | null
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
          subcategory: string | null
          subscription_end: string | null
          type: Database["public"]["Enums"]["user_type"] | null
          verified: boolean | null
        }
        Insert: {
          availability?: string | null
          category?: string | null
          city?: string | null
          city_id?: string | null
          created_at?: string | null
          description?: string | null
          destaque_expires_at?: string | null
          id?: string | null
          jobs_done?: number | null
          name?: string | null
          neighborhood?: string | null
          plan_active?: boolean | null
          price?: string | null
          profile_photo?: string | null
          rating_avg?: number | null
          rating_count?: number | null
          state?: string | null
          subcategory?: string | null
          subscription_end?: string | null
          type?: Database["public"]["Enums"]["user_type"] | null
          verified?: boolean | null
        }
        Update: {
          availability?: string | null
          category?: string | null
          city?: string | null
          city_id?: string | null
          created_at?: string | null
          description?: string | null
          destaque_expires_at?: string | null
          id?: string | null
          jobs_done?: number | null
          name?: string | null
          neighborhood?: string | null
          plan_active?: boolean | null
          price?: string | null
          profile_photo?: string | null
          rating_avg?: number | null
          rating_count?: number | null
          state?: string | null
          subcategory?: string | null
          subscription_end?: string | null
          type?: Database["public"]["Enums"]["user_type"] | null
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
      ranking_top_contractors: {
        Row: {
          activity_score: number | null
          completed_jobs: number | null
          id: string | null
          last_usage_at: string | null
          name: string | null
          profile_photo: string | null
          total_job_postings: number | null
          total_jobs: number | null
          usage_count: number | null
        }
        Relationships: []
      }
      ranking_top_jobs: {
        Row: {
          category_id: string | null
          contacts_count: number | null
          contractor_name: string | null
          contractor_photo: string | null
          created_at: string | null
          description: string | null
          id: string | null
          popularity_score: number | null
          title: string | null
          urgent: boolean | null
          views_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "job_postings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      ranking_top_workers: {
        Row: {
          category: string | null
          completed_jobs: number | null
          destaque_expires_at: string | null
          id: string | null
          jobs_done: number | null
          name: string | null
          profile_photo: string | null
          rating_avg: number | null
          rating_count: number | null
          subcategory: string | null
          total_jobs: number | null
          verified: boolean | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_create_payment: { Args: { _user_id: string }; Returns: boolean }
      can_view_job_contact: {
        Args: { job_id: string; user_id: string }
        Returns: boolean
      }
      check_email_authorized: {
        Args: { check_email: string }
        Returns: boolean
      }
      decrement_view_credits: {
        Args: { user_auth_id: string }
        Returns: undefined
      }
      expire_old_pending_payments: { Args: never; Returns: undefined }
      get_admin_users: {
        Args: never
        Returns: {
          auth_id: string
          category: string
          city: string
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
          type: Database["public"]["Enums"]["user_type"]
          user_role: string
          verified: boolean
          view_credits: number
        }[]
      }
      get_worker_contact: {
        Args: { worker_id: string }
        Returns: {
          email: string
          phone: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_beta_tester: { Args: { user_auth_id: string }; Returns: boolean }
      is_colaborador_autorizado: {
        Args: { check_email: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      job_status: "published" | "in_progress" | "done" | "cancelled"
      payment_gateway: "stripe" | "mercadopago"
      payment_status: "pending" | "paid" | "failed" | "in_process"
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
      job_status: ["published", "in_progress", "done", "cancelled"],
      payment_gateway: ["stripe", "mercadopago"],
      payment_status: ["pending", "paid", "failed", "in_process"],
      user_type: ["contractor", "worker"],
    },
  },
} as const
