import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

/**
 * Admin Supabase Client
 * 
 * Bypasses Row Level Security (RLS). 
 * Use ONLY on the server for build-time operations or administrative tasks.
 */
export const getAdminClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        // During local development or if key is missing, return null or handle appropriately
        // For build time, it SHOULD be there.
        return null;
    }

    return createClient<Database>(supabaseUrl, serviceRoleKey, {
        auth: {
            persistSession: false,
        },
    });
};
