import apiClient from "./apiClient";

export interface Folder {
    id: number;
    company_id: number;
    parent_id: number | null;
    name: string;
    description: string | null;
    created_by: number | null;
    children_count?: number;
    documents_count?: number;
    created_at: string;
    children?: Folder[];
    all_children?: Folder[];
}

export interface FolderFormData {
    name: string;
    parent_id?: number | null;
    description?: string;
}

export const folderService = {
    getFolders: (params?: { parent_id?: number | null }) =>
        apiClient.get("/v1/folders", { params }).then((r) => r.data.data),

    getFolderTree: () =>
        apiClient.get("/v1/folders/tree").then((r) => r.data.data),

    getFolder: (id: number) =>
        apiClient.get(`/v1/folders/${id}`).then((r) => r.data.data),

    createFolder: (data: FolderFormData) =>
        apiClient.post("/v1/folders", data).then((r) => r.data.data),

    updateFolder: (id: number, data: Partial<FolderFormData>) =>
        apiClient.put(`/v1/folders/${id}`, data).then((r) => r.data.data),

    deleteFolder: (id: number, force?: boolean) =>
        apiClient.delete(`/v1/folders/${id}`, { params: force ? { force: true } : undefined }).then((r) => r.data.data),


};
