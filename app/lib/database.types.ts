export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          avatar_url: string | null
          created_at: string
          points: number
          accuracy: number
          current_streak: number
          best_streak: number
          rank: string
        }
        Insert: {
          id: string
          username: string
          avatar_url?: string | null
          created_at?: string
          points?: number
          accuracy?: number
          current_streak?: number
          best_streak?: number
          rank?: string
        }
        Update: {
          id?: string
          username?: string
          avatar_url?: string | null
          created_at?: string
          points?: number
          accuracy?: number
          current_streak?: number
          best_streak?: number
          rank?: string
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
  }
} 