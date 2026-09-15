"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { workflowService, WorkflowPayload } from "@/services/workflowService";

export function useWorkflows(params?: { page?: number; per_page?: number }) {
    return useQuery({
        queryKey: ["workflows", params],
        queryFn: () => workflowService.getWorkflows(params),
    });
}

export function useWorkflowMeta() {
    return useQuery({
        queryKey: ["workflow-meta"],
        queryFn: () => workflowService.getWorkflowMeta(),
        staleTime: Infinity, // The trigger/action metadata won't change during session
    });
}

export function useCreateWorkflow() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: WorkflowPayload) => workflowService.createWorkflow(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["workflows"] });
        },
    });
}

export function useUpdateWorkflow() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: WorkflowPayload }) =>
            workflowService.updateWorkflow(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["workflows"] });
            queryClient.invalidateQueries({ queryKey: ["workflows", variables.id] });
        },
    });
}

export function useDeleteWorkflow() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => workflowService.deleteWorkflow(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["workflows"] });
        },
    });
}

export function useActivateWorkflow() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, activate }: { id: number; activate: boolean }) =>
            activate ? workflowService.activateWorkflow(id) : workflowService.deactivateWorkflow(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["workflows"] });
        },
    });
}

export function useWorkflowLogs(id: number, params?: { page?: number; per_page?: number }) {
    return useQuery({
        queryKey: ["workflow-logs", id, params],
        queryFn: () => workflowService.getWorkflowLogs(id, params),
        enabled: !!id,
    });
}
