// Type definitions for @/lib/supabase/server
declare module "@/lib/supabase/server" {
  import { SupabaseClient } from "@supabase/supabase-js";
  import { Database } from "@/types/supabase";

  export function createServerSupabaseClient(): Promise<
    SupabaseClient<Database>
  >;
}

// Environment variable types
declare namespace NodeJS {
  export interface ProcessEnv {
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
  }
}
