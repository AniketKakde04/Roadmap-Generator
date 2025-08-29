import { User as SupabaseUser } from '@supabase/supabase-js';

export interface Resource {
  title: string;
  url: string;
  type: 'video' | 'article' | 'documentation' | 'course' | 'tool' | 'other';
}

export interface Step {
  title: string;
  description: string;
  resources: Resource[];
}

export interface Roadmap {
  title:string;
  description: string;
  steps: Step[];
}

export interface SavedRoadmap extends Roadmap {
  id: string;
  savedAt: string;
  completedSteps: number[]; // Array of step indices
}

export interface ProjectSuggestion {
  title: string;
  description: string;
  reasoning: string;
}

export type User = SupabaseUser;

export interface AuthCredentials {
    name?: string;
    email: string;
    password?: string;
}

// From your Supabase project's Database schema
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      roadmaps: {
        Row: {
          id: string
          user_id: string
          created_at: string
          title: string
          description: string | null
          steps: Json | null
          completed_steps: Json | null
        }
        Insert: {
          id?: string
          user_id?: string
          created_at?: string
          title: string
          description?: string | null
          steps?: Json | null
          completed_steps?: Json | null
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          title?: string
          description?: string | null
          steps?: Json | null
          completed_steps?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "roadmaps_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          id: string
          name: string | null
          email: string | null
          created_at: string
        }
        Insert: {
          id: string
          name?: string | null
          email?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          email?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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

