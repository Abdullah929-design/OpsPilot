import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/apiClient";

export interface TenantUser {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
    roles?: { name: string }[];
}

export interface TenantRole {
    id: number;
    name: string;
    permissions?: { name: string }[];
}

// 1. Users Hook
export function usePlatformCompanyUsers(companyId: number) {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery<{ items: TenantUser[] }>({
        queryKey: ["platform_company_users", companyId],
        queryFn: () => apiClient.get(`/platform/companies/${companyId}/users`).then((r) => r.data.data),
    });

    const createUser = useMutation({
        mutationFn: (userData: any) => apiClient.post(`/platform/companies/${companyId}/users`, userData),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["platform_company_users", companyId] }),
    });

    const updateUser = useMutation({
        mutationFn: ({ userId, userData }: { userId: number; userData: any }) =>
            apiClient.put(`/platform/companies/${companyId}/users/${userId}`, userData),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["platform_company_users", companyId] }),
    });

    const deleteUser = useMutation({
        mutationFn: (userId: number) => apiClient.delete(`/platform/companies/${companyId}/users/${userId}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["platform_company_users", companyId] }),
    });

    return {
        users: data?.items || [],
        isLoading,
        createUser,
        updateUser,
        deleteUser,
    };
}

// 1.5. Employees Hook
export function usePlatformCompanyEmployees(companyId: number) {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery<{ items: any[] }>({
        queryKey: ["platform_company_employees", companyId],
        queryFn: () => apiClient.get(`/platform/companies/${companyId}/employees`).then((r) => r.data.data),
    });

    const createEmployee = useMutation({
        mutationFn: (employeeData: any) => apiClient.post(`/platform/companies/${companyId}/employees`, employeeData),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["platform_company_employees", companyId] }),
    });

    const updateEmployee = useMutation({
        mutationFn: ({ employeeId, employeeData }: { employeeId: number; employeeData: any }) =>
            apiClient.put(`/platform/companies/${companyId}/employees/${employeeId}`, employeeData),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["platform_company_employees", companyId] }),
    });

    const deleteEmployee = useMutation({
        mutationFn: (employeeId: number) => apiClient.delete(`/platform/companies/${companyId}/employees/${employeeId}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["platform_company_employees", companyId] }),
    });

    return {
        employees: data?.items || [],
        isLoading,
        createEmployee,
        updateEmployee,
        deleteEmployee,
    };
}


// 2. Roles Hook
export function usePlatformCompanyRoles(companyId: number) {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery<TenantRole[]>({
        queryKey: ["platform_company_roles", companyId],
        queryFn: () => apiClient.get(`/platform/companies/${companyId}/roles`).then((r) => r.data.data),
    });

    const syncPermissions = useMutation({
        mutationFn: ({ roleId, permissions }: { roleId: number; permissions: string[] }) =>
            apiClient.post(`/platform/companies/${companyId}/roles/${roleId}/permissions`, { permissions }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["platform_company_roles", companyId] }),
    });

    return {
        roles: data || [],
        isLoading,
        syncPermissions,
    };
}

// 3. Settings Hook
export function usePlatformCompanySettings(companyId: number) {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery<any>({
        queryKey: ["platform_company_settings", companyId],
        queryFn: () => apiClient.get(`/platform/companies/${companyId}/settings`).then((r) => r.data.data),
    });

    const updateSettings = useMutation({
        mutationFn: (settings: any) => apiClient.post(`/platform/companies/${companyId}/settings`, { settings }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["platform_company_settings", companyId] }),
    });

    return {
        settings: data, // Return stable undefined while loading
        isLoading,
        updateSettings,
    };
}

// 4. Scoped Activity Hook
export function usePlatformCompanyActivityLogs(companyId: number, page = 1) {
    const { data, isLoading } = useQuery<any>({
        queryKey: ["platform_company_activity_logs", companyId, page],
        queryFn: () =>
            apiClient.get(`/platform/companies/${companyId}/activity-logs`, { params: { page } }).then((r) => r.data.data),
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
