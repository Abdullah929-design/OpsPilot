'use client';

import React, { useState, useEffect } from 'react';
import { Permission } from '@/services/roleService';

interface RoleFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    permissions: Permission[];
    onSubmit: (name: string, selectedPermissions: string[]) => Promise<void>;
}

export default function RoleFormModal({ isOpen, onClose, permissions, onSubmit }: RoleFormModalProps) {
    const [name, setName] = useState('');
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset state when opening/closing
    useEffect(() => {
        if (isOpen) {
            setName('');
            setSelectedPermissions([]);
            setError(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handlePermissionToggle = (permName: string) => {
        setSelectedPermissions((prev) =>
            prev.includes(permName) ? prev.filter((p) => p !== permName) : [...prev, permName]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            await onSubmit(name, selectedPermissions);
            onClose();
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to create role.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg max-h-[90vh] flex flex-col">
                <h2 className="text-lg font-bold mb-4">Create New Role</h2>
                {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4 flex flex-col overflow-hidden">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Role Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. Compliance Officer"
                        />
                    </div>

                    <div className="flex flex-col min-h-0">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Initial Permissions</label>
                        <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2 bg-gray-50">
                            {permissions.map((perm) => (
                                <label
                                    key={perm.id}
                                    className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100 p-1 rounded"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedPermissions.includes(perm.name)}
                                        onChange={() => handlePermissionToggle(perm.name)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                                    />
                                    <span>{perm.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {submitting ? 'Creating...' : 'Create Role'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}