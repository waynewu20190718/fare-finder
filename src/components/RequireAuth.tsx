import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import type { User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

type AuthState = { status: "loading" } | { status: "authed"; user: User } | { status: "anon" };

// Client-side equivalent of the old `beforeLoad` route guard: checks the
// Supabase session before rendering any nested (protected) route.
export function RequireAuth() {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data, error }) => {
      if (!active) return;
      if (error || !data.user) {
        setState({ status: "anon" });
      } else {
        setState({ status: "authed", user: data.user });
      }
    });
    return () => {
      active = false;
    };
  }, []);

  if (state.status === "loading") {
    // Blank frame while the session check resolves — mirrors the old
    // server-side beforeLoad, which never let an unauthenticated flash render.
    return <div className="min-h-screen bg-background" />;
  }

  if (state.status === "anon") {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet context={{ user: state.user }} />;
}
