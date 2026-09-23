import { useNavigate, useOutletContext } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useDocumentTitle } from "@/hooks/use-document-title";

export default function Dashboard() {
  useDocumentTitle("Dashboard · Flight Price Notifier");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useOutletContext<{ user: User }>();

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate("/sign-in", { replace: true });
  }

  return (
    <div className="glow-hero min-h-screen bg-background">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
        <span className="text-sm font-semibold text-foreground">Flight Price Notifier</span>
        <button
          onClick={handleSignOut}
          className="rounded-full border border-border px-4 py-2 text-sm text-foreground transition-colors hover:bg-secondary"
        >
          Sign out / 登出
        </button>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-16">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Signed in as {user?.email ?? "your account"}．登入成功
        </p>

        <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/60 p-10 text-center">
          <div className="text-3xl">🛫</div>
          <h2 className="mt-4 text-lg font-semibold text-foreground">尚未有航線提醒</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Route subscriptions and target-price alerts are coming in the next milestone.
          </p>
        </div>
      </main>
    </div>
  );
}
