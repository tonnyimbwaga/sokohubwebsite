import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Session } from "@supabase/supabase-js";

export type AuthRole = "admin" | "customer" | null;

export interface AuthState {
  session: Session | null;
  profile: { role: AuthRole } | null;
  loading: boolean;
  error: string | null;
  urlMessage: string | null;
  urlError: string | null;
}

const errorMap: { [key: string]: string } = {
  session_error:
    "There was an issue with your session. Please try logging in again.",
  profile_fetch_error: "Could not retrieve your profile. Please try again.",
  profile_not_found: "Your profile was not found. Please contact support.",
  not_admin: "You do not have permission to access this page.",
  session_or_access_denied_fallback: "Access denied. Please login.",
};

export function useAuth(): AuthState {
  const supabase = createClient();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<{ role: AuthRole } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [urlMessage, setUrlMessage] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    // This effect will run once on mount
    setLoading(true);
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (profileError || !profileData) {
          console.error(
            "Profile fetch error or no profile found:",
            profileError?.message,
          );
          // If profile doesn't exist or fails to load, assign a default
          // This allows login to proceed. A subsequent process could prompt for profile completion.
          setProfile({ role: "customer" });
          setError(
            profileError
              ? "Failed to fetch user profile."
              : "User profile not found.",
          );
        } else {
          setProfile(profileData as { role: AuthRole });
          setError(null);
        }
      } else {
        // User is logged out
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const errorQuery = searchParams?.get("error");
    const messageQuery = searchParams?.get("message");
    if (errorQuery) {
      setUrlError(errorMap[errorQuery] || errorQuery);
    }
    if (messageQuery) {
      if (messageQuery === "signed_out_due_to_inactivity") {
        setUrlMessage("You have been signed out due to inactivity.");
      } else if (messageQuery === "signed_out_successfully") {
        setUrlMessage("You have signed out successfully.");
      } else {
        setUrlMessage(messageQuery);
      }
    }
  }, [searchParams]);

  return { session, profile, loading, error, urlMessage, urlError };
}
