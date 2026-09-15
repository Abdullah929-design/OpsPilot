import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/apiClient";
import { PlatformUser } from "./usePlatformAuth";

export function usePlatformUsers() {
    const queryClient = useQueryClient();

    const { data: users = [], isLoading } = useQuery<PlatformUser[]>({
        queryKey: ["platform_users"],
        queryFn: () => apiClient.get("/platform/users").then((r) => r.data.data),
    });

    const createUser = useMutation({
        mutationFn: (userData: any) => apiClient.post("/platform/users", userData),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["platform_users"] }),
    });

    const updateUser = useMutation({
        mutationFn: ({ userId, userData }: { userId: number; userData: any }) =>
            apiClient.put(`/platform/users/${userId}`, userData),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["platform_users"] }),
    });

    const deleteUser = useMutation({
        mutationFn: (userId: number) => apiClient.delete(`/platform/users/${userId}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["platform_users"] }),
    });

    return {
        users,
        isLoading,
        createUser,
        updateUser,
        deleteUser,
    };
}
