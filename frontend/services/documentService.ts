import apiClient from "./apiClient";

export interface Document {
    id: number;
    company_id: number;
    folder_id: number | null;
    category_id: number | null;
    title: string;
    description: string | null;
    file_name: string;
    file_path: string;
    mime_type: string;
    extension: string;
    size: number;
    current_version: number;
    status: string;
    uploaded_by: number;
    created_at: string;
    updated_at: string;
    folder?: { id: number; name: string } | null;
    category?: { id: number; name: string } | null;
    uploader?: { id: number; name: string };
    tags?: { id: number; name: string }[];
    employees?: { id: number; name: string }[];
}

export interface GetDocumentsParams {
    q?: string;
    folder_id?: number | null;
    category_id?: number;
    uploaded_by?: number;
    employee_id?: number;
    extension?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    per_page?: number;
}

export const documentService = {
    getDocuments: (params?: GetDocumentsParams) =>
        apiClient.get("/v1/documents", { params }).then((r) => r.data.data),

    getDocument: (id: number) =>
        apiClient.get(`/v1/documents/${id}`).then((r) => r.data.data),

    upload: (formData: FormData) =>
        apiClient.post("/v1/documents", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }).then((r) => r.data.data),

    update: (id: number, data: Partial<Omit<Document, 'tags'>> & { tags?: string[] }) =>
        apiClient.put(`/v1/documents/${id}`, data).then((r) => r.data.data),

    delete: (id: number) =>
        apiClient.delete(`/v1/documents/${id}`).then((r) => r.data.data),

    restore: (id: number) =>
        apiClient.post(`/v1/documents/${id}/restore`).then((r) => r.data.data),

    download: (id: number, fileName: string) =>
        apiClient.get(`/v1/documents/${id}/download`, { responseType: "blob" })
            .then((r) => {
                const url = URL.createObjectURL(r.data);
                const a = document.createElement("a");
                a.style.display = "none";
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a); // Attach to DOM
                a.click();
                document.body.removeChild(a);  // Clean up DOM
                URL.revokeObjectURL(url);
            }),

    move: (id: number, folder_id: number | null) =>
        apiClient.post(`/v1/documents/${id}/move`, { folder_id }).then((r) => r.data.data),

    copy: (id: number, folder_id: number | null) =>
        apiClient.post(`/v1/documents/${id}/copy`, { folder_id }).then((r) => r.data.data),

    search: (params: GetDocumentsParams) =>
        apiClient.get("/v1/documents/search", { params }).then((r) => r.data.data),
};
