export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      field_offices: {
        Row: {
          id: number
          name: string
          code: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          code: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          code?: string
          created_at?: string
        }
      }
      admin_users: {
        Row: {
          id: number
          username: string
          password_hash: string
          field_office_id: number | null
          is_main_admin: boolean
          created_at: string
        }
        Insert: {
          id?: number
          username: string
          password_hash: string
          field_office_id?: number | null
          is_main_admin?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          username?: string
          password_hash?: string
          field_office_id?: number | null
          is_main_admin?: boolean
          created_at?: string
        }
      }
      individual_registrations: {
        Row: {
          id: number
          first_name: string
          last_name: string
          email: string
          phone: string
          emergency_contact: string
          emergency_phone: string
          medical_conditions: string | null
          status: "pending" | "approved" | "rejected"
          submitted_at: string
          field_office_id: number
        }
        Insert: {
          id?: number
          first_name: string
          last_name: string
          email: string
          phone: string
          emergency_contact: string
          emergency_phone: string
          medical_conditions?: string | null
          status?: "pending" | "approved" | "rejected"
          submitted_at?: string
          field_office_id: number
        }
        Update: {
          id?: number
          first_name?: string
          last_name?: string
          email?: string
          phone?: string
          emergency_contact?: string
          emergency_phone?: string
          medical_conditions?: string | null
          status?: "pending" | "approved" | "rejected"
          submitted_at?: string
          field_office_id?: number
        }
      }
      group_registrations: {
        Row: {
          id: number
          organization_name: string
          contact_name: string
          contact_email: string
          contact_phone: string
          file_url: string
          status: "pending" | "approved" | "rejected"
          submitted_at: string
          field_office_id: number
        }
        Insert: {
          id?: number
          organization_name: string
          contact_name: string
          contact_email: string
          contact_phone: string
          file_url: string
          status?: "pending" | "approved" | "rejected"
          submitted_at?: string
          field_office_id: number
        }
        Update: {
          id?: number
          organization_name?: string
          contact_name?: string
          contact_email?: string
          contact_phone?: string
          file_url?: string
          status?: "pending" | "approved" | "rejected"
          submitted_at?: string
          field_office_id?: number
        }
      }
      group_participants: {
        Row: {
          id: number
          group_registration_id: number
          first_name: string
          last_name: string
          age: number
          emergency_contact: string
          emergency_phone: string
          medical_conditions: string | null
        }
        Insert: {
          id?: number
          group_registration_id: number
          first_name: string
          last_name: string
          age: number
          emergency_contact: string
          emergency_phone: string
          medical_conditions?: string | null
        }
        Update: {
          id?: number
          group_registration_id?: number
          first_name?: string
          last_name?: string
          age?: number
          emergency_contact?: string
          emergency_phone?: string
          medical_conditions?: string | null
        }
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
