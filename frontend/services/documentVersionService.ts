import apiClient from "./apiClient";

export interface DocumentVersion {
    id: number;
    document_id: number;
    version: number;
    file_name: string;
    size: number;
    mime_type: string;
    checksum: string;
    uploaded_by: number;
    created_at: string;
    uploader?: { id: number; name: string } | null;
}

export const documentVersionService = {
    getVersions: (documentId: number) =>
        apiClient.get(`/v1/documents/${documentId}/versions`).then((r) => r.data.data),

    uploadVersion: (documentId: number, formData: FormData) =>
        apiClient.post(`/v1/documents/${documentId}/versions`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }).then((r) => r.data.data),

    downloadVersion: (documentId: number, versionId: number, fileName: string) =>
        apiClient.get(`/v1/documents/${documentId}/versions/${versionId}/download`, { responseType: "blob" })
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

    restoreVersion: (documentId: number, versionId: number) =>
        apiClient.post(`/v1/documents/${documentId}/versions/${versionId}/restore`).then((r) => r.data.data),
};
