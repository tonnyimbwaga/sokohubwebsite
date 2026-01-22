import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function useAdminSessionTimeout() {
  const router = useRouter();
  const supabase = createClient();
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sessionCheckRef = useRef<NodeJS.Timeout | null>(null);

  // Handle automatic signout
  const handleAutoSignout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      sessionStorage.clear();
      router.push("/login?message=signed_out_due_to_inactivity");
    } catch (error) {
      console.error("Error during auto signout:", error);
      router.push("/login?error=session_error");
    }
  }, [supabase, router]);

  // Helper to clear & start the inactivity timer
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
    // 1 hour = 60 * 60 * 1000 ms
    inactivityTimeoutRef.current = setTimeout(
      handleAutoSignout,
      60 * 60 * 1000,
    );
  }, [handleAutoSignout]);

  // Check if session is still valid
  const checkSession = useCallback(async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session) {
        router.push("/login?error=session_error");
        return false;
      }

      // Check if user is admin (only check once every 30 minutes to reduce DB calls)
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (!profile || profile.role !== "admin") {
        router.push("/login?error=not_admin");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Session check error:", error);
      router.push("/login?error=session_error");
      return false;
    }
  }, [supabase, router]);

  // Initialize the timeout system
  useEffect(() => {
    // Initial session check
    checkSession().then((isValid) => {
      if (!isValid) return;

      // Start the inactivity timer immediately
      resetInactivityTimer();

      // Check session validity every 30 minutes (reduce API calls)
      sessionCheckRef.current = setInterval(checkSession, 30 * 60 * 1000);

      // Events that indicate user activity
      const events = ["mousemove", "keydown", "scroll", "click", "touchstart"];
      events.forEach((event) =>
        window.addEventListener(event, resetInactivityTimer),
      );

      // Cleanup event listeners when component unmounts
      return () => {
        events.forEach((event) =>
          window.removeEventListener(event, resetInactivityTimer),
        );
      };
    });

    // Cleanup function
    return () => {
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
      if (sessionCheckRef.current) {
        clearInterval(sessionCheckRef.current);
      }
    };
  }, [checkSession, resetInactivityTimer]);

  // Return minimal interface
  return {
    // Just return if we're authenticated (for simple status display)
    isAuthenticated: true,
  };
}
