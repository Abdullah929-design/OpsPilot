"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { folderService, FolderFormData } from "@/services/folderService";

export function useFolders(params?: { parent_id?: number | null }) {
    return useQuery({
        queryKey: ["folders", params],
        queryFn: () => folderService.getFolders(params),
    });
}

export function useFolderTree() {
    return useQuery({
        queryKey: ["folderTree"],
        queryFn: () => folderService.getFolderTree(),
    });
}

export function useFolder(id: number) {
    return useQuery({
        queryKey: ["folder", id],
        queryFn: () => folderService.getFolder(id),
        enabled: !!id,
    });
}

export function useCreateFolder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: FolderFormData) => folderService.createFolder(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["folders"] });
            queryClient.invalidateQueries({ queryKey: ["folderTree"] });
        },
    });
}

export function useUpdateFolder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<FolderFormData> }) =>
            folderService.updateFolder(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ["folders"] });
            queryClient.invalidateQueries({ queryKey: ["folderTree"] });
            queryClient.invalidateQueries({ queryKey: ["folder", id] });
        },
    });
}

export function useDeleteFolder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, force }: { id: number; force?: boolean }) => folderService.deleteFolder(id, force),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["folders"] });
            queryClient.invalidateQueries({ queryKey: ["folderTree"] });
        },
    });
}
