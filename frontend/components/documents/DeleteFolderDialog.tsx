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
import { Folder } from "@/services/folderService";

interface DeleteFolderDialogProps {
    open: boolean;
    folder: Folder | null;
    onClose: () => void;
    onConfirm: (force?: boolean) => void;
}

export default function DeleteFolderDialog({
    open,
    folder,
    onClose,
    onConfirm,
}: DeleteFolderDialogProps) {
    if (!folder) return null;

    const hasContent = (folder.children_count ?? 0) > 0 || (folder.documents_count ?? 0) > 0;

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <WarningAmberIcon color={hasContent ? "error" : "warning"} />
                Delete Folder?
            </DialogTitle>
            <DialogContent>
                {hasContent ? (
                    <DialogContentText color="error.main" sx={{ fontWeight: 600 }}>
                        This folder contains subfolders or documents. Deleting it will also delete all of its contents recursively.
                        Are you sure you want to proceed? This action cannot be undone.
                    </DialogContentText>
                ) : (
                    <DialogContentText>
                        Are you sure you want to delete the folder <strong>"{folder.name}"</strong>?
                        This action cannot be undone.
                    </DialogContentText>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} color="inherit" variant="outlined">
                    Cancel
                </Button>
                <Button
                    onClick={() => onConfirm(hasContent)}
                    color="error"
                    variant="contained"
                >
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
}
