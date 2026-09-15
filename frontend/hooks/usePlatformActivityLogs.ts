import { useQuery } from "@tanstack/react-query";
import apiClient from "@/services/apiClient";

export interface ActivityLog {
    id: number;
    log_name: string;
    description: string;
    subject_type?: string;
    subject_id?: number;
    causer_type?: string;
    causer_id?: number;
    properties?: any;
    created_at: string;
    causer?: { id: number; name: string; email: string };
    subject?: { id: number; name: string };
}

export interface ActivityLogFilters {
    causer_id?: string;
    company_id?: string;
    event?: string;
    date?: string;
}

export function usePlatformActivityLogs(filters: ActivityLogFilters, page = 1) {
    const { data, isLoading } = useQuery<{ data: ActivityLog[]; current_page: number; last_page: number; total: number }>({
        queryKey: ["platform_activity_logs", filters, page],
        queryFn: () =>
            apiClient.get("/platform/activity-logs", { params: { ...filters, page } }).then((r) => r.data.data),
    });

    return {
        logs: data?.data || [],
        pagination: {
            currentPage: data?.current_page || 1,
            lastPage: data?.last_page || 1,
            total: data?.total || 0,
        },
        isLoading,
    };
}
