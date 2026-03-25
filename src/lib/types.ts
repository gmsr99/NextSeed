export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      families: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          email: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["families"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["families"]["Insert"]>;
      };
      children: {
        Row: {
          id: string;
          family_id: string;
          name: string;
          birth_date: string;
          school_year: string;
          school: string | null;
          curriculum: string | null;
          manuals: string | null;
          interests: string[];
          learning_preferences: string | null;
          learning_pace: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["children"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["children"]["Insert"]>;
      };
      weekly_plans: {
        Row: {
          id: string;
          family_id: string;
          week_start: string;
          child_interests: Json;
          friday_activity: string | null;
          notes: string | null;
          status: "draft" | "generated" | "sent";
          generated_at: string | null;
          sent_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["weekly_plans"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["weekly_plans"]["Insert"]>;
      };
      weekly_plan_items: {
        Row: {
          id: string;
          plan_id: string;
          child_id: string;
          day_of_week: number;
          time_slot: string;
          discipline: string;
          title: string;
          description: string | null;
          materials: string[];
          is_friday_world: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["weekly_plan_items"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["weekly_plan_items"]["Insert"]>;
      };
      activities: {
        Row: {
          id: string;
          family_id: string;
          child_id: string | null;
          plan_item_id: string | null;
          title: string;
          description: string | null;
          discipline: string | null;
          activity_date: string;
          photos: string[];
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["activities"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["activities"]["Insert"]>;
      };
      projects: {
        Row: {
          id: string;
          family_id: string;
          child_id: string | null;
          title: string;
          description: string | null;
          status: "active" | "completed" | "paused";
          start_date: string | null;
          end_date: string | null;
          phases: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["projects"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["projects"]["Insert"]>;
      };
      world_missions: {
        Row: {
          id: string;
          family_id: string;
          title: string;
          description: string | null;
          category: string | null;
          points: number;
          is_template: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["world_missions"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["world_missions"]["Insert"]>;
      };
      mission_completions: {
        Row: {
          id: string;
          mission_id: string;
          child_id: string;
          completed_at: string;
          reflection: string | null;
          learned: string | null;
          photo_url: string | null;
          points_earned: number;
        };
        Insert: Omit<Database["public"]["Tables"]["mission_completions"]["Row"], "id" | "completed_at">;
        Update: Partial<Database["public"]["Tables"]["mission_completions"]["Insert"]>;
      };
    };
  };
}

// Tipos convenientes
export type Family = Database["public"]["Tables"]["families"]["Row"];
export type Child = Database["public"]["Tables"]["children"]["Row"];
export type WeeklyPlan = Database["public"]["Tables"]["weekly_plans"]["Row"];
export type WeeklyPlanItem = Database["public"]["Tables"]["weekly_plan_items"]["Row"];
export type Activity = Database["public"]["Tables"]["activities"]["Row"];
export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type WorldMission = Database["public"]["Tables"]["world_missions"]["Row"];
export type MissionCompletion = Database["public"]["Tables"]["mission_completions"]["Row"];
