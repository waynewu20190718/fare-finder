import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { supabase } from "@/integrations/supabase/client";

// Supabase recovery links land on the site root with the tokens (or an error)
// in the URL hash. This watcher redirects those arrivals to /reset-password
// without ever rendering the tokens.
function hashParams() {
  const raw = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : "";
  return new URLSearchParams(raw);
}

export function PasswordRecoveryWatcher() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/reset-password") return;

    const params = hashParams();
    const isRecovery = params.get("type") === "recovery";
    const errorCode = params.get("error_code") ?? params.get("error");

    if (isRecovery || (errorCode && params.get("error_description"))) {
      const hash = window.location.hash;
      // Keep the hash so the Supabase client can still establish the session,
      // but move the user to the dedicated screen.
      navigate({ pathname: "/reset-password", hash }, { replace: true });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        navigate("/reset-password", { replace: true });
      }
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  return null;
}
