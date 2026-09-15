import apiClient from './apiClient';
import { User } from './userService';

export interface UpdateProfilePayload {
    name: string;
    preferences?: {
        theme?: string;
        email_notifications?: boolean;
        browser_notifications?: boolean;
    };
}

export const profileService = {
    async getProfile(): Promise<User> {
        const res = await apiClient.get('/v1/profile');
        return res.data.data;
    },

    async updateProfile(payload: UpdateProfilePayload): Promise<User> {
        const res = await apiClient.put('/v1/profile', payload);
        return res.data.data;
    },

    async updateAvatar(file: File): Promise<User> {
        const formData = new FormData();
        formData.append('avatar', file);

        const res = await apiClient.post('/v1/profile/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return res.data.data;
    },

    async changePassword(data: any): Promise<void> {
        await apiClient.post('/v1/profile/change-password', data);
    },
};
