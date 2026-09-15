import apiClient from "./apiClient";

export interface OfficeData {
    id: number;
    company_id: number;
    name: string;
    country: string;
    city: string;
    address: string | null;
    timezone: string;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface GetOfficesParams {
    search?: string;
    status?: string;
    page?: number;
    per_page?: number;
}

export const officeService = {
    getOffices: (params?: GetOfficesParams) =>
        apiClient.get("/v1/offices", { params }).then((res) => res.data),

    createOffice: (data: Partial<OfficeData>) =>
        apiClient.post("/v1/offices", data).then((res) => res.data.data),

    updateOffice: (id: number, data: Partial<OfficeData>) =>
        apiClient.put(`/v1/offices/${id}`, data).then((res) => res.data.data),

    deleteOffice: (id: number) =>
        apiClient.delete(`/v1/offices/${id}`).then((res) => res.data),
};
