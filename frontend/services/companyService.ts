import apiClient from "./apiClient";

export interface CompanyData {
    id: number;
    name: string;
    legal_name: string | null;
    email: string | null;
    phone: string | null;
    website: string | null;
    logo: string | null;
    timezone: string;
    currency: string;
    language: string;
    address: string | null;
    city: string | null;
    country: string | null;
    postal_code: string | null;
    status: string;
}

export const companyService = {
    getCompany: () =>
        apiClient.get("/v1/company").then((res) => res.data.data),

    updateCompany: (data: Partial<CompanyData>) =>
        apiClient.put("/v1/company", data).then((res) => res.data.data),

    uploadLogo: (formData: FormData) =>
        apiClient.post("/v1/company/logo", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }).then((res) => res.data.data),
};
