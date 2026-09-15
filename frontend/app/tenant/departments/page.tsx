"use client";

import React, { useState } from "react";
import AuthenticatedLayout from "@/layouts/AuthenticatedLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { departmentService, DepartmentData } from "@/services/departmentService";
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

export default function DepartmentsPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedDept, setSelectedDept] = useState<DepartmentData | null>(null);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deptToDelete, setDeptToDelete] = useState<DepartmentData | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    // 1. Fetch departments
    const { data, isLoading } = useQuery({
        queryKey: ["departments", { search, status, page }],
        queryFn: () => departmentService.getDepartments({ search, status, page, per_page: 10 }),
    });

    // 2. Add / Edit Department Mutation
    const saveMutation = useMutation({
        mutationFn: (values: Partial<DepartmentData>) => {
            if (selectedDept) {
                return departmentService.updateDepartment(selectedDept.id, values);
            }
            return departmentService.createDepartment(values);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["departments"] });
            setDialogOpen(false);
            setSelectedDept(null);
        },
    });

    // 3. Delete Department Mutation
    const deleteMutation = useMutation({
        mutationFn: (id: number) => departmentService.deleteDepartment(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["departments"] });
            setDeleteDialogOpen(false);
            setDeptToDelete(null);
            setDeleteError(null);
        },
        onError: (err: any) => {
            // Extract the 422 message from backend response
            const errorMessage =
                err.response?.data?.message || "Failed to delete department.";
            setDeleteError(errorMessage);
        },
    });

    const formik = useFormik({
        initialValues: {
            name: selectedDept?.name || "",
            description: selectedDept?.description || "",
            status: selectedDept?.status || "active",
        },
        enableReinitialize: true,
        validationSchema: Yup.object({
            name: Yup.string().required("Department name is required"),
            status: Yup.string().oneOf(["active", "inactive"]),
        }),
        onSubmit: (values) => {
            saveMutation.mutate(values);
        },
    });

    const handleOpenCreate = () => {
        setSelectedDept(null);
        formik.resetForm();
        setDialogOpen(true);
    };

    const handleOpenEdit = (dept: DepartmentData) => {
        setSelectedDept(dept);
        setDialogOpen(true);
    };

    const handleOpenDelete = (dept: DepartmentData) => {
        setDeptToDelete(dept);
        setDeleteError(null);
        setDeleteDialogOpen(true);
    };

    return (
        <AuthenticatedLayout>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                        Departments
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage your company departments and track associated teams.
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
                    Add Department
                </Button>
            </Box>

            {/* Filters & Search */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <TextField
                        fullWidth
                        size="small"
                        label="Search Departments"
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

            {/* Departments Table */}
            {isLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Teams Count</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 600, textAlign: "right" }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data?.data?.map((dept: DepartmentData) => (
                                <TableRow key={dept.id} hover>
                                    <TableCell sx={{ fontWeight: 600 }}>{dept.name}</TableCell>
                                    <TableCell>{dept.description || "-"}</TableCell>
                                    <TableCell>{dept.teams_count || 0}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={dept.status}
                                            color={dept.status === "active" ? "success" : "default"}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell sx={{ textAlign: "right" }}>
                                        <IconButton color="primary" onClick={() => handleOpenEdit(dept)}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton color="error" onClick={() => handleOpenDelete(dept)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!data?.data?.length && (
                                <TableRow>
                                    <TableCell colSpan={5} sx={{ textAlign: "center", py: 4 }}>
                                        No departments found.
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
                    {selectedDept ? "Edit Department" : "Add Department"}
                </DialogTitle>
                <form onSubmit={formik.handleSubmit}>
                    <DialogContent>
                        <Stack spacing={3}>
                            <TextField
                                fullWidth
                                id="name"
                                name="name"
                                label="Department Name"
                                value={formik.values.name}
                                onChange={formik.handleChange}
                                error={formik.touched.name && Boolean(formik.errors.name)}
                                helperText={formik.touched.name && formik.errors.name}
                            />
                            <TextField
                                fullWidth
                                id="description"
                                name="description"
                                label="Description"
                                multiline
                                rows={3}
                                value={formik.values.description}
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
                <DialogTitle sx={{ fontWeight: 700 }}>Delete Department</DialogTitle>
                <DialogContent>
                    {deleteError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {deleteError}
                        </Alert>
                    )}
                    <Typography>
                        Are you sure you want to delete the department <strong>{deptToDelete?.name}</strong>? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined">
                        Cancel
                    </Button>
                    <Button
                        color="error"
                        variant="contained"
                        onClick={() => deptToDelete && deleteMutation.mutate(deptToDelete.id)}
                        disabled={deleteMutation.isPending}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </AuthenticatedLayout>
    );
}
