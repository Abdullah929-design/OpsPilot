import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/apiClient";

export interface PlatformSettings {
    app_name: string;
    logo: string;
    smtp_host: string;
    smtp_port: string;
    smtp_username: string;
    smtp_password?: string;
    default_timezone: string;
    default_language: string;
    password_policy: string; // JSON string
    maintenance_mode: string; // "0" or "1"
}

export function usePlatformSettings() {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery<Record<keyof PlatformSettings, string>>({
        queryKey: ["platform_settings"],
        queryFn: () => apiClient.get("/platform/settings").then((r) => r.data.data),
    });

    const updateSettings = useMutation({
        mutationFn: (settings: Partial<PlatformSettings>) =>
            apiClient.post("/platform/settings", { settings }),
        onSuccess: (data) => {
            queryClient.setQueryData(["platform_settings"], data.data.data);
        },
    });

    return {
        settings: data,
        isLoading,
        updateSettings,
    };
}
