import apiClient from './apiClient';

export interface ActivityLogItem {
    id: number;
    user?: { name: string; email: string };
    action: string;
    entity_type?: string;
    entity_id?: number;
    ip_address?: string;
    user_agent?: string;
    meta?: any;
    created_at: string;
}

export interface AuditLogItem {
    id: number;
    user?: { name: string; email: string };
    action: string;
    entity_type?: string;
    entity_id?: number;
    old_values?: any;
    new_values?: any;
    ip_address?: string;
    created_at: string;
}

export const logService = {
    async getActivityLogs(page = 1): Promise<{ items: ActivityLogItem[]; pagination: any }> {
        const res = await apiClient.get(`/v1/activity-logs?page=${page}`);
        return res.data.data;
    },

    async getAuditLogs(page = 1): Promise<{ items: AuditLogItem[]; pagination: any }> {
        const res = await apiClient.get(`/v1/audit-logs?page=${page}`);
        return res.data.data;
    },
};
