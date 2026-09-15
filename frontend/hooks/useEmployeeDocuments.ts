"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { employeeDocumentService, AttachDocumentData } from "@/services/employeeDocumentService";

export function useEmployeeDocuments(employeeId: number) {
    return useQuery({
        queryKey: ["employeeDocuments", employeeId],
        queryFn: () => employeeDocumentService.getEmployeeDocuments(employeeId),
        enabled: !!employeeId,
    });
}

export function useAttachEmployeeDocument() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ employeeId, data }: { employeeId: number; data: AttachDocumentData }) =>
            employeeDocumentService.attachDocument(employeeId, data),
        onSuccess: (_, { employeeId }) => {
            queryClient.invalidateQueries({ queryKey: ["employeeDocuments", employeeId] });
        },
    });
}

export function useDetachEmployeeDocument() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ employeeId, documentId }: { employeeId: number; documentId: number }) =>
            employeeDocumentService.detachDocument(employeeId, documentId),
        onSuccess: (_, { employeeId }) => {
            queryClient.invalidateQueries({ queryKey: ["employeeDocuments", employeeId] });
        },
    });
}
