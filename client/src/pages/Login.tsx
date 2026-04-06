import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { useLogin } from "../hooks/useLogin";
import { useUser } from "../hooks/useUser";
import { signInWithFacebook, signInWithGoogle } from "../services/apiAuth";

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [oauthLoading, setOauthLoading] = useState(false);

  const { login, isLoading } = useLogin();
  const { isAuthenticated } = useUser();
  const navigate = useNavigate();
  const isSubmitting = isLoading || oauthLoading;

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setError("");

    try {
      await login({ email, password });
      navigate("/dashboard", { replace: true });
    } catch (caughtError) {
      setError(
        getErrorMessage(
          caughtError,
          "Provided email or password are incorrect",
        ),
      );
    }
  }

  async function handleGoogleLogin(): Promise<void> {
    setError("");
    setOauthLoading(true);

    try {
      await signInWithGoogle();
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, "Google sign in failed"));
    } finally {
      setOauthLoading(false);
    }
  }

  async function handleFacebookLogin(): Promise<void> {
    setError("");
    setOauthLoading(true);

    try {
      await signInWithFacebook();
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, "Facebook sign in failed"));
    } finally {
      setOauthLoading(false);
    }
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <section className="auth-screen auth-theme">
      <div className="auth-card auth-layout-card">
        <div className="auth-logo-wrap">
          <img src="/Jovy-logo.png" alt="Jovy" className="auth-logo" />
        </div>

        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">
          Sign in to continue planning your wedding
        </p>

        <form onSubmit={handleSubmit} className="auth-form auth-spaced-form">
          {error && (
            <div className="auth-error" data-testid="login-error">
              {error}
            </div>
          )}

          <label className="auth-field" htmlFor="email">
            <span>Email</span>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              data-testid="input-email"
            />
          </label>

          <label className="auth-field" htmlFor="password">
            <span>Password</span>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              required
              data-testid="input-password"
            />
          </label>

          <button
            type="submit"
            className="button-link auth-submit auth-primary-button"
            disabled={isSubmitting}
            data-testid="btn-login"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div
          className="auth-divider"
          role="separator"
          aria-label="social sign in options"
        >
          <span>Or continue with</span>
        </div>

        <div className="auth-social-grid">
          <button
            type="button"
            className="auth-social-button"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
          >
            Google
          </button>
          <button
            type="button"
            className="auth-social-button"
            onClick={handleFacebookLogin}
            disabled={isSubmitting}
          >
            Facebook
          </button>
        </div>

        <p className="auth-note">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="auth-inline-link">
            Create one
          </Link>
        </p>

        <p className="auth-back-link-wrap">
          <Link to="/" className="auth-back-link">
            ← Back to home
          </Link>
        </p>
      </div>
    </section>
  );
}
