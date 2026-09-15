"use client";

import { useFormik } from "formik";
import * as Yup from "yup";
import {
    Button,
    Stack,
    TextField,
    FormControlLabel,
    Switch,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    OutlinedInput,
    Chip,
    Box,
    Alert
} from "@mui/material";
import { useState } from "react";
import PasswordInput from "@/components/forms/PasswordInput";
import { UserFormData } from "@/services/userService";

interface UserFormProps {
    initialValues?: Partial<UserFormData>;
    isEdit?: boolean;
    isSelfEdit?: boolean; // <-- Add this prop to the interface
    onSubmit: (values: UserFormData) => Promise<void>;
    isSubmitting?: boolean;
}

const AVAILABLE_ROLES = ["Super Admin", "Admin", "Manager", "Employee"];

export default function UserForm({ initialValues, isEdit = false, isSelfEdit = false, onSubmit, isSubmitting }: UserFormProps) {
    const [submitError, setSubmitError] = useState<string | null>(null);
    const validationSchema = Yup.object().shape({
        name: isEdit && !isSelfEdit
            ? Yup.string().optional()
            : Yup.string().required("Name is required"),
        email: isEdit && !isSelfEdit
            ? Yup.string().optional()
            : Yup.string().email("Invalid email").required("Email is required"),
        password: isEdit
            ? Yup.string().min(8, "Minimum 8 characters").optional()
            : Yup.string().min(8, "Minimum 8 characters").required("Password is required"),
        password_confirmation: Yup.string().oneOf([Yup.ref("password")], "Passwords must match"),
        roles: Yup.array().of(Yup.string()),
        is_active: Yup.boolean(),
    });

    const formik = useFormik({
        initialValues: {
            name: initialValues?.name || "",
            email: initialValues?.email || "",
            password: "",
            password_confirmation: "",
            roles: initialValues?.roles || ["Employee"],
            is_active: initialValues?.is_active ?? true,
        },
        enableReinitialize: true,
        validationSchema,
        onSubmit: async (values, { setSubmitting, setErrors }) => {
            setSubmitError(null); // <-- Reset error on submit
            try {
                await onSubmit(values);
            } catch (err: any) {
                const errors = err.response?.data?.errors || {};
                const message = err.response?.data?.message || "An error occurred.";

                const formErrors: Record<string, string> = {};
                Object.keys(errors).forEach((key) => {
                    formErrors[key] = Array.isArray(errors[key]) ? errors[key][0] : errors[key];
                });

                if (Object.keys(formErrors).length === 0) {
                    setSubmitError(message); // <-- Set general error instead of alert
                } else {
                    setErrors(formErrors);
                }
            } finally {
                setSubmitting(false);
            }
        },
    });

    return (
        <form onSubmit={formik.handleSubmit}>
            <Stack spacing={3}>
                {submitError && (
                    <Alert severity="error" onClose={() => setSubmitError(null)}>
                        {submitError}
                    </Alert>
                )}
                {/* Only render identity fields if creating a new user or editing own profile */}
                {(!isEdit || isSelfEdit) && (
                    <>
                        <TextField
                            fullWidth
                            id="name"
                            name="name"
                            label="Full Name"
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            error={formik.touched.name && Boolean(formik.errors.name)}
                            helperText={formik.touched.name && formik.errors.name}
                        />

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
                            label={isEdit ? "New Password (leave blank to keep current)" : "Password"}
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            error={formik.touched.password && Boolean(formik.errors.password)}
                            helperText={formik.touched.password && formik.errors.password}
                        />

                        <PasswordInput
                            fullWidth
                            id="password_confirmation"
                            name="password_confirmation"
                            label="Confirm Password"
                            value={formik.values.password_confirmation}
                            onChange={formik.handleChange}
                            error={formik.touched.password_confirmation && Boolean(formik.errors.password_confirmation)}
                            helperText={formik.touched.password_confirmation && formik.errors.password_confirmation}
                        />
                    </>
                )}


                <FormControl fullWidth>
                    <InputLabel id="roles-label">Roles</InputLabel>
                    <Select
                        labelId="roles-label"
                        id="roles"
                        name="roles"
                        multiple
                        value={formik.values.roles}
                        onChange={formik.handleChange}
                        input={<OutlinedInput label="Roles" />}
                        renderValue={(selected) => (
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                {selected.map((value) => (
                                    <Chip key={value} label={value} size="small" />
                                ))}
                            </Box>
                        )}
                    >
                        {AVAILABLE_ROLES.map((role) => (
                            <MenuItem key={role} value={role}>
                                {role}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControlLabel
                    control={
                        <Switch
                            checked={formik.values.is_active}
                            onChange={(e) => formik.setFieldValue("is_active", e.target.checked)}
                            name="is_active"
                            color="primary"
                        />
                    }
                    label="Active Account"
                />

                <Button fullWidth variant="contained" size="large" type="submit" disabled={isSubmitting || formik.isSubmitting}>
                    {isEdit ? "Update User" : "Create User"}
                </Button>
            </Stack>
        </form>
    );
}
