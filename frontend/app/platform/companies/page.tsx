"use client";

import { useEffect, useState } from "react";
import PlatformRouteGuard from "@/components/layout/PlatformRouteGuard";
import { usePlatformCompanies, Company } from "@/hooks/usePlatformCompanies";
import { usePlatformPlans } from "@/hooks/usePlatformPlans";
import { usePlatformUsers } from "@/hooks/usePlatformUsers";
import apiClient from "@/services/apiClient";
import {
    Container, Paper, Typography, Button, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Stack, Box, CircularProgress, Select, MenuItem, InputLabel, FormControl
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import PlatformLayout from "@/layouts/PlatformLayout";


const CompanySchema = Yup.object().shape({
    name: Yup.string().required("Company name is required"),
    subdomain: Yup.string().required("Subdomain is required"),
    email: Yup.string().email("Invalid email"),
    phone: Yup.string(),
    plan_id: Yup.string().nullable(),
    assigned_manager_id: Yup.string().nullable(),
    // Administrator validation
    admin_name: Yup.string().required("Administrator name is required"),
    admin_email: Yup.string().email("Invalid email").required("Administrator email is required"),
    admin_password: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .matches(/[a-z]/, "Must contain at least one lowercase letter")
        .matches(/[A-Z]/, "Must contain at least one uppercase letter")
        .matches(/[0-9]/, "Must contain at least one number")
        .matches(/[^a-zA-Z0-9]/, "Must contain at least one special character")
        .required("Password is required"),
});

function CompaniesContent() {
    const { companies, isLoading, createCompany } = usePlatformCompanies();
    const { plans } = usePlatformPlans();
    const { users } = usePlatformUsers();
    const [open, setOpen] = useState(false);
    const router = useRouter();

    // Subdomain checking state
    const [subdomainStatus, setSubdomainStatus] = useState<{
        checking: boolean;
        available: boolean | null;
        message: string;
    }>({ checking: false, available: null, message: "" });

    const formik = useFormik({
        initialValues: {
            name: "",
            subdomain: "",
            email: "",
            phone: "",
            plan_id: "",
            assigned_manager_id: "",
            admin_name: "",
            admin_email: "",
            admin_password: "",
        },
        validationSchema: CompanySchema,
        onSubmit: async (values) => {
            const payload = {
                ...values,
                subdomain: values.subdomain.trim().toLowerCase(),
                plan_id: values.plan_id ? Number(values.plan_id) : undefined,
                assigned_manager_id: values.assigned_manager_id ? Number(values.assigned_manager_id) : undefined,
            };
            try {
                await createCompany.mutateAsync(payload);
                handleClose();
            } catch (err: any) {
                alert(err.response?.data?.message || "Failed to create company.");
            }
        },
    });

    // Live Subdomain Debounced Checker
    useEffect(() => {
        const subdomain = formik.values.subdomain.trim().toLowerCase();
        if (!subdomain) {
            setSubdomainStatus({ checking: false, available: null, message: "" });
            return;
        }
        // Format validation
        const formatValid = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(subdomain);
        if (!formatValid) {
            setSubdomainStatus({ checking: false, available: false, message: "Invalid format (lowercase letters, numbers, hyphens only)." });
            return;
        }
        // Reserved check
        const reserved = ['www', 'api', 'admin', 'platform', 'app', 'mail', 'static', 'assets', 'cdn', 'docs', 'support', 'status'];
        if (reserved.includes(subdomain)) {
            setSubdomainStatus({ checking: false, available: false, message: "This subdomain is reserved." });
            return;
        }
        setSubdomainStatus((prev) => ({ ...prev, checking: true }));
        const delayDebounceFn = setTimeout(() => {
            apiClient.get(`/platform/companies/subdomain-check?value=${subdomain}`)
                .then((res) => {
                    const isAvailable = res.data.data.available;
                    setSubdomainStatus({
                        checking: false,
                        available: isAvailable,
                        message: isAvailable ? "Subdomain is available!" : "Subdomain is already taken."
                    });
                })
                .catch(() => {
                    setSubdomainStatus({ checking: false, available: null, message: "Failed to check availability." });
                });
        }, 400);
        return () => clearTimeout(delayDebounceFn);
    }, [formik.values.subdomain]);

    // Live URL Preview Utility
    const getLiveUrlPreview = (subdomain: string) => {
        if (typeof window === "undefined") return "";
        const host = window.location.host;
        const parts = host.split(".");
        if (host.includes("localhost") || parts.length < 2) {
            return `http://${subdomain}.OpsPilot.test:3000`;
        }
        const baseDomain = parts.slice(1).join(".");
        return `${window.location.protocol}//${subdomain}.${baseDomain}`;
    };

    const handleDeleteClick = async (companyId: number, companyName: string) => {
        const confirmed = window.confirm(
            `Are you sure you want to permanently delete "${companyName}"? \n\nWARNING: This will permanently delete all employees, departments, designations, settings, and other company data. This action CANNOT be undone.`
        );
        if (!confirmed) return;

        try {
            await apiClient.delete(`/platform/companies/${companyId}`);
            window.location.reload();
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to delete company.");
        }
    };


    const handleClose = () => {
        setOpen(false);
        formik.resetForm();
        setSubdomainStatus({ checking: false, available: null, message: "" });
    };

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <Paper sx={{ p: 4, borderRadius: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        Companies Directory
                    </Typography>
                    <Button variant="contained" onClick={() => setOpen(true)}>
                        Create Company
                    </Button>
                </Box>

                <TableContainer component={Paper} variant="outlined">
                    <Table>
                        <TableHead sx={{ bgcolor: "grey.50" }}>
                            <TableRow>
                                <TableCell>Company Name</TableCell>
                                <TableCell>Plan</TableCell>
                                <TableCell>Manager</TableCell>
                                <TableCell>System Status</TableCell>
                                <TableCell>Created At</TableCell>
                                <TableCell align="right">Details</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {companies.map((company) => (
                                <TableRow key={company.id}>
                                    <TableCell sx={{ fontWeight: 600 }}>{company.name}</TableCell>
                                    <TableCell>{company.plan?.name || "No Plan"}</TableCell>
                                    <TableCell>{company.assigned_manager?.name || "Unassigned"}</TableCell>
                                    <TableCell sx={{ textTransform: "capitalize" }}>{company.platform_status}</TableCell>
                                    <TableCell>{company.created_at ? new Date(company.created_at).toLocaleDateString() : "N/A"}</TableCell>
                                    <TableCell align="right">
                                        <Stack sx={{ gap: 1, flexDirection: "row", alignItems: "center", justifyContent: "flex-end" }}>
                                            <Button size="small" onClick={() => router.push(`/companies/${company.id}`)}>
                                                Overview
                                            </Button>
                                            <Button size="small" color="error" onClick={() => handleDeleteClick(company.id, company.name)}>
                                                Delete
                                            </Button>
                                        </Stack>
                                    </TableCell>

                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>Create Company</DialogTitle>
                <form onSubmit={formik.handleSubmit}>
                    <DialogContent dividers>
                        <Stack spacing={2}>
                            <TextField
                                fullWidth
                                id="name"
                                name="name"
                                label="Company Name"
                                value={formik.values.name}
                                onChange={formik.handleChange}
                                error={formik.touched.name && Boolean(formik.errors.name)}
                                helperText={formik.touched.name && formik.errors.name}
                            />
                            <TextField
                                fullWidth
                                id="subdomain"
                                name="subdomain"
                                label="Company Subdomain"
                                value={formik.values.subdomain}
                                onChange={(e) => formik.setFieldValue("subdomain", e.target.value.toLowerCase().replace(/\s+/g, ""))}
                                error={formik.touched.subdomain && (Boolean(formik.errors.subdomain) || subdomainStatus.available === false)}
                                helperText={
                                    (formik.touched.subdomain && formik.errors.subdomain) ||
                                    (subdomainStatus.checking ? "Checking availability..." : subdomainStatus.message)
                                }
                                slotProps={{
                                    htmlInput: {
                                        style: { textTransform: "lowercase" }
                                    }
                                }}
                            />
                            {formik.values.subdomain && (
                                <Box sx={{ mt: -1, pl: 1, fontSize: "0.85rem", color: subdomainStatus.available ? "success.main" : "text.secondary" }}>
                                    Preview URL: <strong>{getLiveUrlPreview(formik.values.subdomain)}</strong>
                                </Box>
                            )}
                            <TextField
                                fullWidth
                                id="email"
                                name="email"
                                label="Email Address"
                                value={formik.values.email}
                                onChange={formik.handleChange}
                                error={formik.touched.email && Boolean(formik.errors.email)}
                            />
                            <TextField
                                fullWidth
                                id="phone"
                                name="phone"
                                label="Phone Number"
                                value={formik.values.phone}
                                onChange={formik.handleChange}
                            />

                            <FormControl fullWidth>
                                <InputLabel>Assigned Plan</InputLabel>
                                <Select
                                    name="plan_id"
                                    value={formik.values.plan_id}
                                    label="Assigned Plan"
                                    onChange={formik.handleChange}
                                >
                                    <MenuItem value=""><em>None</em></MenuItem>
                                    {plans.map((p) => (
                                        <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl fullWidth>
                                <InputLabel>Platform Manager</InputLabel>
                                <Select
                                    name="assigned_manager_id"
                                    value={formik.values.assigned_manager_id}
                                    label="Platform Manager"
                                    onChange={formik.handleChange}
                                >
                                    <MenuItem value=""><em>None</em></MenuItem>
                                    {users.map((u) => (
                                        <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 600, color: "text.secondary" }}>
                                Default Administrator Details
                            </Typography>
                            <TextField
                                fullWidth
                                id="admin_name"
                                name="admin_name"
                                label="Administrator Name"
                                value={formik.values.admin_name}
                                onChange={formik.handleChange}
                                error={formik.touched.admin_name && Boolean(formik.errors.admin_name)}
                                helperText={formik.touched.admin_name && formik.errors.admin_name}
                            />
                            <TextField
                                fullWidth
                                id="admin_email"
                                name="admin_email"
                                label="Administrator Email"
                                value={formik.values.admin_email}
                                onChange={formik.handleChange}
                                error={formik.touched.admin_email && Boolean(formik.errors.admin_email)}
                                helperText={formik.touched.admin_email && formik.errors.admin_email}
                            />
                            <TextField
                                fullWidth
                                id="admin_password"
                                name="admin_password"
                                type="password"
                                label="Administrator Password"
                                value={formik.values.admin_password}
                                onChange={formik.handleChange}
                                error={formik.touched.admin_password && Boolean(formik.errors.admin_password)}
                                helperText={formik.touched.admin_password && formik.errors.admin_password}
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={createCompany.isPending || subdomainStatus.available === false || subdomainStatus.checking}
                        >
                            Create
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Container>
    );
}

export default function PlatformCompaniesPage() {
    return (
        <PlatformLayout>
            <CompaniesContent />
        </PlatformLayout>
    );
}