"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { documentVersionService } from "@/services/documentVersionService";

export function useDocumentVersions(documentId: number) {
    return useQuery({
        queryKey: ["documentVersions", documentId],
        queryFn: () => documentVersionService.getVersions(documentId),
        enabled: !!documentId,
    });
}

export function useUploadVersion() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ documentId, formData }: { documentId: number; formData: FormData }) =>
            documentVersionService.uploadVersion(documentId, formData),
        onSuccess: (_, { documentId }) => {
            queryClient.invalidateQueries({ queryKey: ["documentVersions", documentId] });
            queryClient.invalidateQueries({ queryKey: ["document", documentId] });
            queryClient.invalidateQueries({ queryKey: ["documents"] });
        },
    });
}

export function useRestoreVersion() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ documentId, versionId }: { documentId: number; versionId: number }) =>
            documentVersionService.restoreVersion(documentId, versionId),
        onSuccess: (_, { documentId }) => {
            queryClient.invalidateQueries({ queryKey: ["documentVersions", documentId] });
            queryClient.invalidateQueries({ queryKey: ["document", documentId] });
            queryClient.invalidateQueries({ queryKey: ["documents"] });
        },
    });
}

export function useDownloadVersion() {
    return useMutation({
        mutationFn: ({ documentId, versionId, fileName }: { documentId: number; versionId: number; fileName: string }) =>
            documentVersionService.downloadVersion(documentId, versionId, fileName),
    });
}
