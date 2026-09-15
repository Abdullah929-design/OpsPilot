import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/apiClient";

export interface PlatformPermission {
    id: number;
    name: string;
    guard_name: string;
}

export interface PlatformRole {
    id: number;
    name: string;
    guard_name: string;
    permissions: PlatformPermission[];
}

export interface PlatformRolesData {
    roles: PlatformRole[];
    permissions: string[];
}

export function usePlatformRoles() {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery<PlatformRolesData>({
        queryKey: ["platform_roles"],
        queryFn: () => apiClient.get("/platform/roles").then((r) => r.data.data),
    });

    const syncPermissions = useMutation({
        mutationFn: ({ roleId, permissions }: { roleId: number; permissions: string[] }) =>
            apiClient.post(`/platform/roles/${roleId}/permissions`, { permissions }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["platform_roles"] });
        },
    });

    return {
        roles: data?.roles || [],
        permissions: data?.permissions || [],
        isLoading,
        syncPermissions,
    };
}
