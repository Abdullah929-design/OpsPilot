import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/apiClient";

export interface Plan {
    id: number;
    name: string;
    description?: string;
    user_limit?: number | null;
    company_storage_limit_mb?: number | null;

    price: number | string;
    billing_interval: "monthly" | "yearly";
    trial_days: number;
    features?: string[];
    is_archived: boolean;
    created_at?: string;
}

export function usePlatformPlans() {
    const queryClient = useQueryClient();

    const { data: plans = [], isLoading, error } = useQuery<Plan[]>({
        queryKey: ["platform_plans"],
        queryFn: () => apiClient.get("/platform/plans").then((r) => r.data.data),
    });

    const createPlan = useMutation({
        mutationFn: (payload: Omit<Plan, "id">) => apiClient.post("/platform/plans", payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["platform_plans"] }),
    });

    const updatePlan = useMutation({
        mutationFn: ({ id, ...payload }: Plan) => apiClient.put(`/platform/plans/${id}`, payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["platform_plans"] }),
    });

    const deletePlan = useMutation({
        mutationFn: (id: number) => apiClient.delete(`/platform/plans/${id}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["platform_plans"] }),
    });

    return {
        plans,
        isLoading,
        error,
        createPlan,
        updatePlan,
        deletePlan,
    };
}
