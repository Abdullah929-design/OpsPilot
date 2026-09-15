"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import apiClient from "@/services/apiClient";
import { useRouter } from "next/navigation";

// Dedicated Axios instance for fetching the CSRF cookie.
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


export interface PlatformUser {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
    roles?: { id: number; name: string }[];
    permissions?: { id: number; name: string }[];
}

export interface PlatformLoginPayload {
    email: string;
    password: string;
    remember?: boolean;
}

export function usePlatformAuth() {
    const queryClient = useQueryClient();
    const router = useRouter();

    const { data: user, isLoading, error } = useQuery<PlatformUser | null>({
        queryKey: ["platform_auth", "me"],
        queryFn: () => apiClient.get("/platform/me").then((r) => r.data.data),
        retry: false,
        staleTime: 1000 * 60 * 5,
    });

    const login = useMutation({
        mutationFn: async (payload: PlatformLoginPayload) => {
            // Step 1: Fetch CSRF cookie
            await csrfClient.get("/sanctum/csrf-cookie");
            // Step 2: Submit platform login
            return apiClient.post("/platform/login", payload);
        },
        onSuccess: (res) => {
            // Invalidate and seed platform cache
            queryClient.setQueryData(["platform_auth", "me"], res.data.data);
            queryClient.invalidateQueries({ queryKey: ["platform_auth", "me"] });

            router.push("/dashboard");
        },
    });

    const logout = useMutation({
        mutationFn: () => apiClient.post("/platform/logout"),
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
