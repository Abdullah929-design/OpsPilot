'use client';

import React, { useState } from 'react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { useRoles } from '@/hooks/useRoles';
import PermissionMatrix from '@/components/roles/PermissionMatrix';
import RoleFormModal from '@/components/roles/RoleFormModal';
import ErrorState from "@/components/common/ErrorState";

export default function RolesPage() {
    const { roles, permissions, loading, error, createRole, deleteRole, syncPermissions } = useRoles();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleDelete = async (roleId: number, roleName: string) => {
        if (!confirm(`Are you sure you want to delete the role "${roleName}"?`)) return;
        try {
            await deleteRole(roleId);
        } catch (err: any) {
            alert(err?.response?.data?.message || 'Failed to delete role.');
        }
    };

    return (
        <AuthenticatedLayout>
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
                        <p className="text-sm text-gray-500">Manage user roles and configure the permission matrix.</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                        + Create Role
                    </button>
                </div>

                {error ? (
                    <ErrorState message={error} />
                ) : loading ? (
                    <div className="py-12 text-center text-gray-500">Loading matrix...</div>
                ) : (
                    <PermissionMatrix
                        roles={roles}
                        permissions={permissions}
                        onTogglePermission={syncPermissions}
                    />
                )}


                {/* Roles Summary Registry (Pills Layout) */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                    <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        Role Management Registry
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {roles.map((role) => (
                            <div
                                key={role.id}
                                className="inline-flex items-center px-3.5 py-1.5 rounded-full border border-gray-200 bg-white text-sm font-medium text-gray-700 shadow-sm transition-all duration-150 hover:border-gray-300"
                            >
                                <span className="text-xs font-semibold text-gray-800">{role.name}</span>
                                {role.is_system ? (
                                    <span className="ml-2 text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">
                                        System
                                    </span>
                                ) : (
                                    <button
                                        onClick={() => handleDelete(role.id, role.name)}
                                        className="ml-2 inline-flex text-gray-400 hover:text-red-500 transition-colors"
                                        title={`Delete ${role.name} role`}
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>


                <RoleFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    permissions={permissions}
                    onSubmit={async (name, selectedPermissions) => {
                        await createRole(name, selectedPermissions);
                    }}
                />
            </div>
        </AuthenticatedLayout>
    );
}
