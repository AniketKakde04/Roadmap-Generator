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
  completedSteps: number[];
  is_public: boolean;
  like_count: number;
  is_featured: boolean;
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

export interface ResumeData {
  id: string;
  user_id: string;
  fullName: string;
  email: string;
  phone: string;
  linkedin_url: string;
  github_url: string;
  summary: string;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  skills: SkillEntry[];
  updated_at: string;
}

// --- NEW RESUME TYPES ---
export interface EducationEntry {
    id: string;
    institution: string;
    degree: string;
    field_of_study: string;
    start_date: string;
    end_date: string;
}

export interface ExperienceEntry {
    id: string;
    company: string;
    job_title: string;
    start_date: string;
    end_date: string;
    description: string;
}

export interface ProjectEntry {
    id: string;
    name: string;
    description: string;
    url: string;
}

export interface SkillEntry {
    id: string;
    name: string;
}


// --- END NEW RESUME TYPES ---


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
      resumes: {
        Row: {
          id: string
          user_id: string
          full_name: string | null
          email: string | null
          phone: string | null
          linkedin_url: string | null
          github_url: string | null
          summary: string | null
          education: Json | null
          experience: Json | null
          projects: Json | null
          skills: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          full_name?: string | null
          email?: string | null
          phone?: string | null
          linkedin_url?: string | null
          github_url?: string | null
          summary?: string | null
          education?: Json | null
          experience?: Json | null
          projects?: Json | null
          skills?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string | null
          email?: string | null
          phone?: string | null
          linkedin_url?: string | null
          github_url?: string | null
          summary?: string | null
          education?: Json | null
          experience?: Json | null
          projects?: Json | null
          skills?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "resumes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      roadmaps: {
        Row: {
          id: string
          user_id: string
          created_at: string
          title: string
          description: string | null
          steps: Json | null
          completed_steps: Json | null
          is_public: boolean
          like_count: number
          is_featured: boolean
        }
        Insert: {
          id?: string
          user_id?: string
          created_at?: string
          title: string
          description?: string | null
          steps?: Json | null
          completed_steps?: Json | null
          is_public?: boolean
          like_count?: number
          is_featured?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          title?: string
          description?: string | null
          steps?: Json | null
          completed_steps?: Json | null
          is_public?: boolean
          like_count?: number
          is_featured?: boolean
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

