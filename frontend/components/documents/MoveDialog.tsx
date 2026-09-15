import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Typography,
} from "@mui/material";
import { Document } from "@/services/documentService";
import { Folder } from "@/services/folderService";

interface MoveDialogProps {
    open: boolean;
    document: Document | null;
    folders: Folder[];
    onClose: () => void;
    onConfirm: (folderId: number | null) => void;
    isCopy?: boolean;
}

export default function MoveDialog({
    open,
    document: doc,
    folders,
    onClose,
    onConfirm,
    isCopy = false,
}: MoveDialogProps) {
    const [targetFolderId, setTargetFolderId] = useState<string>("");

    useEffect(() => {
        if (open && doc) {
            setTargetFolderId(doc.folder_id ? String(doc.folder_id) : "");
        }
    }, [open, doc]);

    if (!doc) return null;

    const handleConfirm = () => {
        onConfirm(targetFolderId === "" ? null : Number(targetFolderId));
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>{isCopy ? "Copy Document" : "Move Document"}</DialogTitle>
            <DialogContent dividers>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                    <Typography variant="body2">
                        Select target folder to {isCopy ? "copy" : "move"} <strong>"{doc.title}"</strong>:
                    </Typography>

                    <FormControl fullWidth size="small">
                        <InputLabel id="move-target-folder-label">Target Folder</InputLabel>
                        <Select
                            labelId="move-target-folder-label"
                            value={targetFolderId}
                            label="Target Folder"
                            onChange={(e) => setTargetFolderId(e.target.value)}
                        >
                            <MenuItem value="">
                                <em>Root Directory (All Files)</em>
                            </MenuItem>
                            {folders.map((f) => (
                                <MenuItem key={f.id} value={String(f.id)}>
                                    {f.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">
                    Cancel
                </Button>
                <Button onClick={handleConfirm} variant="contained" color="primary">
                    Confirm
                </Button>
            </DialogActions>
        </Dialog>
    );
}
