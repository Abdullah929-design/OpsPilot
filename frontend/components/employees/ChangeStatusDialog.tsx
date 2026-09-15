"use client";

import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Alert,
    Stack,
} from "@mui/material";

interface ChangeStatusDialogProps {
    open: boolean;
    currentStatus: string;
    onConfirm: (status: string) => void;
    onCancel: () => void;
    isPending?: boolean;
    errorMsg?: string | null;
}

export default function ChangeStatusDialog({
    open,
    currentStatus,
    onConfirm,
    onCancel,
    isPending,
    errorMsg,
}: ChangeStatusDialogProps) {
    const formik = useFormik({
        initialValues: {
            status: currentStatus || "active",
        },
        enableReinitialize: true,
        validationSchema: Yup.object({
            status: Yup.string().required().oneOf(["active", "inactive", "terminated"]),
        }),
        onSubmit: (values) => {
            onConfirm(values.status);
        },
    });

    const isTerminated = formik.values.status === "terminated";

    return (
        <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ fontWeight: 700 }}>Change Employment Status</DialogTitle>
            <form onSubmit={formik.handleSubmit}>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

                        <TextField
                            select
                            fullWidth
                            id="status"
                            name="status"
                            label="Employment Status"
                            value={formik.values.status}
                            onChange={formik.handleChange}
                        >
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="inactive">Inactive</MenuItem>
                            <MenuItem value="terminated">Terminated</MenuItem>
                        </TextField>

                        {isTerminated && (
                            <Alert severity="warning">
                                Terminating this employee will automatically deactivate their user login access to this company.
                                <strong> Note:</strong> If this employee manages direct reports, they must be reassigned first.
                            </Alert>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={onCancel} variant="outlined">Cancel</Button>
                    <Button
                        type="submit"
                        variant="contained"
                        color={isTerminated ? "error" : "primary"}
                        disabled={isPending}
                    >
                        Update Status
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
