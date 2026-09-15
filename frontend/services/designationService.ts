import apiClient from "./apiClient";

export interface DesignationData {
    id: number;
    company_id: number;
    title: string;
    status: string;
    is_manager: boolean;
    is_system: boolean;
    created_at: string;
    updated_at: string;
}

export interface GetDesignationsParams {
    search?: string;
    status?: string;
    page?: number;
    per_page?: number;
}


export const designationService = {
    getDesignations: (params?: GetDesignationsParams) =>
        apiClient.get("/v1/designations", { params }).then((res) => res.data),

    createDesignation: (data: Partial<DesignationData>) =>
        apiClient.post("/v1/designations", data).then((res) => res.data.data),

    updateDesignation: (id: number, data: Partial<DesignationData>) =>
        apiClient.put(`/v1/designations/${id}`, data).then((res) => res.data.data),

    deleteDesignation: (id: number) =>
        apiClient.delete(`/v1/designations/${id}`).then((res) => res.data),
};
