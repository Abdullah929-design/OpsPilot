import apiClient from "./apiClient";

export interface DocumentCategory {
    id: number;
    name: string;
    description: string | null;
    documents_count?: number;
    created_at: string;
}

export interface CategoryFormData {
    name: string;
    description?: string;
}

export const categoryService = {
    getCategories: () =>
        apiClient.get("/v1/document-categories").then((r) => r.data.data),

    createCategory: (data: CategoryFormData) =>
        apiClient.post("/v1/document-categories", data).then((r) => r.data.data),

    updateCategory: (id: number, data: CategoryFormData) =>
        apiClient.put(`/v1/document-categories/${id}`, data).then((r) => r.data.data),

    deleteCategory: (id: number) =>
        apiClient.delete(`/v1/document-categories/${id}`).then((r) => r.data.data),
};
