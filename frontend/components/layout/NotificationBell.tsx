'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    IconButton,
    Badge,
    Menu,
    MenuItem,
    Typography,
    Divider,
    List,
    ListItemText,
    ListItemButton,
    Box,
    Button
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { notificationService, NotificationItem } from '@/services/notificationService';
import Link from 'next/link';

export default function NotificationBell() {
    const queryClient = useQueryClient();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    // Poll notifications every 30 seconds
    const { data: notifications = [] } = useQuery<NotificationItem[]>({
        queryKey: ['notifications'],
        queryFn: notificationService.getNotifications,
        refetchInterval: 30000,
    });

    const unreadCount = notifications.filter((n) => !n.read_at).length;

    const markReadMutation = useMutation({
        mutationFn: notificationService.markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    const markAllReadMutation = useMutation({
        mutationFn: notificationService.markAllAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleNotificationClick = async (notification: NotificationItem) => {
        if (!notification.read_at) {
            await markReadMutation.mutateAsync(notification.id);
        }
        handleClose();
    };

    return (
        <>
            <IconButton color="inherit" onClick={handleClick}>
                <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                </Badge>
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                slotProps={{
                    paper: {
                        sx: { width: 360, maxHeight: 400, mt: 1 },
                    },
                }}
            >
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                        Notifications
                    </Typography>
                    {unreadCount > 0 && (
                        <Button size="small" onClick={() => markAllReadMutation.mutate()}>
                            Mark all as read
                        </Button>
                    )}
                </Box>
                <Divider />

                <List sx={{ p: 0 }}>
                    {notifications.length === 0 ? (
                        <Box sx={{ p: 3, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                No notifications yet.
                            </Typography>
                        </Box>
                    ) : (
                        notifications.map((notification) => (
                            <MenuItem
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                sx={{
                                    backgroundColor: notification.read_at ? 'transparent' : 'action.hover',
                                    whiteSpace: 'normal',
                                    py: 1.5,
                                }}
                            >
                                <Box sx={{ width: '100%' }}>
                                    <Typography sx={{ fontWeight: notification.read_at ? 'normal' : 'bold', fontSize: '0.875rem', display: 'block' }}>
                                        {notification.data.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                        {notification.data.message}
                                    </Typography>
                                    <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.5 }}>
                                        {new Date(notification.created_at).toLocaleString()}
                                    </Typography>
                                </Box>
                            </MenuItem>
                        ))
                    )}
                </List>
            </Menu>
        </>
    );
}
