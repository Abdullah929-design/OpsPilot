'use client';

import React from 'react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { useWorkflows, useActivateWorkflow, useDeleteWorkflow } from '@/hooks/useWorkflows';
import NextLink from 'next/link';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Switch,
    IconButton,
    Button,
    Chip,
    Typography,
    Box,
    CircularProgress,
    Stack
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import HistoryIcon from '@mui/icons-material/History';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

export default function WorkflowsPage() {
    const { data: workflowsData, isLoading, error } = useWorkflows();
    const activateMutation = useActivateWorkflow();
    const deleteMutation = useDeleteWorkflow();

    const handleToggleActive = (id: number, currentStatus: boolean) => {
        activateMutation.mutate({ id, activate: !currentStatus });
    };

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Are you sure you want to delete workflow "${name}"?`)) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <AuthenticatedLayout>
            <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 700 }}>
                            Workflow Automation
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Trigger automated actions when company data events occur.
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        component={NextLink}
                        href="/tenant/workflows/builder"
                        startIcon={<AutoAwesomeIcon />}
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                        Create Workflow
                    </Button>
                </Box>

                {/* Table Section */}
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Paper sx={{ p: 4, bgcolor: 'error.light', color: 'error.contrastText' }}>
                        Failed to load workflows. Please try again later.
                    </Paper>
                ) : !workflowsData || workflowsData.data?.length === 0 ? (
                    <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 3, border: '1px dashed', borderColor: 'divider' }}>
                        <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
                            No Workflows Found
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Get started by creating your first automatic trigger-condition-action workflow.
                        </Typography>
                        <Button
                            variant="outlined"
                            component={NextLink}
                            href="/tenant/workflows/builder"
                            startIcon={<AutoAwesomeIcon />}
                            sx={{ textTransform: 'none', fontWeight: 600 }}
                        >
                            Create Workflow
                        </Button>
                    </Paper>
                ) : (
                    <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                        <Table>
                            <TableHead sx={{ bgcolor: 'grey.50' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Trigger Event</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Conditions</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {workflowsData.data.map((wf: any) => (
                                    <TableRow key={wf.id} hover>
                                        <TableCell>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                {wf.name}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={wf.trigger_type}
                                                size="small"
                                                color="secondary"
                                                variant="outlined"
                                                sx={{ fontFamily: 'monospace', fontWeight: 600 }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {wf.conditions?.length || 0} condition(s)
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={0.5}>
                                                {wf.actions?.map((act: any) => (
                                                    <Chip
                                                        key={act.id}
                                                        label={act.action_type}
                                                        size="small"
                                                        variant="filled"
                                                        sx={{ fontSize: 10, height: 20 }}
                                                    />
                                                ))}
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Switch
                                                checked={wf.is_active}
                                                onChange={() => handleToggleActive(wf.id, wf.is_active)}
                                                color="primary"
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                size="small"
                                                component={NextLink}
                                                href={`/tenant/workflows/builder?id=${wf.id}`}
                                                title="Edit Workflow"
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                component={NextLink}
                                                href={`/tenant/workflows/${wf.id}/logs`}
                                                title="Execution Logs"
                                            >
                                                <HistoryIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => handleDelete(wf.id, wf.name)}
                                                title="Delete Workflow"
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>
        </AuthenticatedLayout>
    );
}
