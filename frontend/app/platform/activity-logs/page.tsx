"use client";

import { useState } from "react";
import PlatformRouteGuard from "@/components/layout/PlatformRouteGuard";
import { usePlatformActivityLogs } from "@/hooks/usePlatformActivityLogs";
import { usePlatformCompanies } from "@/hooks/usePlatformCompanies";
import { usePlatformUsers } from "@/hooks/usePlatformUsers";
import {
    Container, Paper, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, TextField, Stack, Box, CircularProgress, Select, MenuItem,
    InputLabel, FormControl, Pagination
} from "@mui/material";
import PlatformLayout from "@/layouts/PlatformLayout";

const renderLogProperties = (properties: any) => {
    if (!properties || typeof properties !== 'object' || Object.keys(properties).length === 0) {
        return "-";
    }

    return (
        <Stack spacing={0.5}>
            {Object.entries(properties).map(([key, val]) => {
                const displayVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
                const formattedKey = key
                    .split('_')
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');

                return (
                    <Box key={key} sx={{ display: 'flex', gap: 1, fontSize: '0.8rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600, color: '#4b5563' }}>{formattedKey}:</span>
                        <span style={{ color: '#1f2937' }}>{displayVal}</span>
                    </Box>
                );
            })}
        </Stack>
    );
};


function ActivityLogsContent() {
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({
        causer_id: "",
        company_id: "",
        event: "",
        date: "",
    });

    const { logs, pagination, isLoading } = usePlatformActivityLogs(filters, page);
    const { companies } = usePlatformCompanies();
    const { users } = usePlatformUsers();

    const handleFilterChange = (key: string, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setPage(1); // Reset page on filter change
    };

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <Paper sx={{ p: 4, borderRadius: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
                    Platform Audit Logs
                </Typography>

                {/* Filters Panel */}
                <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 4 }}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Operator (Manager/Admin)</InputLabel>
                        <Select
                            value={filters.causer_id}
                            label="Operator (Manager/Admin)"
                            onChange={(e) => handleFilterChange("causer_id", e.target.value)}
                        >
                            <MenuItem value=""><em>All Operators</em></MenuItem>
                            {users.map((u) => (
                                <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth size="small">
                        <InputLabel>Target Company</InputLabel>
                        <Select
                            value={filters.company_id}
                            label="Target Company"
                            onChange={(e) => handleFilterChange("company_id", e.target.value)}
                        >
                            <MenuItem value=""><em>All Companies</em></MenuItem>
                            {companies.map((c) => (
                                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        fullWidth
                        size="small"
                        label="Event Type (e.g. suspended)"
                        value={filters.event}
                        onChange={(e) => handleFilterChange("event", e.target.value)}
                    />

                    <TextField
                        fullWidth
                        size="small"
                        type="date"
                        slotProps={{ inputLabel: { shrink: true } }}
                        label="Log Date"
                        value={filters.date}
                        onChange={(e) => handleFilterChange("date", e.target.value)}
                    />
                </Stack>

                {/* Logs Table */}
                {isLoading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                            <Table>
                                <TableHead sx={{ bgcolor: "grey.50" }}>
                                    <TableRow>
                                        <TableCell>Timestamp</TableCell>
                                        <TableCell>Operator</TableCell>
                                        <TableCell>Action / Event</TableCell>
                                        <TableCell>Target Subject</TableCell>
                                        <TableCell>Details</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {logs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" sx={{ py: 4, color: "text.secondary" }}>
                                                No platform audit logs found matching criteria.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        logs.map((log) => (
                                            <TableRow key={log.id}>
                                                <TableCell sx={{ whiteSpace: "nowrap" }}>
                                                    {new Date(log.created_at).toLocaleString()}
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 600 }}>
                                                    {log.causer?.name || "System"}
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontFamily: "monospace", bgcolor: "grey.100", px: 1, py: 0.5, borderRadius: 1, display: "inline-block" }}>
                                                        {log.description}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    {log.subject?.name || `ID: ${log.subject_id}`}
                                                </TableCell>
                                                <TableCell sx={{ fontSize: "0.8rem" }}>
                                                    {renderLogProperties(log.properties)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Pagination Controls */}
                        {pagination.lastPage > 1 && (
                            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                                <Pagination
                                    count={pagination.lastPage}
                                    page={page}
                                    onChange={(_, value) => setPage(value)}
                                    color="primary"
                                />
                            </Box>
                        )}
                    </>
                )}
            </Paper>
        </Container>
    );
}

export default function PlatformActivityLogsPage() {
    return (
        <PlatformLayout>
            <ActivityLogsContent />
        </PlatformLayout>
    );
}
