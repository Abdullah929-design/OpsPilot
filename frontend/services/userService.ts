import apiClient from "./apiClient";

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    is_active: boolean;
    preferences?: {
        theme?: string;
        email_notifications?: boolean;
        browser_notifications?: boolean;
    };
    roles?: { id: number; name: string }[];
    permissions?: { id: number; name: string }[];
}


export interface UserFilterParams {
    search?: string;
    role?: string;
    is_active?: boolean;
    page?: number;
    per_page?: number;
}

export interface UserFormData {
    name: string;
    email: string;
    password?: string;
    password_confirmation?: string;
    roles?: string[];
    is_active?: boolean;
}

export const userService = {
    getUsers: (params?: UserFilterParams) =>
        apiClient.get("/v1/users", { params }).then((res) => res.data.data),

    getUser: (id: number) =>
        apiClient.get(`/v1/users/${id}`).then((res) => res.data.data),

    createUser: (data: UserFormData) =>
        apiClient.post("/v1/users", data).then((res) => res.data.data),

    updateUser: (id: number, data: UserFormData) =>
        apiClient.put(`/v1/users/${id}`, data).then((res) => res.data.data),

    deleteUser: (id: number) =>
        apiClient.delete(`/v1/users/${id}`).then((res) => res.data.data),

    activateUser: (id: number) =>
        apiClient.patch(`/v1/users/${id}/activate`).then((res) => res.data.data),

    deactivateUser: (id: number) =>
        apiClient.patch(`/v1/users/${id}/deactivate`).then((res) => res.data.data),

    getUserPermissionsBreakdown: (id: number) =>
        apiClient.get(`/v1/users/${id}/permissions`).then((res) => res.data.data),

    syncCustomPermissions: (id: number, permissions: string[]) =>
        apiClient.patch(`/v1/users/${id}/permissions/grants`, { permissions }).then((res) => res.data.data),

    syncPermissionDenials: (id: number, permissions: string[]) =>
        apiClient.patch(`/v1/users/${id}/permissions/denials`, { permissions }).then((res) => res.data.data),

};
