import apiClient from "./apiClient";

export interface GetTagsParams {
    type?: string;
}

export const tagService = {
    getTags: (params?: GetTagsParams) =>
        apiClient.get("/v1/tags", { params }).then((r) => r.data.data),
};
