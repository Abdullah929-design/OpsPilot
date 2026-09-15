"use client";

import React, { useState } from "react";
import AuthenticatedLayout from "@/layouts/AuthenticatedLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEmployees, useDeleteEmployee } from "@/hooks/useEmployees";
import { departmentService } from "@/services/departmentService";
import { designationService } from "@/services/designationService";
import EmployeesTable from "@/components/employees/EmployeesTable";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import Toast from "@/components/common/Toast";
import DeleteEmployeeDialog from "@/components/employees/DeleteEmployeeDialog";
import {
    Typography,
    Box,
    Paper,
    Button,
    TextField,
    MenuItem,
    Pagination,
    Stack,
    CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { EmployeeData } from "@/services/employeeService";

export default function EmployeesPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [departmentId, setDepartmentId] = useState("");
    const [designationId, setDesignationId] = useState("");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState<EmployeeData | null>(null);

    const [toastMessage, setToastMessage] = useState("");
    const [toastSeverity, setToastSeverity] = useState<"success" | "error">("success");
    const [deleteErrorMsg, setDeleteErrorMsg] = useState<string | null>(null);


    // Fetch Employees
    const { data, isLoading } = useQuery({
        queryKey: ["employees", { search, department_id: departmentId, designation_id: designationId, status, page }],
        queryFn: () => employeeService.getEmployees({
            search,
            department_id: departmentId,
            designation_id: designationId,
            status,
            page,
            per_page: 15,
        }),
    });

    // Fetch Departments for filter
    const { data: depts } = useQuery({
        queryKey: ["departments"],
        queryFn: () => departmentService.getDepartments({ per_page: 100 }),
    });

    // Fetch Designations for filter
    const { data: desgs } = useQuery({
        queryKey: ["designations"],
        queryFn: () => designationService.getDesignations({ per_page: 100 }),
    });

    // Delete Mutation
    const deleteMutation = useDeleteEmployee();

    const handleDeleteClick = (employee: EmployeeData) => {
        setEmployeeToDelete(employee);
        setDeleteErrorMsg(null); // Clear old error
        setDeleteDialogOpen(true);
    };


    const handleConfirmDelete = () => {
        if (!employeeToDelete) return;

        deleteMutation.mutate(employeeToDelete.id, {
            onSuccess: () => {
                setToastSeverity("success");
                setToastMessage("Employee deleted successfully.");
                setDeleteDialogOpen(false);
            },
            onError: (err: any) => {
                setDeleteErrorMsg(err?.response?.data?.message || "Failed to delete employee.");
            },
        });
    };


    return (
        <AuthenticatedLayout>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                        Employees
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage company directory records, employment statuses, and org details.
                    </Typography>
                </Box>
                {/* Stub action: add page routing in step 7 */}
                <Button variant="contained" startIcon={<AddIcon />} href="/employees/create">
                    Add Employee
                </Button>
            </Box>

            {/* Filters */}
            <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <TextField
                        fullWidth
                        size="small"
                        label="Search Employees"
                        placeholder="Search by name, email, phone or code..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                    />
                    <TextField
                        select
                        size="small"
                        label="Department"
                        value={departmentId}
                        onChange={(e) => {
                            setDepartmentId(e.target.value);
                            setPage(1);
                        }}
                        sx={{ minWidth: 180 }}
                    >
                        <MenuItem value="">All Departments</MenuItem>
                        {depts?.data?.map((dept: any) => (
                            <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        select
                        size="small"
                        label="Designation"
                        value={designationId}
                        onChange={(e) => {
                            setDesignationId(e.target.value);
                            setPage(1);
                        }}
                        sx={{ minWidth: 180 }}
                    >
                        <MenuItem value="">All Designations</MenuItem>
                        {desgs?.data?.map((desg: any) => (
                            <MenuItem key={desg.id} value={desg.id}>{desg.title}</MenuItem>
                        ))}
                    </TextField>
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
                        <MenuItem value="terminated">Terminated</MenuItem>
                    </TextField>
                </Stack>
            </Paper>

            {/* Employee Table */}
            {isLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Stack spacing={2}>
                    <EmployeesTable
                        employees={data?.data?.items || []}
                        onEdit={(emp) => window.location.href = `/employees/${emp.id}/edit`}
                        onDelete={handleDeleteClick}
                    />

                    {data?.data?.pagination?.last_page > 1 && (
                        <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2 }}>
                            <Pagination
                                count={data.data.pagination.last_page}
                                page={page}
                                onChange={(e, p) => setPage(p)}
                                color="primary"
                            />
                        </Box>
                    )}
                </Stack>
            )}

            {/* Delete Confirmation */}
            <DeleteEmployeeDialog
                open={deleteDialogOpen}
                employeeName={employeeToDelete ? `${employeeToDelete.first_name} ${employeeToDelete.last_name}` : ""}
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeleteDialogOpen(false)}
                isPending={deleteMutation.isPending}
                errorMsg={deleteErrorMsg}
            />


            <Toast
                open={!!toastMessage}
                message={toastMessage}
                severity={toastSeverity}
                onClose={() => setToastMessage("")}
            />
        </AuthenticatedLayout>
    );
}

// Temporary inline import of employeeService inside page
import { employeeService } from "@/services/employeeService";
