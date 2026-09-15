import apiClient from "./apiClient";
import { Document } from "./documentService";

export interface AttachDocumentData {
    document_id: number;
    note?: string;
}

export const employeeDocumentService = {
    getEmployeeDocuments: (employeeId: number): Promise<Document[]> =>
        apiClient.get(`/v1/employees/${employeeId}/documents`).then((r) => r.data.data),

    attachDocument: (employeeId: number, data: AttachDocumentData): Promise<void> =>
        apiClient.post(`/v1/employees/${employeeId}/documents`, data).then((r) => r.data.data),

    detachDocument: (employeeId: number, documentId: number): Promise<void> =>
        apiClient.delete(`/v1/employees/${employeeId}/documents/${documentId}`).then((r) => r.data.data),
};
