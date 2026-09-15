"use client";

import React, { useState } from "react";
import AuthenticatedLayout from "@/layouts/AuthenticatedLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { officeService, OfficeData } from "@/services/officeService";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
    Typography,
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    IconButton,
    TextField,
    MenuItem,
    Pagination,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Stack,
    Chip,
    Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function OfficesPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedOffice, setSelectedOffice] = useState<OfficeData | null>(null);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [officeToDelete, setOfficeToDelete] = useState<OfficeData | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    // 1. Fetch office locations
    const { data, isLoading } = useQuery({
        queryKey: ["offices", { search, status, page }],
        queryFn: () => officeService.getOffices({ search, status, page, per_page: 10 }),
    });

    // 2. Add / Edit Office Mutation
    const saveMutation = useMutation({
        mutationFn: (values: Partial<OfficeData>) => {
            if (selectedOffice) {
                return officeService.updateOffice(selectedOffice.id, values);
            }
            return officeService.createOffice(values);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["offices"] });
            setDialogOpen(false);
            setSelectedOffice(null);
        },
    });

    // 3. Delete Office Mutation
    const deleteMutation = useMutation({
        mutationFn: (id: number) => officeService.deleteOffice(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["offices"] });
            setDeleteDialogOpen(false);
            setOfficeToDelete(null);
            setDeleteError(null);
        },
        onError: (err: any) => {
            const errorMessage =
                err.response?.data?.message || "Failed to delete office location.";
            setDeleteError(errorMessage);
        },
    });

    const formik = useFormik({
        initialValues: {
            name: selectedOffice?.name || "",
            country: selectedOffice?.country || "",
            city: selectedOffice?.city || "",
            address: selectedOffice?.address || "",
            timezone: selectedOffice?.timezone || "UTC",
            status: selectedOffice?.status || "active",
        },
        enableReinitialize: true,
        validationSchema: Yup.object({
            name: Yup.string().required("Location name is required"),
            country: Yup.string().required("Country is required"),
            city: Yup.string().required("City is required"),
            status: Yup.string().oneOf(["active", "inactive"]),
        }),
        onSubmit: (values) => {
            saveMutation.mutate(values);
        },
    });

    const handleOpenCreate = () => {
        setSelectedOffice(null);
        formik.resetForm();
        setDialogOpen(true);
    };

    const handleOpenEdit = (office: OfficeData) => {
        setSelectedOffice(office);
        setDialogOpen(true);
    };

    const handleOpenDelete = (office: OfficeData) => {
        setOfficeToDelete(office);
        setDeleteError(null);
        setDeleteDialogOpen(true);
    };

    return (
        <AuthenticatedLayout>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                        Office Locations
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage your company office branches and regional locations.
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
                    Add Office
                </Button>
            </Box>

            {/* Filters & Search */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <TextField
                        fullWidth
                        size="small"
                        label="Search Offices (Name, Country, City)"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                    />
                    <TextField
                        select
                        size="small"
                        label="Status"
                        value={status}
                        onChange={(e) => {
                            setStatus(e.target.value);
                            setPage(1);
                        }}
                        sx={{ minWidth: 150 }}
                    >
                        <MenuItem value="">All Statuses</MenuItem>
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                    </TextField>
                </Stack>
            </Paper>

            {/* Offices Table */}
            {isLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Location Name</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>City / Country</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Street Address</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Timezone</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 600, textAlign: "right" }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data?.data?.map((office: OfficeData) => (
                                <TableRow key={office.id} hover>
                                    <TableCell sx={{ fontWeight: 600 }}>{office.name}</TableCell>
                                    <TableCell>{`${office.city}, ${office.country}`}</TableCell>
                                    <TableCell>{office.address || "-"}</TableCell>
                                    <TableCell>{office.timezone}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={office.status}
                                            color={office.status === "active" ? "success" : "default"}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell sx={{ textAlign: "right" }}>
                                        <IconButton color="primary" onClick={() => handleOpenEdit(office)}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton color="error" onClick={() => handleOpenDelete(office)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!data?.data?.length && (
                                <TableRow>
                                    <TableCell colSpan={6} sx={{ textAlign: "center", py: 4 }}>
                                        No offices found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    {data?.meta?.last_page > 1 && (
                        <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2 }}>
                            <Pagination
                                count={data.meta.last_page}
                                page={page}
                                onChange={(e, p) => setPage(p)}
                                color="primary"
                            />
                        </Box>
                    )}
                </TableContainer>
            )}

            {/* Add / Edit Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>
                    {selectedOffice ? "Edit Office" : "Add Office"}
                </DialogTitle>
                <form onSubmit={formik.handleSubmit}>
                    <DialogContent>
                        <Stack spacing={3}>
                            <TextField
                                fullWidth
                                id="name"
                                name="name"
                                label="Location Name"
                                value={formik.values.name}
                                onChange={formik.handleChange}
                                error={formik.touched.name && Boolean(formik.errors.name)}
                                helperText={formik.touched.name && formik.errors.name}
                            />
                            <Stack direction="row" spacing={2}>
                                <TextField
                                    fullWidth
                                    id="city"
                                    name="city"
                                    label="City"
                                    value={formik.values.city}
                                    onChange={formik.handleChange}
                                    error={formik.touched.city && Boolean(formik.errors.city)}
                                    helperText={formik.touched.city && formik.errors.city}
                                />
                                <TextField
                                    fullWidth
                                    id="country"
                                    name="country"
                                    label="Country"
                                    value={formik.values.country}
                                    onChange={formik.handleChange}
                                    error={formik.touched.country && Boolean(formik.errors.country)}
                                    helperText={formik.touched.country && formik.errors.country}
                                />
                            </Stack>
                            <TextField
                                fullWidth
                                id="address"
                                name="address"
                                label="Street Address"
                                value={formik.values.address}
                                onChange={formik.handleChange}
                            />
                            <TextField
                                fullWidth
                                id="timezone"
                                name="timezone"
                                label="Timezone"
                                value={formik.values.timezone}
                                onChange={formik.handleChange}
                            />
                            <TextField
                                select
                                fullWidth
                                id="status"
                                name="status"
                                label="Status"
                                value={formik.values.status}
                                onChange={formik.handleChange}
                            >
                                <MenuItem value="active">Active</MenuItem>
                                <MenuItem value="inactive">Inactive</MenuItem>
                            </TextField>
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button onClick={() => setDialogOpen(false)} variant="outlined">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={saveMutation.isPending}
                        >
                            Save
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle sx={{ fontWeight: 700 }}>Delete Office</DialogTitle>
                <DialogContent>
                    {deleteError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {deleteError}
                        </Alert>
                    )}
                    <Typography>
                        Are you sure you want to delete the office <strong>{officeToDelete?.name}</strong>? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined">
                        Cancel
                    </Button>
                    <Button
                        color="error"
                        variant="contained"
                        onClick={() => officeToDelete && deleteMutation.mutate(officeToDelete.id)}
                        disabled={deleteMutation.isPending}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </AuthenticatedLayout>
    );
}
