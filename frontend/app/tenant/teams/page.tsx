"use client";

import React, { useState, useEffect } from "react";
import AuthenticatedLayout from "@/layouts/AuthenticatedLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teamService, TeamData } from "@/services/teamService";
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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Stack,
    Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function TeamsPage() {
    const queryClient = useQueryClient();
    const [selectedDeptId, setSelectedDeptId] = useState<number | "">("");
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");

    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<TeamData | null>(null);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [teamToDelete, setTeamToDelete] = useState<TeamData | null>(null);

    // 1. Fetch Departments (to populate the filter dropdown and form select)
    const { data: departmentsResponse, isLoading: loadingDepts } = useQuery({
        queryKey: ["departments-list"],
        queryFn: () => departmentService.getDepartments({ per_page: 100 }),
    });

    const departments: DepartmentData[] = departmentsResponse?.data || [];

    // Automatically select the first department if none is selected
    useEffect(() => {
        if (departments.length > 0 && selectedDeptId === "") {
            setSelectedDeptId(departments[0].id);
        }
    }, [departments, selectedDeptId]);

    // 2. Fetch Teams for selected department
    const { data: teams = [], isLoading: loadingTeams } = useQuery({
        queryKey: ["teams", selectedDeptId, { search, status }],
        queryFn: () => teamService.getTeams(selectedDeptId as number, { search, status }),
        enabled: selectedDeptId !== "",
    });

    // 3. Add / Edit Team Mutation
    const saveMutation = useMutation({
        mutationFn: (values: Partial<TeamData>) => {
            if (selectedTeam) {
                return teamService.updateTeam(selectedTeam.id, values);
            }
            return teamService.createTeam(selectedDeptId as number, values);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["teams"] });
            setDialogOpen(false);
            setSelectedTeam(null);
        },
    });

    // 4. Delete Team Mutation
    const deleteMutation = useMutation({
        mutationFn: (id: number) => teamService.deleteTeam(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["teams"] });
            setDeleteDialogOpen(false);
            setTeamToDelete(null);
        },
    });

    const formik = useFormik({
        initialValues: {
            name: selectedTeam?.name || "",
            description: selectedTeam?.description || "",
            status: selectedTeam?.status || "active",
        },
        enableReinitialize: true,
        validationSchema: Yup.object({
            name: Yup.string().required("Team name is required"),
            status: Yup.string().oneOf(["active", "inactive"]),
        }),
        onSubmit: (values) => {
            saveMutation.mutate(values);
        },
    });

    const handleOpenCreate = () => {
        setSelectedTeam(null);
        formik.resetForm();
        setDialogOpen(true);
    };

    const handleOpenEdit = (team: TeamData) => {
        setSelectedTeam(team);
        setDialogOpen(true);
    };

    const handleOpenDelete = (team: TeamData) => {
        setTeamToDelete(team);
        setDeleteDialogOpen(true);
    };

    return (
        <AuthenticatedLayout>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                        Teams
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage operational teams grouped under departments.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreate}
                    disabled={selectedDeptId === ""}
                >
                    Add Team
                </Button>
            </Box>

            {/* Filters & Search */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <TextField
                        select
                        size="small"
                        label="Department Scope"
                        value={selectedDeptId}
                        onChange={(e) => setSelectedDeptId(Number(e.target.value))}
                        sx={{ minWidth: 220 }}
                        disabled={loadingDepts}
                    >
                        {departments.map((dept) => (
                            <MenuItem key={dept.id} value={dept.id}>
                                {dept.name}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        fullWidth
                        size="small"
                        label="Search Teams"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <TextField
                        select
                        size="small"
                        label="Status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        sx={{ minWidth: 150 }}
                    >
                        <MenuItem value="">All Statuses</MenuItem>
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                    </TextField>
                </Stack>
            </Paper>

            {/* Teams Table */}
            {loadingTeams || loadingDepts ? (
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
                                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 600, textAlign: "right" }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {teams.map((team: TeamData) => (
                                <TableRow key={team.id} hover>
                                    <TableCell sx={{ fontWeight: 600 }}>{team.name}</TableCell>
                                    <TableCell>{team.description || "-"}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={team.status}
                                            color={team.status === "active" ? "success" : "default"}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell sx={{ textAlign: "right" }}>
                                        <IconButton color="primary" onClick={() => handleOpenEdit(team)}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton color="error" onClick={() => handleOpenDelete(team)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {teams.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} sx={{ textAlign: "center", py: 4 }}>
                                        No teams found for the selected department.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Add / Edit Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>
                    {selectedTeam ? "Edit Team" : "Add Team"}
                </DialogTitle>
                <form onSubmit={formik.handleSubmit}>
                    <DialogContent>
                        <Stack spacing={3}>
                            <TextField
                                fullWidth
                                id="name"
                                name="name"
                                label="Team Name"
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
                <DialogTitle sx={{ fontWeight: 700 }}>Delete Team</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete the team <strong>{teamToDelete?.name}</strong>? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined">
                        Cancel
                    </Button>
                    <Button
                        color="error"
                        variant="contained"
                        onClick={() => teamToDelete && deleteMutation.mutate(teamToDelete.id)}
                        disabled={deleteMutation.isPending}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </AuthenticatedLayout>
    );
}
