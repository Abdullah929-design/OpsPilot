"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import apiClient from "@/services/apiClient";
import { useRouter } from "next/navigation";

// Dedicated Axios instance for fetching the CSRF cookie dynamically.
const getCsrfBaseUrl = () => {
  if (typeof window === "undefined") {
    return "http://opspilot.test";
  }
  return `${window.location.protocol}//${window.location.hostname}`;
};

const csrfClient = axios.create({
  baseURL: getCsrfBaseUrl(),
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});


export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  is_active: boolean;
  preferences?: {
    theme?: string;
    email_notifications?: boolean;
    browser_notifications?: boolean;
  };
  roles?: { id: number; name: string }[];
  permissions?: { id: number; name: string }[];
  companies?: { id: number; name: string; subdomain: string }[];
}

export interface LoginPayload {
  email: string;
  password: string;
  remember?: boolean;
}

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["auth", "me"],
    queryFn: () => apiClient.get("/v1/me").then((r) => r.data.data),
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const login = useMutation({
    mutationFn: async (payload: LoginPayload) => {
      // Step 1: Fetch CSRF cookie — sets XSRF-TOKEN cookie on localhost:8000
      await csrfClient.get("/sanctum/csrf-cookie");
      // Step 2: Axios reads XSRF-TOKEN cookie and sends it as X-XSRF-TOKEN header
      return apiClient.post("/v1/login", payload);
    },
    onSuccess: (res) => {
      // 1. Seed the cache so the RouteGuard is immediately satisfied
      queryClient.setQueryData(["auth", "me"], res.data.data);
      // 2. Invalidate the query to fetch a fresh copy in the background
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });

      router.push("/dashboard");
    },

  });

  const logout = useMutation({
    mutationFn: () => apiClient.post("/v1/logout"),
    onSuccess: () => {
      // Clear all query cache to prevent stale data leaks
      queryClient.clear();
      router.push("/login");
    },
  });


  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    error,
  };
}
