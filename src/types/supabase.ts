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
      articles: {
        Row: {
          id: string
          game_id: string
          content: string
          title: string
          sport_id: string
          status: string
          image_url?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          game_id: string
          content: string
          title: string
          sport_id: string
          status?: string
          image_url?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          game_id?: string
          content?: string
          title?: string
          sport_id?: string
          status?: string
          image_url?: string
          created_at?: string
          updated_at?: string
        }
      }
      games: {
        Row: {
          id: string
          sport_id: string
          home_team_id: string
          away_team_id: string
          start_time: string
          status: 'scheduled' | 'in_progress' | 'final' | 'cancelled'
          home_score: number
          away_score: number
          external_id: string
          venue: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sport_id: string
          home_team_id: string
          away_team_id: string
          start_time: string
          status?: 'scheduled' | 'in_progress' | 'final' | 'cancelled'
          home_score?: number
          away_score?: number
          external_id: string
          venue: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sport_id?: string
          home_team_id?: string
          away_team_id?: string
          start_time?: string
          status?: 'scheduled' | 'in_progress' | 'final' | 'cancelled'
          home_score?: number
          away_score?: number
          external_id?: string
          venue?: string
          created_at?: string
          updated_at?: string
        }
      }
      picks: {
        Row: {
          id: string
          user_id: string
          game_id: string
          prediction: 'home' | 'away' | 'draw'
          result: 'pending' | 'win' | 'loss' | 'push'
          xp_earned: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          game_id: string
          prediction: 'home' | 'away' | 'draw'
          result?: 'pending' | 'win' | 'loss' | 'push'
          xp_earned?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          game_id?: string
          prediction?: 'home' | 'away' | 'draw'
          result?: 'pending' | 'win' | 'loss' | 'push'
          xp_earned?: number
          created_at?: string
          updated_at?: string
        }
      }
      sports: {
        Row: {
          id: string
          name: string
          type: 'nba' | 'nfl' | 'mlb' | 'nhl' | 'soccer'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'nba' | 'nfl' | 'mlb' | 'nhl' | 'soccer'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'nba' | 'nfl' | 'mlb' | 'nhl' | 'soccer'
          created_at?: string
          updated_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          sport_id: string
          external_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          sport_id: string
          external_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          sport_id?: string
          external_id?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Functions: {
      increment_user_stats: {
        Args: {
          user_id: string
          xp_amount: number
          is_win: boolean
        }
        Returns: void
      }
    }
  }
} 