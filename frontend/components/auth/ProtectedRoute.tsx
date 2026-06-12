"use client";

import { useRequireAuth } from "@/hooks/useRequireAuth";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useRequireAuth();
  if (!isAuthenticated) return null;
  return <>{children}</>;
}
