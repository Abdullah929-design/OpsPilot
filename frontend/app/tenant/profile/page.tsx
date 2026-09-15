'use client';

import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { useProfile } from '@/hooks/useProfile';

export default function ProfilePage() {
    const { profile, loading, error, updateProfile, updateAvatar, changePassword } = useProfile();

    // Form states
    const [name, setName] = useState('');
    const [theme, setTheme] = useState('light');
    const [emailNotifs, setEmailNotifs] = useState(true);
    const [browserNotifs, setBrowserNotifs] = useState(false);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [profileSaving, setProfileSaving] = useState(false);
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [avatarUploading, setAvatarUploading] = useState(false);

    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    useEffect(() => {
        if (profile) {
            setName(profile.name || '');
            setTheme(profile.preferences?.theme || 'light');
            setEmailNotifs(profile.preferences?.email_notifications ?? true);
            setBrowserNotifs(profile.preferences?.browser_notifications ?? false);
        }
    }, [profile]);

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileSaving(true);
        setFeedback(null);
        try {
            await updateProfile({
                name,
                preferences: {
                    theme,
                    email_notifications: emailNotifs,
                    browser_notifications: browserNotifs,
                },
            });
            setFeedback({ type: 'success', message: 'Profile updated successfully.' });
        } catch (err: any) {
            setFeedback({ type: 'error', message: err?.response?.data?.message || 'Failed to update profile.' });
        } finally {
            setProfileSaving(false);
        }
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setAvatarUploading(true);
        setFeedback(null);
        try {
            await updateAvatar(file);
            setFeedback({ type: 'success', message: 'Avatar updated successfully.' });
        } catch (err: any) {
            setFeedback({ type: 'error', message: err?.response?.data?.message || 'Failed to upload avatar.' });
        } finally {
            setAvatarUploading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setFeedback({ type: 'error', message: 'New passwords do not match.' });
            return;
        }

        setPasswordSaving(true);
        setFeedback(null);
        try {
            await changePassword({
                current_password: currentPassword,
                password: newPassword,
                password_confirmation: confirmPassword,
            });
            setFeedback({ type: 'success', message: 'Password changed successfully.' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setFeedback({ type: 'error', message: err?.response?.data?.message || 'Failed to change password.' });
        } finally {
            setPasswordSaving(false);
        }
    };

    if (loading) {
        return (
            <AuthenticatedLayout>
                <div className="p-6 text-center text-gray-500">Loading profile...</div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout>
            <div className="p-6 max-w-4xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
                    <p className="text-sm text-gray-500">Manage your account information and preferences.</p>
                </div>

                {feedback && (
                    <div
                        className={`p-4 rounded-md text-sm ${feedback.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                            }`}
                    >
                        {feedback.message}
                    </div>
                )}

                {error && <div className="p-4 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}

                {/* Avatar Upload Card */}
                <div className="bg-white p-6 rounded-lg border shadow-sm flex items-center space-x-6">
                    <div className="relative">
                        <img
                            src={profile?.avatar || 'https://via.placeholder.com/100'}
                            alt={profile?.name}
                            className="w-24 h-24 rounded-full object-cover border"
                        />
                        {avatarUploading && (
                            <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center text-xs text-white">
                                Uploading...
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="font-medium text-gray-900">Profile Picture</h3>
                        <p className="text-xs text-gray-500 mb-3">JPG, PNG, or WEBP. Max size 2MB.</p>
                        <label className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs px-3 py-2 rounded-md font-medium">
                            Upload New Photo
                            <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                        </label>
                    </div>
                </div>

                {/* Basic Info & Preferences Form */}
                <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Profile Details & Preferences</h2>
                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email Address (Read Only)</label>
                                <input
                                    type="email"
                                    disabled
                                    value={profile?.email || ''}
                                    className="mt-1 block w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Theme Preference</label>
                            <select
                                value={theme}
                                onChange={(e) => setTheme(e.target.value)}
                                className="mt-1 block w-full md:w-1/2 rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                                <option value="system">System Default</option>
                            </select>
                        </div>

                        <div className="space-y-2 pt-2">
                            <span className="block text-sm font-medium text-gray-700">Notification Preferences</span>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={emailNotifs}
                                    onChange={(e) => setEmailNotifs(e.target.checked)}
                                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                                />
                                <span className="text-sm text-gray-600">Email Notifications</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={browserNotifs}
                                    onChange={(e) => setBrowserNotifs(e.target.checked)}
                                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                                />
                                <span className="text-sm text-gray-600">Browser Notifications</span>
                            </label>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={profileSaving}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                            >
                                {profileSaving ? 'Saving...' : 'Save Profile Changes'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Change Password Form */}
                <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Change Password</h2>
                    <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Current Password</label>
                            <input
                                type="password"
                                required
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">New Password</label>
                            <input
                                type="password"
                                required
                                minLength={8}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                            <input
                                type="password"
                                required
                                minLength={8}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <button
                                type="submit"
                                disabled={passwordSaving}
                                className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                            >
                                {passwordSaving ? 'Updating Password...' : 'Update Password'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
