import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDocumentTitle } from "@/hooks/use-document-title";

export type AuthMode = "signin" | "signup";

// Shared page for /sign-in and /sign-up. The URL decides the mode, so each
// form is deep-linkable and switching between them is a normal navigation.
export default function AuthPage({ mode }: { mode: AuthMode }) {
  useDocumentTitle(
    mode === "signin" ? "Sign in · Flight Price Notifier" : "Sign up · Flight Price Notifier",
  );
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/app", { replace: true });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else navigate("/app", { replace: true });
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/app` },
      });
      if (error) setError(error.message);
      else if (data.session) navigate("/app", { replace: true });
      else setMessage("Check your email to confirm your account．請至信箱確認註冊。");
    }
    setLoading(false);
  }

  return (
    <div className="glow-hero flex min-h-screen flex-col bg-background">
      <header className="mx-auto flex w-full max-w-6xl items-center px-5 py-5">
        <Link to="/" className="text-sm font-semibold text-foreground">
          Flight Price Notifier
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-10">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-2xl">
          <h1 className="text-2xl font-bold text-foreground">
            {mode === "signin" ? "Welcome back．登入" : "Create account．註冊"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Sign in to manage your fare alerts."
              : "Sign up to start tracking fares."}
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div>
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/40"
              />
            </div>
            <div>
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/40"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {message && <p className="text-sm text-primary">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "..." : mode === "signin" ? "Sign in / 登入" : "Create account / 註冊"}
            </button>
          </form>

          <Link
            to={mode === "signin" ? "/sign-up" : "/sign-in"}
            replace
            className="mt-5 block w-full text-center text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            {mode === "signin" ? "No account yet? Create one" : "Already have an account? Sign in"}
          </Link>
        </div>
      </main>
    </div>
  );
}
