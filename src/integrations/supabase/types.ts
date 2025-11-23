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
      application_history: {
        Row: {
          adopter_id: string
          adopter_name: string
          application_id: string
          applied_at: string
          approved_at: string | null
          created_at: string
          id: string
          message: string
          pet_id: string
          pet_name: string
          rejected_at: string | null
          rejection_reason: string | null
          shelter_id: string
          shelter_name: string
          status: string
        }
        Insert: {
          adopter_id: string
          adopter_name: string
          application_id: string
          applied_at: string
          approved_at?: string | null
          created_at?: string
          id?: string
          message: string
          pet_id: string
          pet_name: string
          rejected_at?: string | null
          rejection_reason?: string | null
          shelter_id: string
          shelter_name: string
          status: string
        }
        Update: {
          adopter_id?: string
          adopter_name?: string
          application_id?: string
          applied_at?: string
          approved_at?: string | null
          created_at?: string
          id?: string
          message?: string
          pet_id?: string
          pet_name?: string
          rejected_at?: string | null
          rejection_reason?: string | null
          shelter_id?: string
          shelter_name?: string
          status?: string
        }
        Relationships: []
      }
      applications: {
        Row: {
          adopter_id: string
          approved_at: string | null
          created_at: string | null
          deletion_scheduled_at: string | null
          id: string
          message: string
          pet_id: string
          rejected_at: string | null
          rejection_reason: string | null
          shelter_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          adopter_id: string
          approved_at?: string | null
          created_at?: string | null
          deletion_scheduled_at?: string | null
          id?: string
          message: string
          pet_id: string
          rejected_at?: string | null
          rejection_reason?: string | null
          shelter_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          adopter_id?: string
          approved_at?: string | null
          created_at?: string | null
          deletion_scheduled_at?: string | null
          id?: string
          message?: string
          pet_id?: string
          rejected_at?: string | null
          rejection_reason?: string | null
          shelter_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      liked_pets: {
        Row: {
          created_at: string | null
          id: string
          pet_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          pet_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          pet_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "liked_pets_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          application_id: string
          created_at: string | null
          id: string
          message: string
          sender_id: string
        }
        Insert: {
          application_id: string
          created_at?: string | null
          id?: string
          message: string
          sender_id: string
        }
        Update: {
          application_id?: string
          created_at?: string | null
          id?: string
          message?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      pets: {
        Row: {
          age: number
          breed: string
          created_at: string | null
          description: string
          gender: string
          id: string
          location: string
          name: string
          photo_url: string | null
          shelter_id: string
          size: string
          species: string
          status: string
          updated_at: string | null
        }
        Insert: {
          age: number
          breed: string
          created_at?: string | null
          description: string
          gender: string
          id?: string
          location: string
          name: string
          photo_url?: string | null
          shelter_id: string
          size: string
          species: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          age?: number
          breed?: string
          created_at?: string | null
          description?: string
          gender?: string
          id?: string
          location?: string
          name?: string
          photo_url?: string | null
          shelter_id?: string
          size?: string
          species?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          shelter_description: string | null
          shelter_name: string | null
          theme_preference: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id: string
          phone?: string | null
          role: Database["public"]["Enums"]["app_role"]
          shelter_description?: string | null
          shelter_name?: string | null
          theme_preference?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          shelter_description?: string | null
          shelter_name?: string | null
          theme_preference?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
          role: Database["public"]["Enums"]["app_role"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_days_until_deletion: {
        Args: { deletion_date: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "shelter" | "adopter" | "ignored"
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
      app_role: ["admin", "shelter", "adopter", "ignored"],
    },
  },
} as const
