"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import AuthenticatedLayout from "@/layouts/AuthenticatedLayout";
import {
    Box,
    Typography,
    Button,
    Grid,
    Paper,
    Stack,
    CircularProgress,
    Divider,
    List,
    ListItem,
    ListItemText,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import HistoryIcon from "@mui/icons-material/History";
import PersonIcon from "@mui/icons-material/Person";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

// Hooks
import { useDocument, useUpdateDocument, useDownloadDocument } from "@/hooks/useDocument";
import { useFolderTree } from "@/hooks/useFolders";
import { useUploadVersion } from "@/hooks/useDocumentVersions";

// Components
import PreviewPanel from "@/components/documents/PreviewPanel";
import EditDocumentDialog from "@/components/documents/EditDocumentDialog";
import UploadVersionDialog from "@/components/documents/UploadVersionDialog";
import CategoryChip from "@/components/documents/CategoryChip";
import TagChip from "@/components/documents/TagChip";
import VersionBadge from "@/components/documents/VersionBadge";
import FileSizeChip from "@/components/documents/FileSizeChip";
import DocumentBreadcrumb from "@/components/documents/DocumentBreadcrumb";
import ErrorState from "@/components/common/ErrorState";

export default function DocumentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const documentId = Number(params.id);

    const [editOpen, setEditOpen] = useState(false);
    const [uploadVersionOpen, setUploadVersionOpen] = useState(false);

    const { data: document, isLoading, error, refetch } = useDocument(documentId);
    const updateMutation = useUpdateDocument();
    const downloadMutation = useDownloadDocument();
    const uploadVersionMutation = useUploadVersion();

    // Load folder tree to generate folder chain breadcrumbs
    const { data: folderTree = [] } = useFolderTree();

    const flatFolderList = useMemo(() => {
        const list: any[] = [];
        const traverse = (nodes: any[]) => {
            nodes.forEach((node) => {
                list.push(node);
                if (node.children) traverse(node.children);
            });
        };
        traverse(folderTree);
        return list;
    }, [folderTree]);

    const folderBreadcrumbs = useMemo(() => {
        if (!document?.folder_id || flatFolderList.length === 0) return [];
        const chain: any[] = [];
        let current = flatFolderList.find((f) => f.id === document.folder_id);

        while (current) {
            chain.unshift({ id: current.id, name: current.name });
            const parentId = current.parent_id;
            current = parentId ? flatFolderList.find((f) => f.id === parentId) : undefined;
        }
        return chain;
    }, [document?.folder_id, flatFolderList]);

    const handleDownload = () => {
        if (document) {
            downloadMutation.mutate({ id: document.id, fileName: document.file_name });
        }
    };

    const handleEditSubmit = (data: { title: string; description: string; tags: string[] }) => {
        updateMutation.mutate(
            {
                id: documentId,
                data: {
                    title: data.title,
                    description: data.description,
                    tags: data.tags
                },
            },
            {
                onSuccess: () => {
                    setEditOpen(false);
                    refetch();
                },
            }
        );
    };

    const handleUploadVersionSubmit = (file: File) => {
        const formData = new FormData();
        formData.append("file", file);

        uploadVersionMutation.mutate(
            { documentId, formData },
            {
                onSuccess: () => {
                    setUploadVersionOpen(false);
                    refetch();
                },
            }
        );
    };



    if (isLoading) {
        return (
            <AuthenticatedLayout>
                <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
                    <CircularProgress />
                </Box>
            </AuthenticatedLayout>
        );
    }

    if (error || !document) {
        return (
            <AuthenticatedLayout>
                <ErrorState message="Document not found or you do not have permission to view it." />
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout>
            <Stack spacing={3}>
                {/* Breadcrumb & Navigation */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
                    <Stack spacing={0.5}>
                        <Button
                            startIcon={<ArrowBackIcon />}
                            onClick={() => router.back()}
                            size="small"
                            sx={{ color: "text.secondary", alignSelf: "flex-start", p: 0, textTransform: "none", mb: 1 }}
                        >
                            Back
                        </Button>
                        <DocumentBreadcrumb
                            folders={folderBreadcrumbs}
                            onFolderClick={(folderId) => router.push(`/tenant/documents?folder_id=${folderId}`)}
                        />
                        <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
                            {document.title}
                        </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1.5}>
                        <Button variant="outlined" startIcon={<CloudUploadIcon />} onClick={() => setUploadVersionOpen(true)}>
                            New Version
                        </Button>
                        <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setEditOpen(true)}>
                            Edit Info
                        </Button>
                        <Button variant="contained" startIcon={<DownloadIcon />} onClick={handleDownload}>
                            Download
                        </Button>
                    </Stack>
                </Box>

                <Grid container spacing={3}>
                    {/* Left Panel: Preview */}
                    <Grid size={{ xs: 12, md: 8 }}>
                        <PreviewPanel
                            documentId={document.id}
                            fileName={document.file_name}
                            mimeType={document.mime_type}
                            extension={document.extension}
                            onDownload={handleDownload}
                        />
                    </Grid>

                    {/* Right Panel: Metadata & Actions */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 3,
                                borderRadius: "12px",
                                borderColor: "divider",
                            }}
                        >
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2.5 }}>
                                Document Information
                            </Typography>

                            <Stack spacing={2.5}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                                        Original Filename
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 500, wordBreak: "break-all" }}>
                                        {document.file_name}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                                        File Details
                                    </Typography>
                                    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                                        <Typography variant="body2" sx={{ textTransform: "uppercase", fontWeight: 600 }}>
                                            {document.extension}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">•</Typography>
                                        <FileSizeChip bytes={document.size} />
                                    </Stack>
                                </Box>

                                <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                                        Category
                                    </Typography>
                                    {document.category ? (
                                        <CategoryChip name={document.category.name} />
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">Uncategorized</Typography>
                                    )}
                                </Box>

                                <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                                        Tags
                                    </Typography>
                                    <Stack direction="row" spacing={0.5} useFlexGap={true} sx={{ flexWrap: "wrap" }}>
                                        {document.tags && document.tags.length > 0 ? (
                                            document.tags.map((t: any) => <TagChip key={t.id} name={t.name} />)
                                        ) : (
                                            <Typography variant="caption" color="text.secondary">No tags</Typography>
                                        )}
                                    </Stack>
                                </Box>

                                <Divider />

                                <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                                        Uploaded By
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {document.uploader?.name || "System"}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                                        {new Date(document.created_at).toLocaleString()}
                                    </Typography>
                                </Box>

                                <Divider />

                                <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                                        Current Version
                                    </Typography>
                                    <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                                        <VersionBadge version={document.current_version} />
                                        <Button
                                            size="small"
                                            startIcon={<HistoryIcon />}
                                            onClick={() => router.push(`/tenant/documents/${document.id}/versions`)}
                                            sx={{ textTransform: "none", p: 0, fontWeight: 500 }}
                                        >
                                            View History
                                        </Button>
                                    </Stack>
                                </Box>

                                <Divider />

                                <Box>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                                        Linked Employees
                                    </Typography>
                                    {document.employees && document.employees.length > 0 ? (
                                        <List dense disablePadding>
                                            {document.employees.map((emp: any) => (
                                                <ListItem key={emp.id} disableGutters sx={{ py: 0.5 }}>
                                                    <PersonIcon sx={{ fontSize: "1.1rem", color: "text.secondary", mr: 1 }} />
                                                    <ListItemText
                                                        primary={`${emp.first_name} ${emp.last_name}`}
                                                        slotProps={{
                                                            primary: { variant: "body2", sx: { fontWeight: 500 } },
                                                            secondary: { variant: "caption", sx: { color: "text.secondary" } }
                                                        }}
                                                        secondary={emp.pivot?.note}
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    ) : (
                                        <Typography variant="caption" color="text.secondary">
                                            Not linked to any employees.
                                        </Typography>
                                    )}
                                </Box>
                            </Stack>
                        </Paper>
                    </Grid>
                </Grid>
            </Stack>

            {/* Edit Info Dialog */}
            <EditDocumentDialog
                open={editOpen}
                onClose={() => setEditOpen(false)}
                onSubmit={handleEditSubmit}
                document={document}
            />
            {/* Upload Version Dialog */}
            <UploadVersionDialog
                open={uploadVersionOpen}
                onClose={() => setUploadVersionOpen(false)}
                onSubmit={handleUploadVersionSubmit}
                currentVersion={document.current_version}
                isUploading={uploadVersionMutation.isPending}
            />

        </AuthenticatedLayout>
    );
}
