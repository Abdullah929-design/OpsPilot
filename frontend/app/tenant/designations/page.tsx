"use client";

import React, { useState } from "react";
import AuthenticatedLayout from "@/layouts/AuthenticatedLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { designationService, DesignationData } from "@/services/designationService";
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
    FormControlLabel,
    Checkbox,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function DesignationsPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedDesignation, setSelectedDesignation] = useState<DesignationData | null>(null);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [designationToDelete, setDesignationToDelete] = useState<DesignationData | null>(null);

    // 1. Fetch designations
    const { data, isLoading } = useQuery({
        queryKey: ["designations", { search, status, page }],
        queryFn: () => designationService.getDesignations({ search, status, page, per_page: 10 }),
    });

    // 2. Add / Edit Designation Mutation
    const saveMutation = useMutation({
        mutationFn: (values: Partial<DesignationData>) => {
            if (selectedDesignation) {
                return designationService.updateDesignation(selectedDesignation.id, values);
            }
            return designationService.createDesignation(values);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["designations"] });
            setDialogOpen(false);
            setSelectedDesignation(null);
        },
    });

    // 3. Delete Designation Mutation
    const deleteMutation = useMutation({
        mutationFn: (id: number) => designationService.deleteDesignation(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["designations"] });
            setDeleteDialogOpen(false);
            setDesignationToDelete(null);
        },
    });

    const formik = useFormik({
        initialValues: {
            title: selectedDesignation?.title || "",
            status: selectedDesignation?.status || "active",
            is_manager: selectedDesignation?.is_manager || false,
        },
        enableReinitialize: true,
        validationSchema: Yup.object({
            title: Yup.string().required("Designation title is required"),
            status: Yup.string().oneOf(["active", "inactive"]),
            is_manager: Yup.boolean(),
        }),
        onSubmit: (values) => {
            saveMutation.mutate(values);
        },
    });


    const handleOpenCreate = () => {
        setSelectedDesignation(null);
        formik.resetForm();
        setDialogOpen(true);
    };

    const handleOpenEdit = (desg: DesignationData) => {
        setSelectedDesignation(desg);
        setDialogOpen(true);
    };

    const handleOpenDelete = (desg: DesignationData) => {
        setDesignationToDelete(desg);
        setDeleteDialogOpen(true);
    };

    return (
        <AuthenticatedLayout>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                        Designations
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage company job titles and operational roles.
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
                    Add Designation
                </Button>
            </Box>

            {/* Filters & Search */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <TextField
                        fullWidth
                        size="small"
                        label="Search Designations"
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

            {/* Designations Table */}
            {isLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Manager Role</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 600, textAlign: "right" }}>Actions</TableCell>
                            </TableRow>

                        </TableHead>
                        <TableBody>
                            {data?.data?.map((desg: DesignationData) => (
                                <TableRow key={desg.id} hover>
                                    <TableCell sx={{ fontWeight: 600 }}>
                                        {desg.title} {desg.is_system && <Chip label="System" size="small" variant="outlined" color="primary" sx={{ ml: 1 }} />}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={desg.is_manager ? "Yes" : "No"}
                                            color={desg.is_manager ? "primary" : "default"}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={desg.status}
                                            color={desg.status === "active" ? "success" : "default"}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell sx={{ textAlign: "right" }}>
                                        <IconButton color="primary" onClick={() => handleOpenEdit(desg)}>
                                            <EditIcon />
                                        </IconButton>
                                        {!desg.is_system && (
                                            <IconButton color="error" onClick={() => handleOpenDelete(desg)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        )}
                                    </TableCell>
                                </TableRow>

                            ))}
                            {!data?.data?.length && (
                                <TableRow>
                                    <TableCell colSpan={3} sx={{ textAlign: "center", py: 4 }}>
                                        No designations found.
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
                    {selectedDesignation ? "Edit Designation" : "Add Designation"}
                </DialogTitle>
                <form onSubmit={formik.handleSubmit}>
                    <DialogContent>
                        <Stack spacing={3}>
                            <TextField
                                fullWidth
                                id="title"
                                name="title"
                                label="Designation Title"
                                value={formik.values.title}
                                onChange={formik.handleChange}
                                error={formik.touched.title && Boolean(formik.errors.title)}
                                helperText={formik.touched.title && formik.errors.title}
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
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        id="is_manager"
                                        name="is_manager"
                                        checked={formik.values.is_manager}
                                        onChange={formik.handleChange}
                                        disabled={selectedDesignation?.is_system}
                                    />
                                }
                                label="Manager Designation (Employees holding this designation can be assigned as reporting managers)"
                            />
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
                <DialogTitle sx={{ fontWeight: 700 }}>Delete Designation</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete the designation <strong>{designationToDelete?.title}</strong>? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined">
                        Cancel
                    </Button>
                    <Button
                        color="error"
                        variant="contained"
                        onClick={() => designationToDelete && deleteMutation.mutate(designationToDelete.id)}
                        disabled={deleteMutation.isPending}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </AuthenticatedLayout>
    );
}
