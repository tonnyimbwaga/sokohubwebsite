import { type CookieOptions, createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { Database } from "@/types/supabase";

export async function createClient() {
  // The `cookies()` helper type definition can vary between runtimes (Edge vs Node).
  // In Next.js 15, cookies() returns a promise and needs to be awaited
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            /* Ignore — called from a Server Component without MutableCookies */
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            /* Ignore — called from a Server Component without MutableCookies */
          }
        },
      },
    },
  );
}
