import apiClient from './apiClient';

export interface Permission {
    id: number;
    name: string;
    guard_name: string;
}

export interface Role {
    id: number;
    name: string;
    permissions: Permission[];
    is_system: boolean;
}

export const roleService = {
    async getRoles(): Promise<Role[]> {
        const res = await apiClient.get('/v1/roles');
        return res.data.data;
    },

    async getPermissions(): Promise<Permission[]> {
        const res = await apiClient.get('/v1/permissions');
        return res.data.data;
    },

    async createRole(name: string, permissions: string[] = []): Promise<Role> {
        const res = await apiClient.post('/v1/roles', { name, permissions });
        return res.data.data;
    },

    async updateRole(id: number, name: string): Promise<Role> {
        const res = await apiClient.put(`/v1/roles/${id}`, { name });
        return res.data.data;
    },

    async deleteRole(id: number): Promise<void> {
        await apiClient.delete(`/v1/roles/${id}`);
    },

    async syncPermissions(roleId: number, permissions: string[]): Promise<Role> {
        const res = await apiClient.patch(`/v1/roles/${roleId}/permissions`, { permissions });
        return res.data.data;
    },
};
