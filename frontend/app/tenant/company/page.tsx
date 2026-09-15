"use client";

import React, { useState } from "react";
import AuthenticatedLayout from "@/layouts/AuthenticatedLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { companyService, CompanyData } from "@/services/companyService";
import { useFormik } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import {
    Typography,
    Grid,
    Paper,
    Box,
    TextField,
    Button,
    Avatar,
    Stack,
    CircularProgress,
    Divider,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

export default function CompanyPage() {
    const queryClient = useQueryClient();
    const [logoFile, setLogoFile] = useState<File | null>(null);

    const { data: company, isLoading } = useQuery<CompanyData>({
        queryKey: ["company"],
        queryFn: companyService.getCompany,
    });

    const updateMutation = useMutation({
        mutationFn: companyService.updateCompany,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["company"] });
            alert("Company details updated successfully.");
        },
    });

    const logoMutation = useMutation({
        mutationFn: companyService.uploadLogo,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["company"] });
            setLogoFile(null);
            alert("Company logo updated successfully.");
        },
    });

    const formik = useFormik({
        initialValues: {
            name: company?.name || "",
            legal_name: company?.legal_name || "",
            email: company?.email || "",
            phone: company?.phone || "",
            website: company?.website || "",
            timezone: company?.timezone || "UTC",
            currency: company?.currency || "USD",
            language: company?.language || "en",
            address: company?.address || "",
            city: company?.city || "",
            country: company?.country || "",
            postal_code: company?.postal_code || "",
        },
        enableReinitialize: true,
        validationSchema: Yup.object({
            name: Yup.string().required("Company name is required"),
            email: Yup.string().email("Invalid email address").nullable(),
            website: Yup.string().url("Invalid website URL (must start with http/https)").nullable(),
            timezone: Yup.string().required("Timezone is required"),
            currency: Yup.string().required("Currency is required"),
            language: Yup.string().required("Language is required"),
        }),
        onSubmit: (values) => {
            updateMutation.mutate(values);
        },
    });

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const formData = new FormData();
            formData.append("logo", file);
            logoMutation.mutate(formData);
        }
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

    return (
        <AuthenticatedLayout>
            <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                        Company Profile
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage your organization settings, currency, and details.
                    </Typography>
                </Box>
                <Button
                    component={Link}
                    href="/company/settings"
                    variant="contained"
                    color="primary"
                >
                    Company Settings
                </Button>
            </Box>

            <Grid container spacing={3}>
                {/* Left Side: Logo & Settings */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 4, textAlign: "center", borderRadius: 2 }}>
                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                            Company Logo
                        </Typography>
                        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
                            <Avatar
                                src={company?.logo || undefined}
                                sx={{ width: 120, height: 120, border: "2px solid #ddd" }}
                            >
                                {company?.name?.[0]?.toUpperCase()}
                            </Avatar>
                        </Box>
                        <Button
                            component="label"
                            variant="outlined"
                            startIcon={<CloudUploadIcon />}
                            disabled={logoMutation.isPending}
                        >
                            Upload Logo
                            <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={handleLogoUpload}
                            />
                        </Button>
                        {logoMutation.isPending && (
                            <Box sx={{ mt: 1 }}>
                                <CircularProgress size={20} />
                            </Box>
                        )}
                    </Paper>
                </Grid>

                {/* Right Side: Form details */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ p: 4, borderRadius: 2 }}>
                        <form onSubmit={formik.handleSubmit}>
                            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                                Organization Details
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, sm: 6 }}>
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
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        fullWidth
                                        id="legal_name"
                                        name="legal_name"
                                        label="Legal Name"
                                        value={formik.values.legal_name}
                                        onChange={formik.handleChange}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        fullWidth
                                        id="email"
                                        name="email"
                                        label="Email Address"
                                        value={formik.values.email}
                                        onChange={formik.handleChange}
                                        error={formik.touched.email && Boolean(formik.errors.email)}
                                        helperText={formik.touched.email && formik.errors.email}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        fullWidth
                                        id="phone"
                                        name="phone"
                                        label="Phone"
                                        value={formik.values.phone}
                                        onChange={formik.handleChange}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                    <TextField
                                        fullWidth
                                        id="website"
                                        name="website"
                                        label="Website URL"
                                        value={formik.values.website}
                                        onChange={formik.handleChange}
                                        error={formik.touched.website && Boolean(formik.errors.website)}
                                        helperText={formik.touched.website && formik.errors.website}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12 }}>
                                    <Divider sx={{ my: 1 }} />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                        Localization & Regional Settings
                                    </Typography>
                                </Grid>

                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <TextField
                                        fullWidth
                                        id="timezone"
                                        name="timezone"
                                        label="Timezone"
                                        value={formik.values.timezone}
                                        onChange={formik.handleChange}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <TextField
                                        fullWidth
                                        id="currency"
                                        name="currency"
                                        label="Currency (e.g. USD)"
                                        value={formik.values.currency}
                                        onChange={formik.handleChange}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <TextField
                                        fullWidth
                                        id="language"
                                        name="language"
                                        label="Language"
                                        value={formik.values.language}
                                        onChange={formik.handleChange}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12 }}>
                                    <Divider sx={{ my: 1 }} />
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                        Address Information
                                    </Typography>
                                </Grid>

                                <Grid size={{ xs: 12 }}>
                                    <TextField
                                        fullWidth
                                        id="address"
                                        name="address"
                                        label="Street Address"
                                        value={formik.values.address}
                                        onChange={formik.handleChange}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <TextField
                                        fullWidth
                                        id="city"
                                        name="city"
                                        label="City"
                                        value={formik.values.city}
                                        onChange={formik.handleChange}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <TextField
                                        fullWidth
                                        id="country"
                                        name="country"
                                        label="Country"
                                        value={formik.values.country}
                                        onChange={formik.handleChange}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <TextField
                                        fullWidth
                                        id="postal_code"
                                        name="postal_code"
                                        label="Postal Code"
                                        value={formik.values.postal_code}
                                        onChange={formik.handleChange}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12 }}>
                                    <Stack sx={{ justifyContent: "flex-end", mt: 2 }}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            size="large"
                                            disabled={updateMutation.isPending}
                                        >
                                            Save Changes
                                        </Button>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </form>
                    </Paper>
                </Grid>
            </Grid>
        </AuthenticatedLayout>
    );
}
