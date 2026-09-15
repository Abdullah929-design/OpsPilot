"use client";

import GuestLayout from "@/layouts/GuestLayout";
import { Typography, TextField, Button, Stack, Alert, Link as MuiLink } from "@mui/material";
import NextLink from "next/link";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import apiClient from "@/services/apiClient";

export default function ForgotPasswordPage() {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: { email: "" },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email").required("Email is required"),
    }),
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      try {
        const res = await apiClient.post("/v1/forgot-password", values);
        setStatusMessage(res.data.message);
      } catch (err: any) {
        setFieldError("email", err.response?.data?.message || "Failed to send reset link.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <GuestLayout>
      <Stack spacing={2}>
        <Typography variant="h5" sx={{ fontWeight: 600, textAlign: "center" }}>
          Forgot Password
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
          Enter your email and we'll send you a link to reset your password.
        </Typography>

        {statusMessage && <Alert severity="success">{statusMessage}</Alert>}

        <form onSubmit={formik.handleSubmit}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              id="email"
              name="email"
              label="Email Address"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />
            <Button fullWidth variant="contained" type="submit" disabled={formik.isSubmitting}>
              Send Reset Link
            </Button>
            <MuiLink component={NextLink} href="/login" variant="body2" sx={{ textAlign: "center" }}>
              Back to Sign In
            </MuiLink>
          </Stack>
        </form>
      </Stack>
    </GuestLayout>
  );
}
