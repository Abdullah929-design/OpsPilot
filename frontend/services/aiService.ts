import apiClient from "./apiClient";

export interface AISuggestionResponse {
    title: string | null;
    description: string | null;
    category_id: number | null;
    tags: string[];
}

export interface AIChatResponse {
    answer: string;
    source_document_ids: number[];
    cached: boolean;
}

export const aiService = {
    searchDocuments: (q: string) =>
        apiClient.get('/v1/documents/search', { params: { q } }).then((r) => r.data),


    askAI: (question: string, documentId?: number) =>
        apiClient.post<any>('/v1/ai/ask', { question, document_id: documentId }),
    suggestMetadata: (documentId: number) =>
        apiClient.post<any>(`/v1/documents/${documentId}/suggest-metadata`).then((r) => r.data.data as AISuggestionResponse),
};
