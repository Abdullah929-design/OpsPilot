"use client";

import { useFormik } from "formik";
import * as Yup from "yup";
import { Button, Stack, Alert, TextField, Container, Paper, Typography, Box } from "@mui/material";
import { usePlatformAuth } from "@/hooks/usePlatformAuth";

const LoginSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().required("Password is required"),
});

export default function PlatformLoginPage() {
    const { login } = usePlatformAuth();

    const formik = useFormik({
        initialValues: {
            email: "",
            password: "",
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
        <Container maxWidth="sm" sx={{ py: 12 }}>
            <Paper sx={{ p: 4, borderRadius: 2 }} elevation={3}>
                <Stack spacing={3}>
                    <Box sx={{ textAlign: "center" }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: "primary.main" }}>
                            OpsPilot SaaS Admin
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Sign in to manage the SaaS platform
                        </Typography>
                    </Box>

                    {/* Demo Credentials Card */}
                    <Box
                        sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: "action.hover",
                            border: "1px dashed",
                            borderColor: "primary.light",
                        }}
                    >
                        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: "primary.main", textTransform: "uppercase", letterSpacing: 0.5 }}>
                                Seeded Demo Credentials
                            </Typography>
                            <Button
                                size="small"
                                variant="text"
                                onClick={() => {
                                    formik.setFieldValue("email", "platform-admin@opspilot.test");
                                    formik.setFieldValue("password", "P@ssword123");
                                }}
                                sx={{ textTransform: "none", py: 0, px: 1, fontSize: "0.75rem" }}
                            >
                                Auto-fill
                            </Button>
                        </Stack>
                        <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.8rem", color: "text.secondary" }}>
                            Email: <strong style={{ color: "var(--foreground)" }}>platform-admin@opspilot.test</strong>
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: "0.8rem", color: "text.secondary" }}>
                            Password: <strong style={{ color: "var(--foreground)" }}>P@ssword123</strong>
                        </Typography>
                    </Box>

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

                            <TextField
                                fullWidth
                                id="password"
                                name="password"
                                type="password"
                                label="Password"
                                value={formik.values.password}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.password && Boolean(formik.errors.password)}
                                helperText={formik.touched.password && formik.errors.password}
                            />

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
                </Stack>
            </Paper>
        </Container>
    );
}
