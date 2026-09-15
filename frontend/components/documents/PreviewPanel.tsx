import React, { useEffect, useState } from "react";
import { Box, Button, CircularProgress, Typography, Paper } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import apiClient from "@/services/apiClient";

interface PreviewPanelProps {
    documentId: number;
    fileName: string;
    mimeType: string;
    extension: string;
    onDownload: () => void;
}

export default function PreviewPanel({
    documentId,
    fileName,
    mimeType,
    extension,
    onDownload,
}: PreviewPanelProps) {
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isPdf = mimeType === "application/pdf" || extension.toLowerCase() === "pdf";
    const isImage = ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(mimeType) ||
        ["jpg", "jpeg", "png", "gif", "webp"].includes(extension.toLowerCase());

    const isOffice = ["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(extension.toLowerCase());

    const isPdfPreview = isPdf || isOffice;


    const canPreview = isPdf || isImage || isOffice;

    useEffect(() => {
        if (!canPreview) return;

        let active = true;
        let objectUrl: string | null = null;
        setIsLoading(true);
        setError(null);

        apiClient
            .get(`/v1/documents/${documentId}/preview`, { responseType: "blob" })
            .then((r) => {
                if (!active) return;
                objectUrl = URL.createObjectURL(r.data);
                setBlobUrl(objectUrl);
                setIsLoading(false);
            })
            .catch((err) => {
                if (!active) return;
                console.error("Failed to load document preview", err);
                setError("Unable to load preview.");
                setIsLoading(false);
            });

        return () => {
            active = false;
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [documentId, canPreview]); // eslint-disable-line react-hooks/exhaustive-deps


    if (!canPreview) {
        return (
            <Paper
                variant="outlined"
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 6,
                    height: "450px",
                    backgroundColor: "action.hover",
                    borderStyle: "dashed",
                }}
            >
                <InsertDriveFileIcon sx={{ fontSize: "4.5rem", color: "text.disabled", mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Preview Not Available
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mb: 3, maxWidth: 300 }}>
                    This file format ({extension.toUpperCase()}) cannot be previewed in the browser.
                </Typography>
                <Button variant="contained" startIcon={<DownloadIcon />} onClick={onDownload}>
                    Download File
                </Button>
            </Paper>
        );
    }

    if (isLoading) {
        return (
            <Paper
                variant="outlined"
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 6,
                    height: "450px",
                }}
            >
                <CircularProgress size={40} sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                    Loading file preview...
                </Typography>
            </Paper>
        );
    }

    if (error || !blobUrl) {
        return (
            <Paper
                variant="outlined"
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 6,
                    height: "450px",
                }}
            >
                <Typography variant="body1" color="error" sx={{ mb: 2 }}>
                    {error || "Failed to load preview."}
                </Typography>
                <Button variant="outlined" onClick={onDownload}>
                    Download to View
                </Button>
            </Paper>
        );
    }

    return (
        <Paper
            variant="outlined"
            sx={{
                overflow: "hidden",
                height: "550px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "grey.100",
            }}
        >
            {isPdfPreview ? (
                <iframe
                    src={blobUrl}
                    title={fileName}
                    width="100%"
                    height="100%"
                    style={{ border: "none" }}
                />
            ) : (
                <img
                    src={blobUrl}
                    alt={fileName}
                    style={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                    }}
                />
            )}
        </Paper>
    );
}
