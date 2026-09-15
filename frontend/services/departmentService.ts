import apiClient from "./apiClient";

export interface DepartmentData {
    id: number;
    company_id: number;
    name: string;
    description: string | null;
    status: string;
    teams_count?: number;
    created_at: string;
    updated_at: string;
}

export interface GetDepartmentsParams {
    search?: string;
    status?: string;
    page?: number;
    per_page?: number;
}

export const departmentService = {
    getDepartments: (params?: GetDepartmentsParams) =>
        apiClient.get("/v1/departments", { params }).then((res) => res.data),

    createDepartment: (data: Partial<DepartmentData>) =>
        apiClient.post("/v1/departments", data).then((res) => res.data.data),

    updateDepartment: (id: number, data: Partial<DepartmentData>) =>
        apiClient.put(`/v1/departments/${id}`, data).then((res) => res.data.data),

    deleteDepartment: (id: number) =>
        apiClient.delete(`/v1/departments/${id}`).then((res) => res.data),
};
