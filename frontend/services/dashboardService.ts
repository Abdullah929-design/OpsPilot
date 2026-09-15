import apiClient from "./apiClient";

export interface DocumentStats {
    total_documents: number;
    storage_used_bytes: number;
    recent_uploads: any[];
    documents_by_category: any[];
    top_uploaders: any[];
}

export interface DashboardStats {
    departments: number;
    teams: number;
    total_employees: number;
    active_employees: number;
    new_joinees_this_month: number;
    documents: number;
    active_users: number;
    recent_hires?: any[];
    document_stats?: DocumentStats;
}

export const dashboardService = {
    getStats: (): Promise<DashboardStats> =>
        apiClient.get("/v1/dashboard/stats").then((res) => res.data.data),
};
