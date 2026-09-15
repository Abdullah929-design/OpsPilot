'use client';

import React, { useState, useMemo } from 'react';
import { Role, Permission } from '@/services/roleService';

interface PermissionMatrixProps {
    roles: Role[];
    permissions: Permission[];
    onTogglePermission: (roleId: number, updatedPermissionNames: string[]) => Promise<any>;
}

// Map permission prefixes to user-friendly category titles
const getCategoryName = (permissionName: string): string => {
    const prefix = permissionName.split('.')[0];
    switch (prefix) {
        case 'users':
            return 'Users Management';
        case 'roles':
        case 'permissions':
            return 'Roles & Security';
        case 'company':
            return 'Company Profile';
        case 'departments':
        case 'teams':
        case 'designations':
        case 'offices':
            return 'Organization & Offices';
        case 'logs':
            return 'Logs & Auditing';
        case 'profile':
        case 'dashboard':
            return 'General Systems';
        default:
            return 'Other Permissions';
    }
};

export default function PermissionMatrix({
    roles,
    permissions,
    onTogglePermission,
}: PermissionMatrixProps) {
    const [updatingKey, setUpdatingKey] = useState<string | null>(null);
    const [activeRoleId, setActiveRoleId] = useState<number | null>(
        roles.length > 0 ? roles[0].id : null
    );

    // Find currently selected active role
    const activeRole = useMemo(() => {
        return roles.find(r => r.id === activeRoleId) || roles[0] || null;
    }, [roles, activeRoleId]);

    // Group permissions dynamically by category
    const groupedPermissions = useMemo(() => {
        return permissions.reduce((acc, perm) => {
            const cat = getCategoryName(perm.name);
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(perm);
            return acc;
        }, {} as Record<string, Permission[]>);
    }, [permissions]);

    // Set initial active role if state was empty and roles loaded
    React.useEffect(() => {
        if (!activeRoleId && roles.length > 0) {
            setActiveRoleId(roles[0].id);
        }
    }, [roles, activeRoleId]);

    const handleToggle = async (role: Role, permissionName: string) => {
        const currentPermissionNames = role.permissions.map((p) => p.name);
        const hasPermission = currentPermissionNames.includes(permissionName);

        const nextPermissions = hasPermission
            ? currentPermissionNames.filter((p) => p !== permissionName)
            : [...currentPermissionNames, permissionName];

        const key = `${role.id}-${permissionName}`;
        setUpdatingKey(key);
        try {
            await onTogglePermission(role.id, nextPermissions);
        } finally {
            setUpdatingKey(null);
        }
    };

    if (roles.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500 border rounded-lg bg-gray-50">
                No roles found. Click "+ Create Role" to get started.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* 1. Left Sidebar: Roles List */}
            <div className="lg:col-span-3 space-y-2 max-h-[600px] overflow-y-auto pr-1">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-2">
                    Select Role
                </div>
                {roles.map((role) => {
                    const isActive = role.id === activeRole?.id;
                    const permCount = role.permissions.length;

                    return (
                        <div
                            key={role.id}
                            onClick={() => setActiveRoleId(role.id)}
                            className={`flex flex-col p-3 rounded-lg border cursor-pointer transition-all duration-200 ${isActive
                                    ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-sm'
                                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                                }`}
                        >
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-semibold text-sm truncate">{role.name}</span>
                                {role.is_system && (
                                    <span className="text-[10px] bg-gray-100 border text-gray-600 px-1.5 py-0.2 rounded font-medium">
                                        System
                                    </span>
                                )}
                            </div>
                            <span className="text-xs text-gray-400">
                                {permCount} {permCount === 1 ? 'permission' : 'permissions'}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* 2. Right Panel: Category-Grouped Permission Checklist */}
            <div className="lg:col-span-9">
                {activeRole ? (
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">

                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                            <div>
                                <h3 className="text-md font-bold text-gray-800">
                                    Configure Permissions
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Editing overrides for role: <span className="font-semibold text-blue-600">{activeRole.name}</span>
                                </p>
                            </div>
                            <div className="text-xs font-medium text-gray-500">
                                {activeRole.permissions.length} of {permissions.length} Enabled
                            </div>
                        </div>

                        {/* Checklist Category Groups */}
                        <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
                            {Object.entries(groupedPermissions).map(([category, perms]) => (
                                <div key={category} className="space-y-3">
                                    <div className="flex items-center">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            {category}
                                        </h4>
                                        <div className="flex-grow border-t border-gray-100 ml-4"></div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {perms.map((perm) => {
                                            const isChecked = activeRole.permissions.some(p => p.name === perm.name);
                                            const key = `${activeRole.id}-${perm.name}`;
                                            const isUpdating = updatingKey === key;

                                            return (
                                                <label
                                                    key={perm.id}
                                                    className={`flex items-start p-2.5 rounded border text-sm cursor-pointer transition-all duration-150 select-none ${isChecked
                                                            ? 'bg-blue-50/40 border-blue-200 text-blue-900'
                                                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                                        } ${isUpdating ? 'opacity-50 pointer-events-none' : ''}`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        disabled={isUpdating}
                                                        onChange={() => handleToggle(activeRole, perm.name)}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer mt-0.5"
                                                    />
                                                    <span className="ml-2.5 font-medium leading-tight select-none">
                                                        {perm.name}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                ) : (
                    <div className="p-8 text-center text-gray-500 border rounded-lg bg-gray-50">
                        Please select a role from the sidebar.
                    </div>
                )}
            </div>

        </div>
    );
}
