"use client";

import { useState } from "react";
import { useLogin } from "@/hooks/useAuth";

export function LoginForm() {
  const { mutate: login, isPending, data: result } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const error =
    result && !result.ok ? result.error : undefined;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    login({ email: email.trim(), password });
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}
    >
      {error && (
        <div
          role="alert"
          style={{
            background: "rgba(235,75,75,0.08)",
            border: "1px solid rgba(235,75,75,0.3)",
            borderLeft: "3px solid var(--color-danger)",
            borderRadius: "var(--radius-sm)",
            padding: "var(--space-3) var(--space-4)",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-xs)",
            color: "var(--color-danger)",
            letterSpacing: "var(--tracking-wide)",
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        <label
          htmlFor="email"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-xs)",
            color: "var(--color-text-secondary)",
            letterSpacing: "var(--tracking-wider)",
            textTransform: "uppercase",
          }}
        >
          E-mail
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@cratebr.com"
          autoComplete="email"
          required
          style={{
            width: "100%",
            padding: "var(--space-3) var(--space-4)",
            background: "var(--color-bg-elevated)",
            border: "1px solid var(--color-border-default)",
            borderRadius: "var(--radius-sm)",
            color: "var(--color-text-primary)",
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-base)",
            outline: "none",
          }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        <label
          htmlFor="password"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-xs)",
            color: "var(--color-text-secondary)",
            letterSpacing: "var(--tracking-wider)",
            textTransform: "uppercase",
          }}
        >
          Senha
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
          required
          style={{
            width: "100%",
            padding: "var(--space-3) var(--space-4)",
            background: "var(--color-bg-elevated)",
            border: "1px solid var(--color-border-default)",
            borderRadius: "var(--radius-sm)",
            color: "var(--color-text-primary)",
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-base)",
            outline: "none",
          }}
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "var(--space-2)",
          width: "100%",
          padding: "var(--space-4) var(--space-6)",
          background: isPending ? "var(--color-brand-dim)" : "var(--color-brand)",
          color: "var(--color-text-inverse)",
          border: "1px solid transparent",
          borderRadius: "var(--radius-sm)",
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-base)",
          fontWeight: "var(--weight-semibold)",
          letterSpacing: "var(--tracking-wider)",
          textTransform: "uppercase",
          cursor: isPending ? "not-allowed" : "pointer",
          transition: "all var(--duration-base) var(--ease-out)",
        }}
      >
        {isPending ? (
          <>
            <span
              style={{
                display: "inline-block",
                width: 16,
                height: 16,
                border: "2px solid rgba(10,14,19,0.3)",
                borderTopColor: "var(--color-text-inverse)",
                borderRadius: "50%",
                animation: "spin 0.7s linear infinite",
              }}
            />
            Entrando...
          </>
        ) : (
          "Entrar"
        )}
      </button>
    </form>
  );
}
