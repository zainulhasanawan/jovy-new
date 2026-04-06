import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { useSignup } from "../hooks/useSignup";
import { useUser } from "../hooks/useUser";
import { signInWithFacebook, signInWithGoogle } from "../services/apiAuth";

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  const { signup, isLoading } = useSignup();
  const { isAuthenticated } = useUser();
  const navigate = useNavigate();
  const isSubmitting = isLoading || oauthLoading;

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      const { needsEmailConfirmation } = await signup({
        fullName,
        email,
        password,
      });

      if (needsEmailConfirmation) {
        setShowConfirmation(true);
        return;
      }

      navigate("/dashboard", { replace: true });
    } catch (caughtError) {
      const message = getErrorMessage(caughtError, "Signup failed");
      if (message.includes("User already registered")) {
        setError(
          "An account with this email already exists. Please sign in instead.",
        );
        return;
      }
      setError(message);
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

  if (showConfirmation) {
    return (
      <section className="auth-screen auth-theme">
        <div className="auth-card auth-layout-card auth-centered-card">
          <div className="auth-confirm-icon" aria-hidden="true">
            ✉
          </div>

          <h1 className="auth-title">Check Your Email</h1>
          <p className="auth-subtitle">
            We&apos;ve sent a confirmation link to <strong>{email}</strong>.
            Click the link in the email to activate your account.
          </p>
          <p className="auth-confirm-note">
            Didn&apos;t receive the email? Check your spam folder or try again.
          </p>

          <Link
            to="/login"
            className="button-link auth-submit auth-primary-button"
          >
            Go to Sign In
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="auth-screen auth-theme">
      <div className="auth-card auth-layout-card">
        <div className="auth-logo-wrap">
          <img src="/Jovy-logo.png" alt="Jovy" className="auth-logo" />
        </div>

        <h1 className="auth-title">Start Planning Your Wedding</h1>
        <p className="auth-subtitle">Create your free account to get started</p>

        <form onSubmit={handleSubmit} className="auth-form auth-spaced-form">
          {error && (
            <div className="auth-error" data-testid="signup-error">
              {error}
            </div>
          )}

          <label className="auth-field" htmlFor="full-name">
            <span>Full name</span>
            <input
              id="full-name"
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Your name"
              required
              data-testid="input-name"
            />
          </label>

          <label className="auth-field" htmlFor="signup-email">
            <span>Email</span>
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              data-testid="input-email"
            />
          </label>

          <label className="auth-field" htmlFor="signup-password">
            <span>Password</span>
            <input
              id="signup-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 6 characters"
              minLength={6}
              required
              data-testid="input-password"
            />
          </label>

          <button
            type="submit"
            className="button-link auth-submit auth-primary-button"
            disabled={isSubmitting}
            data-testid="btn-signup"
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div
          className="auth-divider"
          role="separator"
          aria-label="social sign up options"
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
          Already have an account?{" "}
          <Link to="/login" className="auth-inline-link">
            Sign in
          </Link>
        </p>

        <p className="auth-terms-note">
          By creating an account, you agree to our Terms of Service and Privacy
          Policy.
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
