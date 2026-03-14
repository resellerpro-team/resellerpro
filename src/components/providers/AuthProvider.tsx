"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    
    // Create browser client
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[AUTH] Event: ${event}, Session: ${session ? 'Active' : 'None'}`);
      }

      // If a token is naturally refreshed while the user is active,
      // or if they just signed in, we must sync the new session hash
      // to the DB immediately to prevent the middleware from kicking them out.
      if (session && (event === "TOKEN_REFRESHED" || event === "SIGNED_IN")) {
        try {
          // Fire-and-forget background sync
          fetch("/api/security/track-session", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sessionToken: session.access_token,
              userId: session.user.id,
              isCurrent: true,
            }),
          }).catch(err => console.warn("Failed to sync auth token:", err));
        } catch (error) {
          console.warn("Global auth listener sync error:", error);
        }
      }

      // If they sign out completely, flush the router cache
      // 🛡️ SECURITY: Guard refresh to prevent infinite loops on 404/Error pages
      if (event === "SIGNED_OUT") {
        const isErrorPage = window.location.pathname.includes('/404') || 
                           document.title.toLowerCase().includes('not found') ||
                           document.title.toLowerCase().includes('error');
        
        if (!isErrorPage) {
          router.refresh();
        } else {
          console.warn("[AUTH] Suppressed refresh loop on error page");
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // Avoid hydration mismatch while maintaining standard render
  if (!mounted) return <>{children}</>;

  return <>{children}</>;
}
