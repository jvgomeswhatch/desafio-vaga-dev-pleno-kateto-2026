"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useQueryClient } from "@tanstack/react-query";
import { submitLead } from "@/app/actions";
import type { LeadFormState } from "@/types";

const initialState: LeadFormState = { success: false, errors: {} };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="submit-cta"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-2)",
        width: "100%",
        padding: "var(--space-4) var(--space-6)",
        background: pending ? "var(--color-brand-dim)" : "var(--color-brand)",
        color: "var(--color-text-inverse)",
        border: "1px solid transparent",
        borderRadius: "var(--radius-sm)",
        fontFamily: "var(--font-display)",
        fontSize: "var(--text-base)",
        fontWeight: "var(--weight-semibold)",
        letterSpacing: "var(--tracking-wider)",
        textTransform: "uppercase",
        cursor: pending ? "not-allowed" : "pointer",
        transition: "all var(--duration-base) var(--ease-out)",
        boxShadow: pending ? "none" : "var(--shadow-sm)",
      }}
    >
      {pending ? (
        <>
          <span style={{ display: "inline-block", width: 16, height: 16, border: "2px solid rgba(10,14,19,0.3)", borderTopColor: "var(--color-text-inverse)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
          Enviando...
        </>
      ) : (
        "Quero minha skin"
      )}
    </button>
  );
}

export function LeadForm() {
  const [state, formAction] = useActionState(submitLead, initialState);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (state.success) {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    }
  }, [state.success, queryClient]);

  if (state.success) {
    return (
      <div
        role="status"
        aria-live="polite"
        style={{
          background: "rgba(91,162,74,0.08)",
          border: "1px solid rgba(91,162,74,0.3)",
          borderLeft: "3px solid var(--color-success)",
          borderRadius: "var(--radius-md)",
          padding: "var(--space-6)",
          textAlign: "center",
        }}
      >
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--color-success)", letterSpacing: "var(--tracking-widest)", textTransform: "uppercase", marginBottom: "var(--space-3)" }}>
          ✓ PEDIDO RECEBIDO
        </div>
        <p style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)", color: "var(--color-text-primary)", marginBottom: "var(--space-2)" }}>
          Entraremos em contato em breve!
        </p>
        <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-snug)" }}>
          Um de nossos vendedores vai falar com você pelo WhatsApp para fechar o negócio.
        </p>
      </div>
    );
  }

  return (
    <>
      <form action={formAction} noValidate style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>

        {state.errors.general && (
          <div style={{ background: "rgba(235,75,75,0.08)", border: "1px solid rgba(235,75,75,0.3)", borderLeft: "3px solid var(--color-danger)", borderRadius: "var(--radius-sm)", padding: "var(--space-3) var(--space-4)", fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--color-danger)", letterSpacing: "var(--tracking-wide)" }}>
            {state.errors.general}
          </div>
        )}

        <Field
          id="name"
          label="Nome"
          name="name"
          type="text"
          placeholder="Seu nome completo"
          autoComplete="name"
          error={state.errors.name}
        />

        <Field
          id="desired_skin"
          label="Skin desejada"
          name="desired_skin"
          type="text"
          placeholder="Ex: AK-47 Redline, Karambit Doppler..."
          error={state.errors.desired_skin}
        />

        <Field
          id="phone"
          label="WhatsApp"
          name="phone"
          type="tel"
          placeholder="11 99999-9999"
          autoComplete="tel"
          hint="Apenas números — DDD + número"
          error={state.errors.phone}
        />

        <SubmitButton />
      </form>
    </>
  );

}

function Field({
  id,
  label,
  name,
  type,
  placeholder,
  autoComplete,
  hint,
  error,
}: {
  id: string;
  label: string;
  name: string;
  type: string;
  placeholder: string;
  autoComplete?: string;
  hint?: string;
  error?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
      <label
        htmlFor={id}
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-xs)",
          color: error ? "var(--color-danger)" : "var(--color-text-secondary)",
          letterSpacing: "var(--tracking-wider)",
          textTransform: "uppercase",
        }}
      >
        {label} <span style={{ color: "var(--color-brand)" }}>*</span>
      </label>
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        aria-invalid={!!error}
        style={{
          width: "100%",
          padding: "var(--space-3) var(--space-4)",
          background: "var(--color-bg-elevated)",
          border: `1px solid ${error ? "var(--color-danger)" : "var(--color-border-default)"}`,
          borderRadius: "var(--radius-sm)",
          color: "var(--color-text-primary)",
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-base)",
          outline: "none",
          transition: "all var(--duration-fast) var(--ease-out)",
          boxShadow: error ? "0 0 0 3px rgba(235,75,75,0.12)" : "none",
        }}
      />
      {error && (
        <span
          id={`${id}-error`}
          role="alert"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-2xs)",
            color: "var(--color-danger)",
            letterSpacing: "var(--tracking-wide)",
          }}
        >
          {error}
        </span>
      )}
      {!error && hint && (
        <span
          id={`${id}-hint`}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-2xs)",
            color: "var(--color-text-muted)",
            letterSpacing: "var(--tracking-wide)",
          }}
        >
          {hint}
        </span>
      )}
    </div>
  );
}
