import { User as SupabaseUser } from '@supabase/supabase-js';

// --- (Existing types remain the same) ---
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
  is_public?: boolean;
}

export interface ProjectSuggestion {
  title: string;
  description: string;
  reasoning: string;
}

// --- THIS IS THE NEW TYPE FOR THE ANALYSIS REPORT ---
export interface AnalysisReport {
    matchScore: number;
    strengths: string[];
    gaps: string[];
    feedback: string[];
    projectSuggestions: ProjectSuggestion[];
}


export type User = SupabaseUser;

export interface AuthCredentials {
    name?: string;
    email: string;
    password?: string;
}


// --- UPDATED TYPES FOR DETAILED RESUME BUILDER ---
export interface ResumeData {
  id?: string;
  user_id?: string;
  full_name: string;
  job_title: string;
  email: string;
  phone: string;
  linkedin_url: string;
  github_url: string;
  summary: string;
  education: EducationEntry[];
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  skills: SkillEntry[];
  updated_at?: string;
}

export interface EducationEntry {
  id: string;
  university: string;
  degree: string;
  startDate: string;
  endDate: string;
}

export interface ExperienceEntry {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface ProjectEntry {
  id: string;
  name: string;
  description: string;
}

export interface SkillEntry {
  id: string;
  name: string;
}
// --- NEW TYPES FOR APTITUDE FEATURE ---

// Matches the 'aptitude_topics' table
export interface AptitudeTopic {
  id: string;
  name: string;
  category: string;
}
// Matches the 'aptitude_questions' table
export interface AptitudeQuestion {
  id: string;
  topic_id: string;
  question_text: string;
  options: string[];
  correct_answer_index: number;
  explanation: string;
  source_tag?: string;
  difficulty?: number;
  is_ai_generated?: boolean;
}

export interface GeneratedAptitudeQuestion {
  question_text: string;
  options: string[];
  correct_answer_index: number;
  explanation: string;
}

// --- (Existing Database type is updated automatically by Supabase CLI, but this is a manual representation) ---
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
          is_public: boolean | null
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
          title: string
          description?: string | null
          steps?: Json | null
          completed_steps?: Json | null
          is_public?: boolean | null
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          title?: string
          description?: string | null
          steps?: Json | null
          completed_steps?: Json | null
          is_public?: boolean | null
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
        }
        Insert: {
          id: string
          name?: string | null
          email?: string | null
        }
        Update: {
          id?: string
          name?: string | null
          email?: string | null
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
      },
      resumes: {
        Row: {
          id: string;
          user_id: string;
          full_name: string | null;
          job_title: string | null;
          email: string | null;
          phone: string | null;
          linkedin_url: string | null;
          github_url: string | null;
          summary: string | null;
          education: Json | null;
          experience: Json | null;
          projects: Json | null;
          skills: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name?: string | null;
          job_title?: string | null;
          email?: string | null;
          phone?: string | null;
          linkedin_url?: string | null;
          github_url?: string | null;
          summary?: string | null;
          education?: Json | null;
          experience?: Json | null;
          projects?: Json | null;
          skills?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string | null;
          job_title?: string | null;
          email?: string | null;
          phone?: string | null;
          linkedin_url?: string | null;
          github_url?: string | null;
          summary?: string | null;
          education?: Json | null;
          experience?: Json | null;
          projects?: Json | null;
          skills?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      }
      aptitude_topics: {
        Row: {
          id: string
          name: string
          category: 'Quantitative' | 'Logical' | 'Verbal' | 'Other'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category: 'Quantitative' | 'Logical' | 'Verbal' | 'Other'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: 'Quantitative' | 'Logical' | 'Verbal' | 'Other'
          created_at?: string
        }
      }
      aptitude_questions: {
        Row: {
          id: string
          topic_id: string
          question_text: string
          options: Json // Stored as JSONB
          correct_answer_index: number
          explanation: string
          source_tag: string | null
          difficulty: number | null
          is_ai_generated: boolean
          created_at: string
        }
        Insert: {
          id?: string
          topic_id: string
          question_text: string
          options: Json
          correct_answer_index: number
          explanation: string
          source_tag?: string | null
          difficulty?: number | null
          is_ai_generated?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          topic_id?: string
          question_text?: string
          options?: Json
          correct_answer_index?: number
          explanation?: string
          source_tag?: string | null
          difficulty?: number | null
          is_ai_generated?: boolean
          created_at?: string
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

