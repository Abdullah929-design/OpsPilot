import apiClient from "./apiClient";

export interface WorkflowCondition {
    field: string;
    operator: string;
    value: string;
}

export interface WorkflowAction {
    action_type: string;
    action_config: Record<string, any>;
    order: number;
}

export interface WorkflowPayload {
    name: string;
    trigger_type: string;
    is_active?: boolean;
    conditions?: WorkflowCondition[];
    actions: WorkflowAction[];
}

export interface Workflow {
    id: number;
    company_id: number;
    name: string;
    trigger_type: string;
    is_active: boolean;
    created_by: number;
    conditions: WorkflowCondition[];
    actions: WorkflowAction[];
    created_at: string;
    updated_at: string;
}

export interface WorkflowLog {
    id: number;
    company_id: number;
    workflow_id: number;
    status: 'success' | 'failed' | 'condition_not_met';
    context: Record<string, any> | null;
    error_message: string | null;
    created_at: string;
    updated_at: string;
}

export const workflowService = {
    getWorkflows: (params?: { page?: number; per_page?: number }) =>
        apiClient.get('/v1/workflows', { params }).then((r) => r.data.data),

    getWorkflowMeta: () =>
        apiClient.get('/v1/workflow-meta').then((r) => r.data.data),

    createWorkflow: (data: WorkflowPayload) =>
        apiClient.post('/v1/workflows', data).then((r) => r.data.data),

    updateWorkflow: (id: number, data: WorkflowPayload) =>
        apiClient.put(`/v1/workflows/${id}`, data).then((r) => r.data.data),

    deleteWorkflow: (id: number) =>
        apiClient.delete(`/v1/workflows/${id}`).then((r) => r.data.data),

    activateWorkflow: (id: number) =>
        apiClient.post(`/v1/workflows/${id}/activate`).then((r) => r.data.data),

    deactivateWorkflow: (id: number) =>
        apiClient.post(`/v1/workflows/${id}/deactivate`).then((r) => r.data.data),

    getWorkflowLogs: (id: number, params?: { page?: number; per_page?: number }) =>
        apiClient.get(`/v1/workflows/${id}/logs`, { params }).then((r) => r.data.data),
};
