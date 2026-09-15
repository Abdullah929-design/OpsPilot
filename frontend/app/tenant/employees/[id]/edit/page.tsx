"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import AuthenticatedLayout from "@/layouts/AuthenticatedLayout";
import EmployeeForm from "@/components/employees/EmployeeForm";
import { useUpdateEmployee } from "@/hooks/useEmployees";
import { useQuery } from "@tanstack/react-query";
import { employeeService } from "@/services/employeeService";
import { Typography, Box, CircularProgress, Alert } from "@mui/material";

export default function EditEmployeePage() {
    const params = useParams();
    const employeeId = Number(params.id);

    const updateMutation = useUpdateEmployee();
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Fetch Employee Details
    const { data: employee, isLoading, isError } = useQuery({
        queryKey: ["employee", employeeId],
        queryFn: () => employeeService.getEmployees({}).then(() =>
            // In Next.js/axios context, let's hit get api directly or fetch list matching ID
            apiClient.get(`/v1/employees/${employeeId}`).then(res => res.data.data)
        ),
    });

    const handleSubmit = (values: any) => {
        updateMutation.mutate(
            { id: employeeId, data: values },
            {
                onSuccess: () => {
                    window.location.href = "/employees";
                },
                onError: (err: any) => {
                    setErrorMsg(err?.response?.data?.message || "Failed to update employee record.");
                },
            }
        );
    };

    if (isLoading) {
        return (
            <AuthenticatedLayout>
                <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
                    <CircularProgress />
                </Box>
            </AuthenticatedLayout>
        );
    }

    if (isError || !employee) {
        return (
            <AuthenticatedLayout>
                <Alert severity="error">Failed to load employee details. Please try again.</Alert>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    Edit Employee: {employee.first_name} {employee.last_name}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Update employment settings, reporting lines, and org context.
                </Typography>
            </Box>

            <EmployeeForm
                initialValues={employee}
                onSubmit={handleSubmit}
                isPending={updateMutation.isPending}
                errorMsg={errorMsg}
            />
        </AuthenticatedLayout>
    );
}

import apiClient from "@/services/apiClient";
