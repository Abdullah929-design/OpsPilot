"use client";

import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Alert,
    Stack,
} from "@mui/material";

interface DeleteEmployeeDialogProps {
    open: boolean;
    employeeName: string;
    onConfirm: () => void;
    onCancel: () => void;
    isPending?: boolean;
    errorMsg?: string | null;
}

export default function DeleteEmployeeDialog({
    open,
    employeeName,
    onConfirm,
    onCancel,
    isPending,
    errorMsg,
}: DeleteEmployeeDialogProps) {
    return (
        <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ fontWeight: 700, color: "error.main" }}>Delete Employee Record</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <Typography>
                        Are you sure you want to permanently delete the employee record for <strong>{employeeName}</strong>?
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                        Deleting this record will deactivate the linked user account access for this company portal. This action cannot be undone.
                    </Typography>

                    {errorMsg && (
                        <Alert severity="error" sx={{ mt: 1 }}>
                            {errorMsg}
                        </Alert>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button onClick={onCancel} variant="outlined">Cancel</Button>
                <Button onClick={onConfirm} variant="contained" color="error" disabled={isPending}>
                    Delete Employee
                </Button>
            </DialogActions>
        </Dialog>
    );
}
