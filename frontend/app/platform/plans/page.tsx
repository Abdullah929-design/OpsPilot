"use client";

import { useState } from "react";
import PlatformRouteGuard from "@/components/layout/PlatformRouteGuard";
import { usePlatformPlans, Plan } from "@/hooks/usePlatformPlans";
import {
    Container, Paper, Typography, Button, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Stack, Switch, FormControlLabel, Box, CircularProgress, Select, MenuItem, InputLabel, FormControl
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import PlatformLayout from "@/layouts/PlatformLayout";


const PlanSchema = Yup.object().shape({
    name: Yup.string().required("Plan name is required"),
    description: Yup.string(),
    price: Yup.number().min(0).required("Price is required"),
    billing_interval: Yup.string().oneOf(["monthly", "yearly"]).required(),
    trial_days: Yup.number().min(0).required(),
    user_limit: Yup.number().min(1).nullable(),
    company_storage_limit_mb: Yup.number().min(1).nullable(),
    is_archived: Yup.boolean(),
});

function PlansContent() {
    const { plans, isLoading, createPlan, updatePlan } = usePlatformPlans();
    const [open, setOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

    const formik = useFormik({
        initialValues: {
            name: "",
            description: "",
            price: 0,
            billing_interval: "monthly" as "monthly" | "yearly",
            trial_days: 0,
            user_limit: "" as any,
            company_storage_limit_mb: "" as any,
            is_archived: false,
        },
        validationSchema: PlanSchema,
        onSubmit: async (values) => {
            const payload = {
                ...values,
                user_limit: values.user_limit === "" ? null : Number(values.user_limit),
                company_storage_limit_mb: values.company_storage_limit_mb === "" ? null : Number(values.company_storage_limit_mb),
            };

            if (editingPlan) {
                await updatePlan.mutateAsync({ id: editingPlan.id, ...payload });
            } else {
                await createPlan.mutateAsync(payload);
            }
            handleClose();
        },
    });

    const handleOpen = (plan?: Plan) => {
        if (plan) {
            setEditingPlan(plan);
            formik.setValues({
                name: plan.name,
                description: plan.description || "",
                price: Number(plan.price),
                billing_interval: plan.billing_interval,
                trial_days: plan.trial_days,
                user_limit: plan.user_limit ?? "",
                company_storage_limit_mb: plan.company_storage_limit_mb ?? "",
                is_archived: plan.is_archived,
            });
        } else {
            setEditingPlan(null);
            formik.resetForm();
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditingPlan(null);
        formik.resetForm();
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
                        Pricing Plans
                    </Typography>
                    <Button variant="contained" onClick={() => handleOpen()}>
                        Create Plan
                    </Button>
                </Box>

                <TableContainer component={Paper} variant="outlined">
                    <Table>
                        <TableHead sx={{ bgcolor: "grey.50" }}>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Price</TableCell>
                                <TableCell>Billing</TableCell>
                                <TableCell>User Limit</TableCell>
                                <TableCell>Storage</TableCell>
                                <TableCell>Trial Days</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {plans.map((plan) => (
                                <TableRow key={plan.id}>
                                    <TableCell sx={{ fontWeight: 600 }}>{plan.name}</TableCell>
                                    <TableCell>${plan.price}</TableCell>
                                    <TableCell sx={{ textTransform: "capitalize" }}>{plan.billing_interval}</TableCell>
                                    <TableCell>{plan.user_limit ?? "Unlimited"}</TableCell>
                                    <TableCell>{plan.company_storage_limit_mb ? `${plan.company_storage_limit_mb} MB` : "Unlimited"}</TableCell>
                                    <TableCell>{plan.trial_days} days</TableCell>
                                    <TableCell>{plan.is_archived ? "Archived" : "Active"}</TableCell>
                                    <TableCell align="right">
                                        <Button size="small" onClick={() => handleOpen(plan)}>
                                            Edit
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>{editingPlan ? "Edit Plan" : "Create Plan"}</DialogTitle>
                <form onSubmit={formik.handleSubmit}>
                    <DialogContent dividers>
                        <Stack spacing={2}>
                            <TextField
                                fullWidth
                                id="name"
                                name="name"
                                label="Plan Name"
                                value={formik.values.name}
                                onChange={formik.handleChange}
                                error={formik.touched.name && Boolean(formik.errors.name)}
                                helperText={formik.touched.name && formik.errors.name}
                            />
                            <TextField
                                fullWidth
                                id="description"
                                name="description"
                                label="Description"
                                multiline
                                rows={3}
                                value={formik.values.description}
                                onChange={formik.handleChange}
                            />
                            <Stack direction="row" spacing={2}>
                                <TextField
                                    fullWidth
                                    id="price"
                                    name="price"
                                    label="Price ($)"
                                    type="number"
                                    value={formik.values.price}
                                    onChange={formik.handleChange}
                                    error={formik.touched.price && Boolean(formik.errors.price)}
                                />
                                <FormControl fullWidth>
                                    <InputLabel>Billing Interval</InputLabel>
                                    <Select
                                        name="billing_interval"
                                        value={formik.values.billing_interval}
                                        label="Billing Interval"
                                        onChange={formik.handleChange}
                                    >
                                        <MenuItem value="monthly">Monthly</MenuItem>
                                        <MenuItem value="yearly">Yearly</MenuItem>
                                    </Select>
                                </FormControl>
                            </Stack>
                            <Stack direction="row" spacing={2}>
                                <TextField
                                    fullWidth
                                    id="user_limit"
                                    name="user_limit"
                                    label="User Limit (leave blank for unlimited)"
                                    type="number"
                                    value={formik.values.user_limit}
                                    onChange={formik.handleChange}
                                />
                                <TextField
                                    fullWidth
                                    id="company_storage_limit_mb"
                                    name="company_storage_limit_mb"
                                    label="Storage Limit (MB)"
                                    type="number"
                                    value={formik.values.company_storage_limit_mb}
                                    onChange={formik.handleChange}
                                />
                            </Stack>
                            <TextField
                                fullWidth
                                id="trial_days"
                                name="trial_days"
                                label="Trial Period (Days)"
                                type="number"
                                value={formik.values.trial_days}
                                onChange={formik.handleChange}
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        name="is_archived"
                                        checked={formik.values.is_archived}
                                        onChange={formik.handleChange}
                                    />
                                }
                                label="Archive Plan"
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button type="submit" variant="contained" disabled={createPlan.isPending || updatePlan.isPending}>
                            Save
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Container>
    );
}

export default function PlatformPlansPage() {
    return (
        <PlatformLayout>
            <PlansContent />
        </PlatformLayout>
    );
}

