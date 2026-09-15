import apiClient from './apiClient';

export interface NotificationItem {
    id: string;
    type: string;
    data: {
        title: string;
        message: string;
        action_url?: string;
    };
    read_at: string | null;
    created_at: string;
}

export const notificationService = {
    async getNotifications(): Promise<NotificationItem[]> {
        const res = await apiClient.get('/v1/notifications');
        return res.data.data;
    },

    async markAsRead(id: string): Promise<void> {
        await apiClient.post(`/v1/notifications/${id}/read`);
    },

    async markAllAsRead(): Promise<void> {
        await apiClient.post('/v1/notifications/read-all');
    },
};
