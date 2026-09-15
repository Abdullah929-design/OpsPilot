'use client';

import { useState, useEffect, useCallback } from 'react';
import { profileService, UpdateProfilePayload } from '@/services/profileService';
import { User } from '@/services/userService';

export function useProfile() {
    const [profile, setProfile] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await profileService.getProfile();
            setProfile(data);
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to fetch profile.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const updateProfile = async (payload: UpdateProfilePayload) => {
        const updated = await profileService.updateProfile(payload);
        setProfile(updated);
        return updated;
    };

    const updateAvatar = async (file: File) => {
        const updated = await profileService.updateAvatar(file);
        setProfile(updated);
        return updated;
    };

    const changePassword = async (data: any) => {
        await profileService.changePassword(data);
    };

    return {
        profile,
        loading,
        error,
        refresh: fetchProfile,
        updateProfile,
        updateAvatar,
        changePassword,
    };
}
