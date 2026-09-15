'use client';

import { useState, useCallback, useEffect } from 'react';
import { roleService, Role, Permission } from '@/services/roleService';

export function useRoles() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [fetchedRoles, fetchedPermissions] = await Promise.all([
                roleService.getRoles(),
                roleService.getPermissions(),
            ]);
            setRoles(fetchedRoles);
            setPermissions(fetchedPermissions);
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to load roles and permissions.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const createRole = async (name: string, permissionNames: string[] = []) => {
        const newRole = await roleService.createRole(name, permissionNames);
        setRoles((prev) => [...prev, newRole]);
        return newRole;
    };



    const deleteRole = async (id: number) => {
        await roleService.deleteRole(id);
        setRoles((prev) => prev.filter((r) => r.id !== id));
    };

    const syncPermissions = async (roleId: number, permissionNames: string[]) => {
        const updatedRole = await roleService.syncPermissions(roleId, permissionNames);
        setRoles((prev) => prev.map((r) => (r.id === roleId ? updatedRole : r)));
        return updatedRole;
    };

    return {
        roles,
        permissions,
        loading,
        error,
        refresh: fetchData,
        createRole,
        deleteRole,
        syncPermissions,
    };
}
