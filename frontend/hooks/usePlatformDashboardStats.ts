import { useQuery } from "@tanstack/react-query";
import apiClient from "@/services/apiClient";

export interface DashboardStats {
    total_companies: number;
    active_companies: number;
    total_users: number;
    platform_managers: number;
    companies_added_this_month: number;
    companies_on_paid_plans: number;
}

export function usePlatformDashboardStats() {
    const { data, isLoading, refetch } = useQuery<DashboardStats>({
        queryKey: ["platform_dashboard_stats"],
        queryFn: () => apiClient.get("/platform/dashboard-stats").then((r) => r.data.data),
    });

    return {
        stats: data,
        isLoading,
        refetch,
    };
}
