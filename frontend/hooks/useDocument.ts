"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { documentService, GetDocumentsParams, Document } from "@/services/documentService";

export function useDocuments(params?: GetDocumentsParams) {
    return useQuery({
        queryKey: ["documents", params],
        queryFn: () => documentService.getDocuments(params),
    });
}

export function useDocument(id: number) {
    return useQuery({
        queryKey: ["document", id],
        queryFn: () => documentService.getDocument(id),
        enabled: !!id,
    });
}

export function useUploadDocument() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (formData: FormData) => documentService.upload(formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["documents"] });
            queryClient.invalidateQueries({ queryKey: ["folders"] });
            queryClient.invalidateQueries({ queryKey: ["folderTree"] });
        },
    });
}

export function useUpdateDocument() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<Omit<Document, 'tags'>> & { tags?: string[] } }) =>
            documentService.update(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ["documents"] });
            queryClient.invalidateQueries({ queryKey: ["document", id] });
        },
    });
}

export function useDeleteDocument() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => documentService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["documents"] });
            queryClient.invalidateQueries({ queryKey: ["folders"] });
            queryClient.invalidateQueries({ queryKey: ["folderTree"] });
        },
    });
}

export function useRestoreDocument() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => documentService.restore(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ["documents"] });
            queryClient.invalidateQueries({ queryKey: ["document", id] });
        },
    });
}

export function useMoveDocument() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, folderId }: { id: number; folderId: number | null }) =>
            documentService.move(id, folderId),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ["documents"] });
            queryClient.invalidateQueries({ queryKey: ["document", id] });
            queryClient.invalidateQueries({ queryKey: ["folders"] });
            queryClient.invalidateQueries({ queryKey: ["folderTree"] });
        },
    });
}

export function useCopyDocument() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, folderId }: { id: number; folderId: number | null }) =>
            documentService.copy(id, folderId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["documents"] });
            queryClient.invalidateQueries({ queryKey: ["folders"] });
            queryClient.invalidateQueries({ queryKey: ["folderTree"] });
        },
    });
}

export function useDownloadDocument() {
    return useMutation({
        mutationFn: ({ id, fileName }: { id: number; fileName: string }) =>
            documentService.download(id, fileName),
    });
}
