'use client';

import React from 'react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { useParams } from 'next/navigation';
import { useWorkflowLogs, useWorkflows } from '@/hooks/useWorkflows';
import NextLink from 'next/link';
import {
    Box,
    Paper,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    CircularProgress,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function WorkflowLogsPage() {
    const params = useParams();
    const workflowId = params.id ? parseInt(params.id as string, 10) : 0;

    const { data: workflowsData } = useWorkflows();
    const { data: logsData, isLoading, error } = useWorkflowLogs(workflowId);

    const currentWorkflow = workflowsData?.data?.find((w: any) => w.id === workflowId);

    return (
        <AuthenticatedLayout>
            <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {/* Header Navigation */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Button
                            size="small"
                            component={NextLink}
                            href="/tenant/workflows"
                            startIcon={<ArrowBackIcon />}
                            sx={{ textTransform: 'none', mb: 1 }}
                        >
                            Back to Workflows
                        </Button>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                            Execution Logs: {currentWorkflow?.name || `Workflow #${workflowId}`}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Audit trail of events evaluated by this automation.
                        </Typography>
                    </Box>
                </Box>

                {/* Logs Listing */}
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Paper sx={{ p: 4, bgcolor: 'error.light', color: 'error.contrastText' }}>
                        Failed to load execution logs.
                    </Paper>
                ) : !logsData || logsData.data?.length === 0 ? (
                    <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 3, border: '1px dashed', borderColor: 'divider' }}>
                        <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
                            No History Logged
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            This workflow has not triggered or evaluated any data events yet.
                        </Typography>
                    </Paper>
                ) : (
                    <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                        <Table>
                            <TableHead sx={{ bgcolor: 'grey.50' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600 }}>Timestamp</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Evaluation Status</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Execution Details</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {logsData.data.map((log: any) => (
                                    <TableRow key={log.id} hover>
                                        <TableCell sx={{ whiteSpace: 'nowrap', verticalAlign: 'top', py: 2.5 }}>
                                            {new Date(log.created_at).toLocaleString()}
                                        </TableCell>
                                        <TableCell sx={{ verticalAlign: 'top', py: 2.5 }}>
                                            {log.status === 'success' && (
                                                <Chip label="Actions Run" color="success" size="small" />
                                            )}
                                            {log.status === 'condition_not_met' && (
                                                <Chip label="Skipped (Filtered)" color="default" size="small" />
                                            )}
                                            {log.status === 'failed' && (
                                                <Chip label="Execution Failed" color="error" size="small" />
                                            )}
                                        </TableCell>
                                        <TableCell sx={{ py: 2.5 }}>
                                            {log.status === 'failed' && log.error_message && (
                                                <Typography color="error" variant="body2" sx={{ fontWeight: 600, mb: 2 }}>
                                                    Error: {log.error_message}
                                                </Typography>
                                            )}
                                            {log.context && (
                                                <Accordion sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider', '&:before': { display: 'none' } }}>
                                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                                                            View Payload Snapshot
                                                        </Typography>
                                                    </AccordionSummary>
                                                    <AccordionDetails sx={{ bgcolor: 'grey.50', p: 1.5 }}>
                                                        <pre style={{ margin: 0, fontSize: 11, overflowX: 'auto', fontFamily: 'monospace' }}>
                                                            {JSON.stringify(log.context, null, 2)}
                                                        </pre>
                                                    </AccordionDetails>
                                                </Accordion>
                                            )}
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
