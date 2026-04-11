import React, { useState } from "react";
import { api, setTokens, formatApiError } from "../api/client";
import "./AuthScreen.css";

export default function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (mode === "signup" && password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "login") {
        const { data } = await api.post("/auth/login", { email, password });
        setTokens(data);
        onAuthenticated();
      } else {
        await api.post("/auth/signup", { email, password });
        const { data } = await api.post("/auth/login", { email, password });
        setTokens(data);
        onAuthenticated();
      }
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-root">
      <div className="auth-ambient" aria-hidden />
      <div className="auth-panel">
        <div className="auth-brand">
          <span className="auth-logo" aria-hidden>◆</span>
          <div>
            <h1 className="auth-title">Telusko Trac</h1>
            <p className="auth-sub">Inventory that moves as fast as you do.</p>
          </div>
        </div>

        <div className="auth-toggle" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "login"}
            className={mode === "login" ? "active" : ""}
            onClick={() => { setMode("login"); setError(""); }}
          >
            Sign in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "signup"}
            className={mode === "signup" ? "active" : ""}
            onClick={() => { setMode("signup"); setError(""); }}
          >
            Create account
          </button>
        </div>

        <form className="auth-form" onSubmit={submit}>
          <label className="auth-field">
            <span>Email</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@company.com"
            />
          </label>
          <label className="auth-field">
            <span>Password</span>
            <input
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="••••••••"
            />
          </label>
          {mode === "signup" && (
            <label className="auth-field">
              <span>Confirm password</span>
              <input
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={6}
                placeholder="Repeat password"
              />
            </label>
          )}

          {error ? <div className="auth-error" role="alert">{error}</div> : null}

          <button type="submit" className="auth-submit" disabled={busy}>
            {busy ? "Please wait…" : mode === "login" ? "Continue" : "Sign up & enter"}
          </button>
        </form>

        <p className="auth-hint">
          {mode === "login"
            ? "New here? Switch to Create account — your session stays on this device."
            : "Already have an account? Use Sign in."}
        </p>
      </div>

      <aside className="auth-showcase">
        <div className="showcase-inner">
          <h2>Everything in one flow</h2>
          <ul>
            <li>Secure JWT access with automatic refresh on product APIs</li>
            <li>Live product catalog with sort, search, and CRUD</li>
            <li>Built for FastAPI + React, ready to extend</li>
          </ul>
          <div className="showcase-stat">
            <span className="stat-num">99.9%</span>
            <span className="stat-label">peace of mind for your stock</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
