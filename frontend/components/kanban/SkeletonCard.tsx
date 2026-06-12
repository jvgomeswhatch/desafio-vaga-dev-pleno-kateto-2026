export function SkeletonCard() {
  const bar = (width: string, height = 12) => (
    <div
      style={{
        height,
        width,
        background: "var(--color-bg-raised)",
        borderRadius: "var(--radius-sm)",
        animation: "pulse 1.5s ease-in-out infinite",
      }}
    />
  );

  return (
    <div
      style={{
        background: "var(--color-bg-elevated)",
        border: "1px solid var(--color-border-subtle)",
        borderTop: "3px solid var(--color-border-subtle)",
        borderRadius: "var(--radius-md)",
        padding: "var(--space-5)",
        minHeight: 180,
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
      }}
    >
      {bar("60%")}
      {bar("40%")}
      {bar("50%", 28)}
      {bar("30%")}
    </div>
  );
}
