import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/apiClient";
import { Plan } from "./usePlatformPlans";

export interface Company {
    id: number;
    name: string;
    subdomain?: string;
    legal_name?: string;
    email?: string;
    phone?: string;
    website?: string;
    timezone: string;
    currency: string;
    status: "active" | "inactive";
    platform_status: "active" | "suspended";
    plan_id?: number;
    assigned_manager_id?: number;
    plan?: Plan;
    assigned_manager?: { id: number; name: string; email: string };
    created_at?: string;
}

export function usePlatformCompanies(id?: number) {
    const queryClient = useQueryClient();

    const updateSubdomain = useMutation({
        mutationFn: ({ companyId, subdomain }: { companyId: number; subdomain: string }) =>
            apiClient.patch(`/platform/companies/${companyId}/subdomain`, { subdomain }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["platform_companies"] });
            if (id) queryClient.invalidateQueries({ queryKey: ["platform_company", id] });
        },
    });


    const { data: companies = [], isLoading: isListLoading } = useQuery<Company[]>({
        queryKey: ["platform_companies"],
        queryFn: () => apiClient.get("/platform/companies").then((r) => r.data.data),
        enabled: !id,
    });

    const { data: company = null, isLoading: isDetailLoading } = useQuery<Company | null>({
        queryKey: ["platform_company", id],
        queryFn: () => apiClient.get(`/platform/companies/${id}`).then((r) => r.data.data),
        enabled: !!id,
    });

    const createCompany = useMutation({
        mutationFn: (payload: Partial<Company>) => apiClient.post("/platform/companies", payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["platform_companies"] }),
    });

    const updateCompany = useMutation({
        mutationFn: ({ id: companyId, ...payload }: Partial<Company>) => apiClient.put(`/platform/companies/${companyId}`, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["platform_companies"] });
            if (id) queryClient.invalidateQueries({ queryKey: ["platform_company", id] });
        },
    });

    const suspendCompany = useMutation({
        mutationFn: (companyId: number) => apiClient.post(`/platform/companies/${companyId}/suspend`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["platform_companies"] });
            if (id) queryClient.invalidateQueries({ queryKey: ["platform_company", id] });
        },
    });

    const activateCompany = useMutation({
        mutationFn: (companyId: number) => apiClient.post(`/platform/companies/${companyId}/activate`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["platform_companies"] });
            if (id) queryClient.invalidateQueries({ queryKey: ["platform_company", id] });
        },
    });

    const changePlan = useMutation({
        mutationFn: ({ companyId, planId }: { companyId: number; planId: number | null }) =>
            apiClient.put(`/platform/companies/${companyId}/change-plan`, { plan_id: planId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["platform_companies"] });
            if (id) queryClient.invalidateQueries({ queryKey: ["platform_company", id] });
        },
    });

    const assignManager = useMutation({
        mutationFn: ({ companyId, managerId }: { companyId: number; managerId: number | null }) =>
            apiClient.put(`/platform/companies/${companyId}/assign-manager`, { assigned_manager_id: managerId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["platform_companies"] });
            if (id) queryClient.invalidateQueries({ queryKey: ["platform_company", id] });
        },
    });

    return {
        companies,
        company,
        isLoading: isListLoading || isDetailLoading,
        createCompany,
        updateCompany,
        suspendCompany,
        activateCompany,
        changePlan,
        assignManager,
        updateSubdomain
    };
}
