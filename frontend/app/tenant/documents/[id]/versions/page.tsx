"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AuthenticatedLayout from "@/layouts/AuthenticatedLayout";
import {
    Box,
    Typography,
    Button,
    CircularProgress,
    Stack,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

// Hooks
import { useDocument } from "@/hooks/useDocument";
import {
    useDocumentVersions,
    useUploadVersion,
    useRestoreVersion,
    useDownloadVersion,
} from "@/hooks/useDocumentVersions";

// Components
import VersionsTable from "@/components/documents/VersionsTable";
import UploadVersionDialog from "@/components/documents/UploadVersionDialog";
import RestoreVersionDialog from "@/components/documents/RestoreVersionDialog";
import ErrorState from "@/components/common/ErrorState";
import { DocumentVersion } from "@/services/documentVersionService";

export default function DocumentVersionsPage() {
    const params = useParams();
    const router = useRouter();
    const documentId = Number(params.id);

    const [uploadOpen, setUploadOpen] = useState(false);
    const [restoreTarget, setRestoreTarget] = useState<DocumentVersion | null>(null);

    const { data: document, isLoading: docLoading, error: docError, refetch: refetchDoc } = useDocument(documentId);
    const { data: versionsData, isLoading: versionsLoading, error: versionsError, refetch: refetchVersions } = useDocumentVersions(documentId);

    const uploadMutation = useUploadVersion();
    const restoreMutation = useRestoreVersion();
    const downloadMutation = useDownloadVersion();

    const handleUploadSubmit = (file: File) => {
        const formData = new FormData();
        formData.append("file", file);

        uploadMutation.mutate(
            { documentId, formData },
            {
                onSuccess: () => {
                    setUploadOpen(false);
                    refetchDoc();
                    refetchVersions();
                },
            }
        );
    };

    const handleConfirmRestore = () => {
        if (restoreTarget) {
            restoreMutation.mutate(
                { documentId, versionId: restoreTarget.id },
                {
                    onSuccess: () => {
                        setRestoreTarget(null);
                        refetchDoc();
                        refetchVersions();
                    },
                }
            );
        }
    };

    const handleDownloadVersion = (version: DocumentVersion) => {
        downloadMutation.mutate({
            documentId,
            versionId: version.id,
            fileName: version.file_name,
        });
    };

    const isLoading = docLoading || versionsLoading;
    const hasError = docError || versionsError || !document;

    if (isLoading) {
        return (
            <AuthenticatedLayout>
                <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
                    <CircularProgress />
                </Box>
            </AuthenticatedLayout>
        );
    }

    if (hasError) {
        return (
            <AuthenticatedLayout>
                <ErrorState message="Document not found or you are not authorized to view its version history." />
            </AuthenticatedLayout>
        );
    }

    const versions = (versionsData as any)?.items || (Array.isArray(versionsData) ? versionsData : []);

    return (
        <AuthenticatedLayout>
            <Stack spacing={3}>
                {/* Navigation & Title */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
                    <Stack spacing={0.5}>
                        <Button
                            startIcon={<ArrowBackIcon />}
                            onClick={() => router.back()}
                            size="small"
                            sx={{ color: "text.secondary", alignSelf: "flex-start", p: 0, textTransform: "none", mb: 1 }}
                        >
                            Back to Document Details
                        </Button>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                            Version History
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Review history and restore previous versions of <strong>"{document.title}"</strong>
                        </Typography>
                    </Stack>

                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<CloudUploadIcon />}
                        onClick={() => setUploadOpen(true)}
                    >
                        Upload New Version
                    </Button>
                </Box>

                {/* Versions Table */}
                <VersionsTable
                    versions={versions}
                    currentVersion={document.current_version}
                    onDownload={handleDownloadVersion}
                    onRestore={setRestoreTarget}
                />
            </Stack>

            {/* Upload Dialog */}
            <UploadVersionDialog
                open={uploadOpen}
                onClose={() => setUploadOpen(false)}
                onSubmit={handleUploadSubmit}
                currentVersion={document.current_version}
                isUploading={uploadMutation.isPending}
            />

            {/* Restore Confirmation Dialog */}
            <RestoreVersionDialog
                open={Boolean(restoreTarget)}
                version={restoreTarget}
                currentVersion={document.current_version}
                onClose={() => setRestoreTarget(null)}
                onConfirm={handleConfirmRestore}
            />
        </AuthenticatedLayout >
    );
}
