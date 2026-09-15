"use client";

import { useFormik } from "formik";
import * as Yup from "yup";
import { Button, Stack, Alert, Link as MuiLink } from "@mui/material";
import NextLink from "next/link";
import { TextField } from "@mui/material";
import PasswordInput from "./PasswordInput";
import RememberMeCheckbox from "./RememberMeCheckbox";
import { useAuth } from "@/hooks/useAuth";

const LoginSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().required("Password is required"),
    remember: Yup.boolean(),
});

export default function LoginForm() {
    const { login } = useAuth();

    const formik = useFormik({
        initialValues: {
            email: "",
            password: "",
            remember: false,
        },
        validationSchema: LoginSchema,
        onSubmit: async (values, { setSubmitting, setFieldError }) => {
            try {
                await login.mutateAsync(values);
            } catch (err: any) {
                const message = err.response?.data?.message || "Login failed. Please try again.";
                setFieldError("email", message);
            } finally {
                setSubmitting(false);
            }
        },
    });

    return (
        <form onSubmit={formik.handleSubmit}>
            <Stack spacing={2}>
                {login.isError && (
                    <Alert severity="error">
                        {(login.error as any)?.response?.data?.message || "Invalid credentials"}
                    </Alert>
                )}

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

                <PasswordInput
                    fullWidth
                    id="password"
                    name="password"
                    label="Password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.password && Boolean(formik.errors.password)}
                    helperText={formik.touched.password && formik.errors.password}
                />

                <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                    <RememberMeCheckbox
                        checked={formik.values.remember}
                        onChange={formik.handleChange}
                    />
                    <MuiLink component={NextLink} href="/forgot-password" variant="body2">
                        Forgot Password?
                    </MuiLink>
                </Stack>

                <Button
                    fullWidth
                    size="large"
                    type="submit"
                    variant="contained"
                    disabled={formik.isSubmitting || login.isPending}
                >
                    {login.isPending ? "Signing in..." : "Sign In"}
                </Button>
            </Stack>
        </form>
    );
}
