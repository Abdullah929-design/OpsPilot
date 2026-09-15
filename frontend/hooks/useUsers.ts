"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService, UserFilterParams, UserFormData } from "@/services/userService";

export function useUsers(params?: UserFilterParams) {
    return useQuery({
        queryKey: ["users", params],
        queryFn: () => userService.getUsers(params),
    });
}

export function useUser(id: number) {
    return useQuery({
        queryKey: ["user", id],
        queryFn: () => userService.getUser(id),
        enabled: !!id,
    });
}

export function useCreateUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: UserFormData) => userService.createUser(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
    });
}

export function useUpdateUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UserFormData }) =>
            userService.updateUser(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            queryClient.invalidateQueries({ queryKey: ["user", id] });
            queryClient.invalidateQueries({ queryKey: ["user-permissions", id] });
        },
    });
}

export function useDeleteUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => userService.deleteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
    });
}

export function useToggleUserStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, activate }: { id: number; activate: boolean }) =>
            activate ? userService.activateUser(id) : userService.deactivateUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
    });
}

export function useUserPermissions(userId: number) {
    return useQuery({
        queryKey: ["user-permissions", userId],
        queryFn: () => userService.getUserPermissionsBreakdown(userId),
        enabled: !!userId,
    });
}

export function useSyncUserCustomPermissions() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, permissions }: { id: number; permissions: string[] }) =>
            userService.syncCustomPermissions(id, permissions),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ["user-permissions", id] });
            queryClient.invalidateQueries({ queryKey: ["user", id] });
        },
    });
}

export function useSyncUserPermissionDenials() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, permissions }: { id: number; permissions: string[] }) =>
            userService.syncPermissionDenials(id, permissions),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ["user-permissions", id] });
            queryClient.invalidateQueries({ queryKey: ["user", id] });
        },
    });
}

