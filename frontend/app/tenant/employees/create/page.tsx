"use client";

import React, { useState } from "react";
import AuthenticatedLayout from "@/layouts/AuthenticatedLayout";
import EmployeeForm from "@/components/employees/EmployeeForm";
import { useCreateEmployee } from "@/hooks/useEmployees";
import { Typography, Box, Paper } from "@mui/material";

export default function CreateEmployeePage() {
    const createMutation = useCreateEmployee();
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleSubmit = (values: any) => {
        createMutation.mutate(values, {
            onSuccess: () => {
                window.location.href = "/employees";
            },
            onError: (err: any) => {
                setErrorMsg(err?.response?.data?.message || "Failed to create employee record.");
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                    Add Employee
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Register a new employee record and link their platform user account.
                </Typography>
            </Box>

            <EmployeeForm
                onSubmit={handleSubmit}
                isPending={createMutation.isPending}
                errorMsg={errorMsg}
            />
        </AuthenticatedLayout>
    );
}
