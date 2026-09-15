import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Box,
    Typography,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { DocumentVersion } from "@/services/documentVersionService";

interface RestoreVersionDialogProps {
    open: boolean;
    version: DocumentVersion | null;
    currentVersion: number;
    onClose: () => void;
    onConfirm: () => void;
}

export default function RestoreVersionDialog({
    open,
    version,
    currentVersion,
    onClose,
    onConfirm,
}: RestoreVersionDialogProps) {
    if (!version) return null;

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <WarningAmberIcon color="warning" />
                Restore Version v{version.version}?
            </DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ mb: 2 }}>
                    Are you sure you want to restore version <strong>v{version.version}</strong> ({version.file_name})?
                </DialogContentText>
                <Box sx={{ backgroundColor: "warning.light", p: 1.5, borderRadius: "6px", color: "warning.contrastText" }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Restoring v{version.version} will create v{currentVersion + 1} as a copy of v{version.version}.
                    </Typography>
                    <Typography sx={{ variant: "caption", display: "block" }}>
                        This action is fully audited.
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} color="inherit" variant="outlined">
                    Cancel
                </Button>
                <Button onClick={onConfirm} color="primary" variant="contained">
                    Confirm Restore
                </Button>
            </DialogActions>
        </Dialog>
    );
}
