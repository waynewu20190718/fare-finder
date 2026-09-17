import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { supabase } from "@/integrations/supabase/client";
import { useDocumentTitle } from "@/hooks/use-document-title";

type Status = "checking" | "ready" | "invalid" | "done";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/40";

function readHash() {
  const raw = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : "";
  return new URLSearchParams(raw);
}

export default function ResetPasswordPage() {
  useDocumentTitle("Set a new password · Flight Price Notifier");
  const navigate = useNavigate();

  const [status, setStatus] = useState<Status>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Re-request flow when the link has expired.
  const [resendEmail, setResendEmail] = useState("");
  const [resendState, setResendState] = useState<string | null>(null);

  useEffect(() => {
    const params = readHash();
    const linkError = params.get("error_description") ?? params.get("error");
    if (linkError) {
      // Never keep tokens/errors in the visible URL.
      window.history.replaceState(null, "", window.location.pathname);
      setStatus("invalid");
      return;
    }

    let active = true;
    const finish = (ok: boolean) => {
      if (!active) return;
      window.history.replaceState(null, "", window.location.pathname);
      setStatus(ok ? "ready" : "invalid");
    };

    // Give the Supabase client a moment to parse the hash into a session.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) return finish(true);
      const timer = setTimeout(() => {
        supabase.auth.getSession().then(({ data: retry }) => finish(Boolean(retry.session)));
      }, 800);
      return () => clearTimeout(timer);
    });

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters．密碼至少需 6 個字元。");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match．兩次輸入的密碼不一致。");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setStatus("done");
    setMessage("Password updated successfully．密碼已更新成功。");
    setPassword("");
    setConfirm("");
    await supabase.auth.signOut();
    setTimeout(() => navigate("/auth", { replace: true }), 1800);
  }

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    setResendState(null);
    const { error: resendError } = await supabase.auth.resetPasswordForEmail(resendEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setResendState(
      resendError ? resendError.message : "Reset email sent．已寄出新的密碼重設信，請查看信箱。",
    );
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
          {status === "checking" && (
            <p className="text-sm text-muted-foreground">Checking your reset link…</p>
          )}

          {status === "invalid" && (
            <>
              <h1 className="text-2xl font-bold text-foreground">Link expired．連結已失效</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                This password reset link is invalid or has expired．密碼重設連結已失效，請重新申請。
              </p>

              <form onSubmit={handleResend} className="mt-6 space-y-3">
                <label htmlFor="resend-email" className="text-sm font-medium text-foreground">
                  Email
                </label>
                <input
                  id="resend-email"
                  type="email"
                  required
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={inputClass}
                />
                {resendState && <p className="text-sm text-primary">{resendState}</p>}
                <button
                  type="submit"
                  className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Send new reset link / 重新申請
                </button>
              </form>

              <Link
                to="/auth"
                className="mt-5 block text-center text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
              >
                Back to sign in / 回到登入頁
              </Link>
            </>
          )}

          {(status === "ready" || status === "done") && (
            <>
              <h1 className="text-2xl font-bold text-foreground">Set a new password．設定新密碼</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Choose a new password for your account.
              </p>

              {status === "ready" ? (
                <form onSubmit={handleSubmit} className="mt-7 space-y-4">
                  <div>
                    <label htmlFor="new-password" className="text-sm font-medium text-foreground">
                      New password / 新密碼
                    </label>
                    <input
                      id="new-password"
                      type="password"
                      required
                      minLength={6}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="confirm-password"
                      className="text-sm font-medium text-foreground"
                    >
                      Confirm new password / 確認新密碼
                    </label>
                    <input
                      id="confirm-password"
                      type="password"
                      required
                      minLength={6}
                      autoComplete="new-password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="••••••••"
                      className={inputClass}
                    />
                  </div>

                  {error && <p className="text-sm text-destructive">{error}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
                  >
                    {loading ? "..." : "Update password / 設定新密碼"}
                  </button>
                </form>
              ) : (
                <div className="mt-7 space-y-4">
                  <p className="text-sm text-primary">{message}</p>
                  <Link
                    to="/auth"
                    className="block w-full rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    Go to sign in / 前往登入
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
