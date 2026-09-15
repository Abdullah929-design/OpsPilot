import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Grid, Checkbox,
    FormControlLabel, Button, CircularProgress, Alert, Stack, Divider
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import PermissionChip from './PermissionChip';
import { useQuery } from '@tanstack/react-query';
import { roleService } from '@/services/roleService';
import {
    useUserPermissions,
    useSyncUserCustomPermissions,
    useSyncUserPermissionDenials
} from '@/hooks/useUsers';
import Toast from '@/components/common/Toast';

interface UserPermissionsPanelProps {
    userId: number;
}

export default function UserPermissionsPanel({ userId }: UserPermissionsPanelProps) {
    const { data: breakdown, isLoading: loadingBreakdown, error: breakdownError } = useUserPermissions(userId);
    const { data: allPermissions, isLoading: loadingAllPerms } = useQuery({
        queryKey: ['permissions'],
        queryFn: () => roleService.getPermissions(),
    });

    const syncGrants = useSyncUserCustomPermissions();
    const syncDenials = useSyncUserPermissionDenials();

    // Local state for toggles
    const [selectedGrants, setSelectedGrants] = useState<string[]>([]);
    const [selectedDenials, setSelectedDenials] = useState<string[]>([]);

    // Toast state
    const [toast, setToast] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    const rolePermissions = breakdown?.role_permissions || [];

    // Sync initial values from API
    useEffect(() => {
        if (breakdown) {
            setSelectedGrants(breakdown.direct_permissions || []);
            setSelectedDenials(breakdown.denied_permissions || []);
        }
    }, [breakdown]);



    if (loadingBreakdown || loadingAllPerms) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={30} />
            </Box>
        );
    }

    if (breakdownError) {
        return <Alert severity="error">Failed to load permissions breakdown.</Alert>;
    }

    // A permission is deniable if it is granted by role OR explicitly granted directly
    const deniablePermissions = allPermissions?.filter(p =>
        rolePermissions.includes(p.name) || selectedGrants.includes(p.name)
    ) || [];

    // Local calculation of effective permissions for live feedback
    const localEffectivePermissions = [
        ...new Set([...rolePermissions, ...selectedGrants])
    ].filter(name => !selectedDenials.includes(name));

    const handleGrantToggle = (name: string) => {
        setSelectedGrants(prev => {
            const isRemoving = prev.includes(name);
            const nextGrants = isRemoving ? prev.filter(p => p !== name) : [...prev, name];
            // If we are removing a custom grant, and it is not inherited from their role,
            // automatically remove it from the denials list as well.
            if (isRemoving && !rolePermissions.includes(name)) {
                setSelectedDenials(dPrev => dPrev.filter(p => p !== name));
            }
            return nextGrants;
        });
    };

    const handleDenialToggle = (name: string) => {
        setSelectedDenials(prev =>
            prev.includes(name) ? prev.filter(p => p !== name) : [...prev, name]
        );
    };

    const handleSave = async () => {
        try {
            await Promise.all([
                syncGrants.mutateAsync({ id: userId, permissions: selectedGrants }),
                syncDenials.mutateAsync({ id: userId, permissions: selectedDenials })
            ]);
            setToast({ open: true, message: 'Permissions updated successfully.', severity: 'success' });
        } catch (err: any) {
            setToast({
                open: true,
                message: err.response?.data?.message || 'Failed to update custom permissions.',
                severity: 'error'
            });
        }
    };

    const isSaving = syncGrants.isPending || syncDenials.isPending;

    return (
        <Box sx={{ mt: 3 }}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                Custom Permissions & Overrides
            </Typography>

            <Stack spacing={3}>
                {/* 1. Effective Permissions Summary Card */}
                <Paper sx={{ p: 3, borderLeft: '5px solid #1976d2', borderRadius: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5, color: '#1976d2' }}>
                        Effective Permissions Summary (Resulting Access)
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {localEffectivePermissions.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">No permissions active for this user.</Typography>
                        ) : (
                            localEffectivePermissions.map(name => (
                                <PermissionChip key={name} name={name} />
                            ))
                        )}

                        {/* Show denied items explicitly as crossed out in the summary */}
                        {selectedDenials.map(name => (
                            <PermissionChip key={name} name={name} isDenied />
                        ))}
                    </Box>
                </Paper>

                <Paper sx={{ p: 3, borderRadius: 2 }}>
                    <Stack spacing={3}>
                        {/* 2. Inherited Permissions (Read-only) */}
                        <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}>
                                Inherited from Role (Read-only)
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {rolePermissions.length === 0 ? (
                                    <Typography variant="body2" color="text.secondary">No role permissions inherited.</Typography>
                                ) : (
                                    rolePermissions.map((name: string) => (
                                        <PermissionChip key={name} name={name} isInherited />
                                    ))
                                )}
                            </Box>
                        </Box>

                        <Divider />

                        {/* 3. Custom Grants Checklist */}
                        <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                                Explicit Custom Grants (Add access)
                            </Typography>
                            <Grid container spacing={1}>
                                {allPermissions?.map(p => (
                                    <Grid key={p.id} size={{ xs: 12, sm: 6, md: 4 }}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    size="small"
                                                    checked={selectedGrants.includes(p.name)}
                                                    onChange={() => handleGrantToggle(p.name)}
                                                    disabled={rolePermissions.includes(p.name)} // No need to grant if already inherited
                                                />
                                            }
                                            label={
                                                <Typography variant="body2" color={rolePermissions.includes(p.name) ? "text.secondary" : "text.primary"}>
                                                    {p.name} {rolePermissions.includes(p.name) && "(Inherited)"}
                                                </Typography>
                                            }
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>

                        <Divider />

                        {/* 4. Explicit Denials Checklist */}
                        <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: '#d32f2f' }}>
                                Explicit Denials (Revoke access)
                            </Typography>
                            <Grid container spacing={1}>
                                {deniablePermissions.length === 0 ? (
                                    <Grid size={12}>
                                        <Typography variant="body2" color="text.secondary">
                                            No permissions available to deny (user has no inherited or granted permissions).
                                        </Typography>
                                    </Grid>
                                ) : (
                                    deniablePermissions.map(p => (
                                        <Grid key={p.id} size={{ xs: 12, sm: 6, md: 4 }}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        size="small"
                                                        color="error"
                                                        checked={selectedDenials.includes(p.name)}
                                                        onChange={() => handleDenialToggle(p.name)}
                                                    />
                                                }
                                                label={
                                                    <Typography variant="body2" sx={{ color: selectedDenials.includes(p.name) ? '#d32f2f' : 'text.primary' }}>
                                                        {p.name}
                                                    </Typography>
                                                }
                                            />
                                        </Grid>
                                    ))
                                )}
                            </Grid>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                            <Button
                                variant="contained"
                                startIcon={<SaveIcon />}
                                onClick={handleSave}
                                disabled={isSaving}
                            >
                                {isSaving ? 'Saving...' : 'Save Permissions'}
                            </Button>
                        </Box>
                    </Stack>
                </Paper>
            </Stack>

            <Toast
                open={toast.open}
                message={toast.message}
                severity={toast.severity}
                onClose={() => setToast(prev => ({ ...prev, open: false }))}
            />
        </Box>
    );
}