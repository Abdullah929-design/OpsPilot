import apiClient from "./apiClient";

export interface TeamData {
    id: number;
    department_id: number;
    name: string;
    description: string | null;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface GetTeamsParams {
    search?: string;
    status?: string;
}

export const teamService = {
    getTeams: (departmentId: number, params?: GetTeamsParams) =>
        apiClient.get(`/v1/departments/${departmentId}/teams`, { params }).then((res) => res.data.data),

    createTeam: (departmentId: number, data: Partial<TeamData>) =>
        apiClient.post(`/v1/departments/${departmentId}/teams`, data).then((res) => res.data.data),

    updateTeam: (id: number, data: Partial<TeamData>) =>
        apiClient.put(`/v1/teams/${id}`, data).then((res) => res.data.data),

    deleteTeam: (id: number) =>
        apiClient.delete(`/v1/teams/${id}`).then((res) => res.data),
};
