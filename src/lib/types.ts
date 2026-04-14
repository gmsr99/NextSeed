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
      extracurricular_activities: {
        Row: {
          id: string
          family_id: string
          child_id: string | null
          name: string
          type: string | null
          location: string | null
          day_of_week: number | null
          start_time: string | null
          end_time: string | null
          travel_time_minutes: number
          notes: string | null
          is_active: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          family_id: string
          child_id?: string | null
          name: string
          type?: string | null
          location?: string | null
          day_of_week?: number | null
          start_time?: string | null
          end_time?: string | null
          travel_time_minutes?: number
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          family_id?: string
          child_id?: string | null
          name?: string
          type?: string | null
          location?: string | null
          day_of_week?: number | null
          start_time?: string | null
          end_time?: string | null
          travel_time_minutes?: number
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      activities: {
        Row: {
          activity_date: string
          child_id: string | null
          created_at: string | null
          description: string | null
          discipline: string | null
          family_id: string
          id: string
          is_public: boolean | null
          photos: string[] | null
          plan_item_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          activity_date: string
          child_id?: string | null
          created_at?: string | null
          description?: string | null
          discipline?: string | null
          family_id: string
          id?: string
          is_public?: boolean | null
          photos?: string[] | null
          plan_item_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          activity_date?: string
          child_id?: string | null
          created_at?: string | null
          description?: string | null
          discipline?: string | null
          family_id?: string
          id?: string
          is_public?: boolean | null
          photos?: string[] | null
          plan_item_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      children: {
        Row: {
          birth_date: string
          created_at: string | null
          curriculum: string | null
          family_id: string
          id: string
          interests: string[] | null
          learning_pace: string | null
          learning_preferences: string | null
          manuals: string | null
          name: string
          school: string | null
          school_year: string
          updated_at: string | null
        }
        Insert: {
          birth_date: string
          created_at?: string | null
          curriculum?: string | null
          family_id: string
          id?: string
          interests?: string[] | null
          learning_pace?: string | null
          learning_preferences?: string | null
          manuals?: string | null
          name: string
          school?: string | null
          school_year: string
          updated_at?: string | null
        }
        Update: {
          birth_date?: string
          created_at?: string | null
          curriculum?: string | null
          family_id?: string
          id?: string
          interests?: string[] | null
          learning_pace?: string | null
          learning_preferences?: string | null
          manuals?: string | null
          name?: string
          school?: string | null
          school_year?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      curriculum_disciplines: {
        Row: {
          created_at: string
          discipline_key: string
          discipline_name: string
          id: string
          objectives: Json
          school_year: string
          weekly_minutes: number | null
        }
        Insert: {
          created_at?: string
          discipline_key: string
          discipline_name: string
          id?: string
          objectives?: Json
          school_year: string
          weekly_minutes?: number | null
        }
        Update: {
          created_at?: string
          discipline_key?: string
          discipline_name?: string
          id?: string
          objectives?: Json
          school_year?: string
          weekly_minutes?: number | null
        }
        Relationships: []
      }
      families: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      family_invites: {
        Row: {
          created_at: string | null
          email: string
          family_id: string
          id: string
          invited_by: string
          status: string
        }
        Insert: {
          created_at?: string | null
          email: string
          family_id: string
          id?: string
          invited_by: string
          status?: string
        }
        Update: {
          created_at?: string | null
          email?: string
          family_id?: string
          id?: string
          invited_by?: string
          status?: string
        }
        Relationships: []
      }
      family_members: {
        Row: {
          email: string | null
          family_id: string
          id: string
          joined_at: string | null
          role: string
          user_id: string
        }
        Insert: {
          email?: string | null
          family_id: string
          id?: string
          joined_at?: string | null
          role?: string
          user_id: string
        }
        Update: {
          email?: string | null
          family_id?: string
          id?: string
          joined_at?: string | null
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      mission_completions: {
        Row: {
          child_id: string
          completed_at: string | null
          id: string
          learned: string | null
          mission_id: string | null
          photo_url: string | null
          points_earned: number | null
          reflection: string | null
          template_mission_id: string | null
        }
        Insert: {
          child_id: string
          completed_at?: string | null
          id?: string
          learned?: string | null
          mission_id?: string | null
          photo_url?: string | null
          points_earned?: number | null
          reflection?: string | null
          template_mission_id?: string | null
        }
        Update: {
          child_id?: string
          completed_at?: string | null
          id?: string
          learned?: string | null
          mission_id?: string | null
          photo_url?: string | null
          points_earned?: number | null
          reflection?: string | null
          template_mission_id?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          child_id: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          family_id: string
          id: string
          phases: Json | null
          start_date: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          child_id?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          family_id: string
          id?: string
          phases?: Json | null
          start_date?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          child_id?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          family_id?: string
          id?: string
          phases?: Json | null
          start_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      weekly_plan_items: {
        Row: {
          child_id: string
          created_at: string | null
          day_of_week: number
          description: string | null
          discipline: string
          id: string
          is_friday_world: boolean | null
          materials: string[] | null
          plan_id: string
          sort_order: number | null
          time_slot: string
          title: string
        }
        Insert: {
          child_id: string
          created_at?: string | null
          day_of_week: number
          description?: string | null
          discipline: string
          id?: string
          is_friday_world?: boolean | null
          materials?: string[] | null
          plan_id: string
          sort_order?: number | null
          time_slot: string
          title: string
        }
        Update: {
          child_id?: string
          created_at?: string | null
          day_of_week?: number
          description?: string | null
          discipline?: string
          id?: string
          is_friday_world?: boolean | null
          materials?: string[] | null
          plan_id?: string
          sort_order?: number | null
          time_slot?: string
          title?: string
        }
        Relationships: []
      }
      weekly_plans: {
        Row: {
          child_interests: Json | null
          created_at: string | null
          family_id: string
          friday_activity: string | null
          generated_at: string | null
          id: string
          notes: string | null
          reading_theme: string | null
          sent_at: string | null
          status: string | null
          updated_at: string | null
          version: number
          week_start: string
        }
        Insert: {
          child_interests?: Json | null
          created_at?: string | null
          family_id: string
          friday_activity?: string | null
          generated_at?: string | null
          id?: string
          notes?: string | null
          reading_theme?: string | null
          sent_at?: string | null
          status?: string | null
          updated_at?: string | null
          version?: number
          week_start: string
        }
        Update: {
          child_interests?: Json | null
          created_at?: string | null
          family_id?: string
          friday_activity?: string | null
          generated_at?: string | null
          id?: string
          notes?: string | null
          reading_theme?: string | null
          sent_at?: string | null
          status?: string | null
          updated_at?: string | null
          version?: number
          week_start?: string
        }
        Relationships: []
      }
      world_missions: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          family_id: string
          id: string
          is_template: boolean | null
          points: number | null
          title: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          family_id: string
          id?: string
          is_template?: boolean | null
          points?: number | null
          title: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          family_id?: string
          id?: string
          is_template?: boolean | null
          points?: number | null
          title?: string
        }
        Relationships: []
      }
      nexseed_curriculum: {
        Row: {
          id: string
          school_year: string
          discipline_key: string
          discipline_name: string
          area: string | null
          objective: string
          description: string | null
          activities: Json | null
          skills: string[] | null
          difficulty: 'introdução' | 'consolidação' | 'extensão' | null
          source: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          school_year: string
          discipline_key: string
          discipline_name: string
          area?: string | null
          objective: string
          description?: string | null
          activities?: Json | null
          skills?: string[] | null
          difficulty?: 'introdução' | 'consolidação' | 'extensão' | null
          source?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          school_year?: string
          discipline_key?: string
          discipline_name?: string
          area?: string | null
          objective?: string
          description?: string | null
          activities?: Json | null
          skills?: string[] | null
          difficulty?: 'introdução' | 'consolidação' | 'extensão' | null
          source?: string | null
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      curriculum_contents: {
        Row: {
          id: string
          school_year: string
          discipline: string
          period: string
          domain: string
          content: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          school_year: string
          discipline: string
          period: string
          domain: string
          content: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          school_year?: string
          discipline?: string
          period?: string
          domain?: string
          content?: string
          sort_order?: number
          created_at?: string
        }
        Relationships: []
      }
      child_content_progress: {
        Row: {
          id: string
          child_id: string
          content_id: string
          status: 'a_aprender' | 'em_progresso' | 'dominado'
          success_level: number | null
          taught_on: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          child_id: string
          content_id: string
          status?: 'a_aprender' | 'em_progresso' | 'dominado'
          success_level?: number | null
          taught_on?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          child_id?: string
          content_id?: string
          status?: 'a_aprender' | 'em_progresso' | 'dominado'
          success_level?: number | null
          taught_on?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      curriculum_coverage: {
        Row: {
          id: string
          family_id: string
          activity_id: string | null
          project_id: string | null
          curriculum_id: string
          confidence: number | null
          source: 'ai' | 'manual'
          created_at: string
        }
        Insert: {
          id?: string
          family_id: string
          activity_id?: string | null
          project_id?: string | null
          curriculum_id: string
          confidence?: number | null
          source?: 'ai' | 'manual'
          created_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          activity_id?: string | null
          project_id?: string | null
          curriculum_id?: string
          confidence?: number | null
          source?: 'ai' | 'manual'
          created_at?: string
        }
        Relationships: []
      }
      methodologies: {
        Row: {
          id: string
          slug: string
          name: string
          category: 'pedagogias-classicas' | 'natureza-experiencia' | 'alta-autonomia' | 'aprendizagem-ativa' | 'contemporaneo'
          short_description: string
          philosophy_summary: string | null
          intensity: 'muito-baixa' | 'baixa' | 'media' | 'alta'
          materials_cost: 'baixo' | 'medio' | 'alto'
          age_min: number
          age_max: number
          ai_generation_style: string
          keywords: string[]
          sort_order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          category: 'pedagogias-classicas' | 'natureza-experiencia' | 'alta-autonomia' | 'aprendizagem-ativa' | 'contemporaneo'
          short_description: string
          philosophy_summary?: string | null
          intensity: 'muito-baixa' | 'baixa' | 'media' | 'alta'
          materials_cost: 'baixo' | 'medio' | 'alto'
          age_min: number
          age_max: number
          ai_generation_style?: string
          keywords?: string[]
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          category?: 'pedagogias-classicas' | 'natureza-experiencia' | 'alta-autonomia' | 'aprendizagem-ativa' | 'contemporaneo'
          short_description?: string
          philosophy_summary?: string | null
          intensity?: 'muito-baixa' | 'baixa' | 'media' | 'alta'
          materials_cost?: 'baixo' | 'medio' | 'alto'
          age_min?: number
          age_max?: number
          ai_generation_style?: string
          keywords?: string[]
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      methodology_principles: {
        Row: {
          id: string
          methodology_id: string
          title: string
          description: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          methodology_id: string
          title: string
          description: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          methodology_id?: string
          title?: string
          description?: string
          sort_order?: number
          created_at?: string
        }
        Relationships: []
      }
      methodology_activities: {
        Row: {
          id: string
          methodology_id: string
          discipline_key: 'language' | 'math' | 'science' | 'arts' | 'music' | 'movement' | 'life_skills' | 'project' | 'social_emotional'
          age_min: number
          age_max: number
          activity_title: string
          activity_description: string
          materials: string[]
          duration_minutes: number | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          methodology_id: string
          discipline_key: 'language' | 'math' | 'science' | 'arts' | 'music' | 'movement' | 'life_skills' | 'project' | 'social_emotional'
          age_min: number
          age_max: number
          activity_title: string
          activity_description: string
          materials?: string[]
          duration_minutes?: number | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          methodology_id?: string
          discipline_key?: 'language' | 'math' | 'science' | 'arts' | 'music' | 'movement' | 'life_skills' | 'project' | 'social_emotional'
          age_min?: number
          age_max?: number
          activity_title?: string
          activity_description?: string
          materials?: string[]
          duration_minutes?: number | null
          sort_order?: number
          created_at?: string
        }
        Relationships: []
      }
      methodology_compatibility: {
        Row: {
          methodology_a_id: string
          methodology_b_id: string
          compatibility: 'excelente' | 'muito-boa' | 'boa' | 'limitada'
          notes: string | null
        }
        Insert: {
          methodology_a_id: string
          methodology_b_id: string
          compatibility: 'excelente' | 'muito-boa' | 'boa' | 'limitada'
          notes?: string | null
        }
        Update: {
          methodology_a_id?: string
          methodology_b_id?: string
          compatibility?: 'excelente' | 'muito-boa' | 'boa' | 'limitada'
          notes?: string | null
        }
        Relationships: []
      }
      family_methodologies: {
        Row: {
          family_id: string
          methodology_id: string
          priority: number
          selected_at: string
        }
        Insert: {
          family_id: string
          methodology_id: string
          priority?: number
          selected_at?: string
        }
        Update: {
          family_id?: string
          methodology_id?: string
          priority?: number
          selected_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_family_invite: {
        Args: { p_family_id: string }
        Returns: undefined
      }
      my_family_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      remove_family_member: {
        Args: { p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]

export type Activity = Tables<"activities">
export type Family = Tables<"families">
export type Child = Tables<"children">

// ─── Atividades Extracurriculares ─────────────────────────────────────────────
// Tipo canónico (linha completa da tabela)
export type ExtracurricularActivity = Tables<"extracurricular_activities">
export type NexseedCurriculum = Tables<"nexseed_curriculum">
export type CurriculumCoverage = Tables<"curriculum_coverage">

export type CurriculumContent = Tables<"curriculum_contents">
export type ContentProgress = Tables<"child_content_progress">
export type ContentProgressStatus = ContentProgress["status"]

export interface ExtracurricularItem {
  id: string;
  child_id: string | null;
  name: string;
  type: string | null;
  location: string | null;
  day_of_week: number | null; // 1=Seg … 7=Dom
  start_time: string | null;  // "HH:MM"
  end_time: string | null;    // "HH:MM"
  travel_time_minutes: number;
}

// ─── Metodologias ─────────────────────────────────────────────────────────────

export type MethodologyCategory =
  | 'pedagogias-classicas'
  | 'natureza-experiencia'
  | 'alta-autonomia'
  | 'aprendizagem-ativa'
  | 'contemporaneo';

export type MethodologyIntensity = 'muito-baixa' | 'baixa' | 'media' | 'alta';
export type MethodologyMaterialsCost = 'baixo' | 'medio' | 'alto';

export interface MethodologyPrinciple {
  id: string;
  methodology_id: string;
  title: string;
  description: string | null;
  sort_order: number;
}

export interface MethodologyCompatibility {
  methodology_a_id: string;
  methodology_b_id: string;
  compatibility: string; // 'excelente' | 'muito-boa' | 'boa' | 'limitada'
  notes: string | null;
}

export interface Methodology {
  id: string;
  slug: string;
  name: string;
  category: MethodologyCategory;
  short_description: string;
  philosophy_summary: string | null;
  intensity: MethodologyIntensity;
  materials_cost: MethodologyMaterialsCost;
  age_min: number;
  age_max: number;
  ai_generation_style: string | null;
  keywords: string[] | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  methodology_principles?: MethodologyPrinciple[];
}

// Priority 1 = Principal (plano gerado com pleno peso)
// Priority 2 = Secundária (peso parcial)
// Priority 3 = Complementar (referência)
// PK composta: (family_id, methodology_id) — sem coluna id
export interface FamilyMethodology {
  family_id: string;
  methodology_id: string;
  priority: 1 | 2 | 3;
  selected_at: string;
  methodology?: Methodology;
}

// ─── Calendar Events ───────────────────────────────────────────────
export interface CalendarEvent {
  id: string;
  family_id: string;
  child_id: string | null;
  title: string;
  date: string; // YYYY-MM-DD
  start_time: string | null; // HH:MM:SS
  end_time: string | null;
  notes: string | null;
  type: 'consulta' | 'saida' | 'visita' | 'evento';
  created_at: string;
}

export type CalendarEventInsert = Omit<CalendarEvent, 'id' | 'created_at'>;
export type CalendarEventUpdate = Partial<CalendarEventInsert> & { id: string };

// ─── Mission Rewards ───────────────────────────────────────────────
export interface MissionReward {
  id: string;
  family_id: string;
  title: string;
  description: string | null;
  points_cost: number;
  emoji: string | null;
  is_active: boolean;
  created_at: string;
}

export type MissionRewardInsert = Omit<MissionReward, 'id' | 'created_at'>;

export interface RewardRedemption {
  id: string;
  child_id: string;
  reward_id: string;
  points_spent: number;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  resolved_at: string | null;
  notes: string | null;
}

export type RewardRedemptionInsert = Omit<RewardRedemption, 'id' | 'requested_at' | 'resolved_at'>;

// ─── Literacy Progress ─────────────────────────────────────────────
export type LiteracyStatus = 'not_started' | 'in_progress' | 'completed';

export interface LiteracyProgress {
  id: string;
  child_id: string;
  area: 'financial' | 'digital';
  module_id: string;
  status: LiteracyStatus;
  updated_at: string;
}
