"use client";

import { Suspense } from "react";
import GuestLayout from "@/layouts/GuestLayout";
import PasswordInput from "@/components/forms/PasswordInput";
import { Typography, TextField, Button, Stack, Alert } from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import apiClient from "@/services/apiClient";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token") || "";
    const emailParam = searchParams.get("email") || "";
    const [success, setSuccess] = useState(false);

    const formik = useFormik({
        initialValues: {
            token,
            email: emailParam,
            password: "",
            password_confirmation: "",
        },
        validationSchema: Yup.object({
            email: Yup.string().email("Invalid email").required("Required"),
            password: Yup.string().min(8, "Minimum 8 characters").required("Required"),
            password_confirmation: Yup.string()
                .oneOf([Yup.ref("password")], "Passwords must match")
                .required("Required"),
        }),
        onSubmit: async (values, { setSubmitting, setFieldError }) => {
            try {
                await apiClient.post("/v1/reset-password", values);
                setSuccess(true);
                setTimeout(() => router.push("/login"), 2000);
            } catch (err: any) {
                setFieldError("password", err.response?.data?.message || "Failed to reset password.");
            } finally {
                setSubmitting(false);
            }
        },
    });

    return (
        <Stack spacing={2}>
            <Typography variant="h5" sx={{ fontWeight: 600, textAlign: "center" }}>
                Reset Password
            </Typography>

            {success && <Alert severity="success">Password reset successfully! Redirecting to login...</Alert>}

            <form onSubmit={formik.handleSubmit}>
                <Stack spacing={2}>
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
                    <PasswordInput
                        fullWidth
                        id="password"
                        name="password"
                        label="New Password"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        error={formik.touched.password && Boolean(formik.errors.password)}
                        helperText={formik.touched.password && formik.errors.password}
                    />
                    <PasswordInput
                        fullWidth
                        id="password_confirmation"
                        name="password_confirmation"
                        label="Confirm New Password"
                        value={formik.values.password_confirmation}
                        onChange={formik.handleChange}
                        error={formik.touched.password_confirmation && Boolean(formik.errors.password_confirmation)}
                        helperText={formik.touched.password_confirmation && formik.errors.password_confirmation}
                    />
                    <Button fullWidth variant="contained" type="submit" disabled={formik.isSubmitting}>
                        Reset Password
                    </Button>
                </Stack>
            </form>
        </Stack>
    );
}

export default function ResetPasswordPage() {
    return (
        <GuestLayout>
            <Suspense fallback={<Typography sx={{ textAlign: "center" }}>Loading...</Typography>}>
                <ResetPasswordForm />
            </Suspense>
        </GuestLayout>
    );
}
