import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { Document } from "@/services/documentService";

interface DeleteDocumentDialogProps {
    open: boolean;
    document: Document | null;
    onClose: () => void;
    onConfirm: () => void;
}

export default function DeleteDocumentDialog({
    open,
    document: doc,
    onClose,
    onConfirm,
}: DeleteDocumentDialogProps) {
    if (!doc) return null;

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <WarningAmberIcon color="warning" />
                Delete Document?
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Are you sure you want to delete <strong>"{doc.title}"</strong> ({doc.file_name})?
                    This will move the document to the archived state (soft delete).
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} color="inherit" variant="outlined">
                    Cancel
                </Button>
                <Button onClick={onConfirm} color="error" variant="contained">
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
}
