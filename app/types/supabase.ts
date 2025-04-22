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
          title: string
          content: string
          summary: string | null
          key_stat: string | null
          key_storyline: string | null
          key_prediction: string | null
          sport_id: number | null
          game_id: string | null
          published_at: string
          created_at: string
          updated_at: string
          metadata: Json | null
        }
        Insert: {
          id?: string
          title: string
          content: string
          summary?: string | null
          key_stat?: string | null
          key_storyline?: string | null
          key_prediction?: string | null
          sport_id?: number | null
          game_id?: string | null
          published_at?: string
          created_at?: string
          updated_at?: string
          metadata?: Json | null
        }
        Update: {
          id?: string
          title?: string
          content?: string
          summary?: string | null
          key_stat?: string | null
          key_storyline?: string | null
          key_prediction?: string | null
          sport_id?: number | null
          game_id?: string | null
          published_at?: string
          created_at?: string
          updated_at?: string
          metadata?: Json | null
        }
      }
      comments: {
        Row: {
          id: string
          article_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          article_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          article_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          created_at?: string
        }
      }
      games: {
        Row: {
          id: string
          sport_id: number
          home_team_id: number
          away_team_id: number
          start_time: string
          lock_time: string
          home_score: number | null
          away_score: number | null
          status: string
          winner_id: number | null
          external_id: string | null
          created_at: string
          updated_at: string
          processed: boolean | null
        }
        Insert: {
          id?: string
          sport_id: number
          home_team_id: number
          away_team_id: number
          start_time: string
          lock_time: string
          home_score?: number | null
          away_score?: number | null
          status?: string
          winner_id?: number | null
          external_id?: string | null
          created_at?: string
          updated_at?: string
          processed?: boolean | null
        }
        Update: {
          id?: string
          sport_id?: number
          home_team_id?: number
          away_team_id?: number
          start_time?: string
          lock_time?: string
          home_score?: number | null
          away_score?: number | null
          status?: string
          winner_id?: number | null
          external_id?: string | null
          created_at?: string
          updated_at?: string
          processed?: boolean | null
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          data: Json | null
          seen: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          data?: Json | null
          seen?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          data?: Json | null
          seen?: boolean
          created_at?: string
        }
      }
      picks: {
        Row: {
          id: string
          user_id: string
          game_id: string
          pick_team_id: number
          correct: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          game_id: string
          pick_team_id: number
          correct?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          game_id?: string
          pick_team_id?: number
          correct?: boolean | null
          created_at?: string
        }
      }
      sports: {
        Row: {
          id: number
          name: string
          display_name: string
          active: boolean
          icon_url: string | null
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          display_name: string
          active?: boolean
          icon_url?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          display_name?: string
          active?: boolean
          icon_url?: string | null
          created_at?: string
        }
      }
      teams: {
        Row: {
          id: number
          sport_id: number
          name: string
          abbreviation: string
          logo_url: string | null
          city: string | null
          created_at: string
        }
        Insert: {
          id?: number
          sport_id: number
          name: string
          abbreviation: string
          logo_url?: string | null
          city?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          sport_id?: number
          name?: string
          abbreviation?: string
          logo_url?: string | null
          city?: string | null
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          username: string | null
          avatar_url: string | null
          bio: string | null
          ring: string
          correct_picks: number
          total_picks: number
          hit_rate: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          username?: string | null
          avatar_url?: string | null
          bio?: string | null
          ring?: string
          correct_picks?: number
          total_picks?: number
          hit_rate?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string | null
          avatar_url?: string | null
          bio?: string | null
          ring?: string
          correct_picks?: number
          total_picks?: number
          hit_rate?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      v_friends_leaderboard: {
        Row: {
          id: string | null
          username: string | null
          avatar_url: string | null
          ring: string | null
          correct_picks: number | null
          total_picks: number | null
          hit_rate: number | null
          follower_id: string | null
        }
        Insert: {
          id?: string | null
          username?: string | null
          avatar_url?: string | null
          ring?: string | null
          correct_picks?: number | null
          total_picks?: number | null
          hit_rate?: number | null
          follower_id?: string | null
        }
        Update: {
          id?: string | null
          username?: string | null
          avatar_url?: string | null
          ring?: string | null
          correct_picks?: number | null
          total_picks?: number | null
          hit_rate?: number | null
          follower_id?: string | null
        }
      }
      v_leaderboard: {
        Row: {
          id: string | null
          username: string | null
          avatar_url: string | null
          ring: string | null
          correct_picks: number | null
          total_picks: number | null
          hit_rate: number | null
          followers_count: number | null
        }
        Insert: {
          id?: string | null
          username?: string | null
          avatar_url?: string | null
          ring?: string | null
          correct_picks?: number | null
          total_picks?: number | null
          hit_rate?: number | null
          followers_count?: number | null
        }
        Update: {
          id?: string | null
          username?: string | null
          avatar_url?: string | null
          ring?: string | null
          correct_picks?: number | null
          total_picks?: number | null
          hit_rate?: number | null
          followers_count?: number | null
        }
      }
      v_today_games: {
        Row: {
          id: string | null
          sport_id: number | null
          home_team_id: number | null
          away_team_id: number | null
          start_time: string | null
          lock_time: string | null
          home_score: number | null
          away_score: number | null
          status: string | null
          winner_id: number | null
          external_id: string | null
          created_at: string | null
          updated_at: string | null
          home_team_name: string | null
          home_team_abbr: string | null
          home_team_logo: string | null
          away_team_name: string | null
          away_team_abbr: string | null
          away_team_logo: string | null
          sport_name: string | null
          sport_display_name: string | null
          sport_icon: string | null
        }
      }
    }
    Functions: {
      get_user_friends_rank: {
        Args: {
          user_id: string
        }
        Returns: number
      }
      get_user_global_rank: {
        Args: {
          user_id: string
        }
        Returns: number
      }
    }
  }
} 