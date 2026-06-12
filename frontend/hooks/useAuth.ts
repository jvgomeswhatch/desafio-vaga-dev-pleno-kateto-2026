"use client";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { loginUser, type LoginPayload } from "@/services/auth";

export function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: LoginPayload) => loginUser(payload),
    onSuccess: (result) => {
      if (result.ok && result.token) {
        localStorage.setItem("auth_token", result.token);
        router.replace("/dashboard");
      }
    },
  });
}

export function useLogout() {
  const router = useRouter();

  return () => {
    localStorage.removeItem("auth_token");
    router.replace("/");
  };
}
