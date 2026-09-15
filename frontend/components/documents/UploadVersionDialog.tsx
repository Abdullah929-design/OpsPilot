import React, { useEffect, useState, useRef } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    LinearProgress,
    Paper,
    Stack,
    IconButton,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";

interface UploadVersionDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (file: File) => void;
    currentVersion: number;
    isUploading?: boolean;
}

export default function UploadVersionDialog({
    open,
    onClose,
    onSubmit,
    currentVersion,
    isUploading = false,
}: UploadVersionDialogProps) {
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) {
            setFile(null);
            setError(null);
        }
    }, [open]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            setFile(files[0]);
            setError(null);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            setFile(files[0]);
            setError(null);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setError("Please select a file to upload.");
            return;
        }
        onSubmit(file);
    };

    return (
        <Dialog open={open} onClose={isUploading ? undefined : onClose} fullWidth maxWidth="xs">
            <DialogTitle>Upload New Version</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent dividers>
                    {isUploading && (
                        <Box sx={{ width: "100%", mb: 2 }}>
                            <Typography variant="caption" color="text.secondary">Uploading file...</Typography>
                            <LinearProgress />
                        </Box>
                    )}

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                        <Box sx={{ backgroundColor: "info.light", p: 1.5, borderRadius: "6px" }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: "info.contrastText" }}>
                                Current Version: v{currentVersion}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "info.contrastText", display: "block" }}>
                                This file will become <strong>v{currentVersion + 1}</strong>.
                            </Typography>
                        </Box>

                        {!file ? (
                            <Box
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                sx={{
                                    border: "2px dashed",
                                    borderColor: error ? "error.main" : "divider",
                                    borderRadius: "8px",
                                    p: 4,
                                    textAlign: "center",
                                    cursor: "pointer",
                                    backgroundColor: "action.hover",
                                    transition: "border-color 0.2s",
                                    "&:hover": { borderColor: "primary.main" },
                                }}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    style={{ display: "none" }}
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp,.zip"
                                />
                                <CloudUploadIcon sx={{ fontSize: "2.5rem", color: "text.secondary", mb: 1.5 }} />
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    Drag & drop file here or click to browse
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Supported: PDF, Word, Excel, PowerPoint, Image, ZIP (Max 50MB)
                                </Typography>
                                {error && (
                                    <Typography variant="caption" color="error.main" sx={{ display: "block", mt: 1 }}>
                                        {error}
                                    </Typography>
                                )}
                            </Box>
                        ) : (
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 2,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    borderColor: "success.light",
                                    backgroundColor: "action.hover",
                                }}
                            >
                                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                                    <InsertDriveFileIcon sx={{ color: "primary.main" }} />
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 600, maxWidth: 200 }} noWrap>
                                            {file.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                                        </Typography>
                                    </Box>
                                </Stack>
                                <IconButton size="small" onClick={() => setFile(null)} disabled={isUploading}>
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </Paper>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="inherit" disabled={isUploading}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="contained" color="primary" disabled={isUploading || !file}>
                        Upload Version
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
