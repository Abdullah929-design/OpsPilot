'use client';

import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { logService, ActivityLogItem, AuditLogItem } from '@/services/logService';
import { useAuth } from '@/hooks/useAuth'; // <-- Added useAuth
import ErrorState from '@/components/common/ErrorState'; // <-- Added ErrorState


export default function ActivityLogsPage() {
    const { user } = useAuth(); // <-- Get current user
    const [activeTab, setActiveTab] = useState<'activity' | 'audit'>('activity');
    const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null); // <-- Add error state

    useEffect(() => {
        async function fetchLogs() {
            setLoading(true);
            setError(null); // <-- Reset error before fetching
            try {
                if (activeTab === 'activity') {
                    const data = await logService.getActivityLogs();
                    setActivityLogs(data.items);
                } else {
                    const data = await logService.getAuditLogs();
                    setAuditLogs(data.items);
                }
            } catch (err: any) {
                setError(err?.response?.data?.message || 'Failed to load logs.');
            } finally {
                setLoading(false);
            }
        }
        fetchLogs();
    }, [activeTab]);

    const canViewAudit =
        user?.permissions?.some(p => p.name === 'roles.manage' || p.name === 'permissions.manage') ||
        user?.roles?.some(r => r.name === 'Super Admin');

    return (
        <AuthenticatedLayout>
            <div className="p-6 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">System Activity & Audit Logs</h1>
                    <p className="text-sm text-gray-500">Track system actions and sensitive entity changes.</p>
                </div>

                {/* Tab Controls */}
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('activity')}
                        className={`py-2 px-4 text-sm font-medium border-b-2 ${activeTab === 'activity'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Activity Logs (Actions)
                    </button>
                    {canViewAudit && ( // <-- Only render for authorized users
                        <button
                            onClick={() => setActiveTab('audit')}
                            className={`py-2 px-4 text-sm font-medium border-b-2 ${activeTab === 'audit'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Audit Logs (Entity Diff)
                        </button>
                    )}
                </div>


                {error ? (
                    <ErrorState message={error} />
                ) : loading ? (
                    <div className="py-12 text-center text-gray-500">Loading logs...</div>
                ) : activeTab === 'activity' ? (

                    <div className="bg-white border rounded-lg overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500">Timestamp</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500">User</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500">Action</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500">Entity</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500">IP Address</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {activityLogs.map((log) => (
                                    <tr key={log.id}>
                                        <td className="px-4 py-3 text-gray-600">{new Date(log.created_at).toLocaleString()}</td>
                                        <td className="px-4 py-3 font-medium text-gray-900">{log.user?.name || 'System'}</td>
                                        <td className="px-4 py-3 text-blue-600 font-mono">{log.action}</td>
                                        <td className="px-4 py-3 text-gray-500">{log.entity_type ? `${log.entity_type} #${log.entity_id}` : '-'}</td>
                                        <td className="px-4 py-3 text-gray-500">{log.ip_address || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="bg-white border rounded-lg overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500">Timestamp</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500">User</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500">Action</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-500">Diff (Old → New)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {auditLogs.map((log) => (
                                    <tr key={log.id}>
                                        <td className="px-4 py-3 text-gray-600">{new Date(log.created_at).toLocaleString()}</td>
                                        <td className="px-4 py-3 font-medium text-gray-900">{log.user?.name || 'System'}</td>
                                        <td className="px-4 py-3 text-purple-600 font-mono">{log.action}</td>
                                        <td className="px-4 py-3 font-mono text-xs">
                                            <pre className="max-w-md overflow-x-auto bg-gray-50 p-2 rounded">
                                                {JSON.stringify({ old: log.old_values, new: log.new_values }, null, 2)}
                                            </pre>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
