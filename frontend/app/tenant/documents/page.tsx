"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import CategoryIcon from "@mui/icons-material/Category";
import AuthenticatedLayout from "@/layouts/AuthenticatedLayout";
import {
    Typography,
    Button,
    Stack,
    Box,
    CircularProgress,
    Grid,
    Paper,
    TextField,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    SelectChangeEvent,
    Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useRouter } from "next/navigation";
import AddIcon from "@mui/icons-material/Add";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import RefreshIcon from "@mui/icons-material/Refresh";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

// Hooks
import {
    useFolderTree,
    useCreateFolder,
    useUpdateFolder,
    useDeleteFolder,
} from "@/hooks/useFolders";
import {
    useDocuments,
    useDeleteDocument,
    useDownloadDocument,
    useUploadDocument,
    useMoveDocument,
    useCopyDocument,
    useUpdateDocument,
} from "@/hooks/useDocument";
import { useDocumentCategories } from "@/hooks/useDocumentCategories";

// Services/Types
import { Folder } from "@/services/folderService";
import { Document } from "@/services/documentService";

// Components
import FolderTree from "@/components/documents/FolderTree";
import FolderDialog from "@/components/documents/FolderDialog";
import DeleteFolderDialog from "@/components/documents/DeleteFolderDialog";
import DocumentBreadcrumb, { BreadcrumbFolder } from "@/components/documents/DocumentBreadcrumb";
import DocumentsTable from "@/components/documents/DocumentsTable";
import UploadDialog from "@/components/documents/UploadDialog";
import MoveDialog from "@/components/documents/MoveDialog";
import DeleteDocumentDialog from "@/components/documents/DeleteDocumentDialog";
import DocumentSearch, { SearchFilters } from "@/components/documents/DocumentSearch";
import ErrorState from "@/components/common/ErrorState";
import EditDocumentDialog from "@/components/documents/EditDocumentDialog";

export default function DocumentsPage() {
    const router = useRouter();
    const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
    const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Folder dialog states
    const [folderDialogOpen, setFolderDialogOpen] = useState(false);
    const [editFolderTarget, setEditFolderTarget] = useState<Folder | null>(null);
    const [deleteFolderTarget, setDeleteFolderTarget] = useState<Folder | null>(null);
    const [defaultParentId, setDefaultParentId] = useState<number | null>(null);

    // Document dialog/action states
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [moveDialogTarget, setMoveDialogTarget] = useState<Document | null>(null);
    const [copyDialogTarget, setCopyDialogTarget] = useState<Document | null>(null);
    const [deleteDocTarget, setDeleteDocTarget] = useState<Document | null>(null);
    const [editDocTarget, setEditDocTarget] = useState<Document | null>(null);
    const [page, setPage] = useState(1);

    // Fetch API Data using hooks
    const { data: folderTree = [], isLoading: foldersLoading, error: foldersError, refetch: refetchFolders } = useFolderTree();
    const { data: categories = [], isLoading: categoriesLoading } = useDocumentCategories();
    const { data: documentsData, isLoading: documentsLoading, error: documentsError, refetch: refetchDocuments } = useDocuments({
        folder_id: searchFilters.folder_id !== undefined ? searchFilters.folder_id : selectedFolderId,
        q: searchFilters.q,
        category_id: searchFilters.category_id || undefined,
        extension: searchFilters.extension,
        date_from: searchFilters.date_from,
        date_to: searchFilters.date_to,
        page: page,
        per_page: 10,
    });

    // Mutations
    const createFolderMutation = useCreateFolder();
    const updateFolderMutation = useUpdateFolder();
    const deleteFolderMutation = useDeleteFolder();
    const uploadDocumentMutation = useUploadDocument();
    const deleteDocumentMutation = useDeleteDocument();
    const downloadDocumentMutation = useDownloadDocument();
    const moveDocumentMutation = useMoveDocument();
    const copyDocumentMutation = useCopyDocument();
    const updateDocumentMutation = useUpdateDocument();

    // Create flat list of folders for parent folder dropdown selectors
    const flatFolderList = useMemo(() => {
        const list: Folder[] = [];
        const traverse = (nodes: Folder[]) => {
            nodes.forEach((node) => {
                list.push(node);
                if (node.children) traverse(node.children);
            });
        };
        traverse(folderTree);
        return list;
    }, [folderTree]);

    // Find active folder details
    const activeFolder = useMemo(() => {
        if (selectedFolderId === null) return null;
        return flatFolderList.find((f) => f.id === selectedFolderId) || null;
    }, [selectedFolderId, flatFolderList]);

    // Generate breadcrumb chain
    const breadcrumbChain = useMemo(() => {
        if (!selectedFolderId || flatFolderList.length === 0) return [];
        const chain: BreadcrumbFolder[] = [];
        let current = flatFolderList.find((f) => f.id === selectedFolderId);

        while (current) {
            chain.unshift({ id: current.id, name: current.name });
            const parentId = current.parent_id;
            current = parentId ? flatFolderList.find((f) => f.id === parentId) : undefined;
        }
        return chain;
    }, [selectedFolderId, flatFolderList]);

    // Folder Actions
    const handleOpenCreateFolder = (parentId: number | null) => {
        setEditFolderTarget(null);
        setDefaultParentId(parentId);
        setFolderDialogOpen(true);
    };

    const handleOpenRenameFolder = (folder: Folder) => {
        setEditFolderTarget(folder);
        setFolderDialogOpen(true);
    };

    const handleFolderSubmit = (data: { name: string; description: string; parent_id: number | null }) => {
        if (editFolderTarget) {
            updateFolderMutation.mutate(
                { id: editFolderTarget.id, data },
                {
                    onSuccess: () => {
                        setFolderDialogOpen(false);
                        refetchFolders();
                    },
                }
            );
        } else {
            createFolderMutation.mutate(data, {
                onSuccess: () => {
                    setFolderDialogOpen(false);
                    refetchFolders();
                },
            });
        }
    };

    const handleConfirmDeleteFolder = (force?: boolean) => {
        if (deleteFolderTarget) {
            deleteFolderMutation.mutate({ id: deleteFolderTarget.id, force }, {
                onSuccess: () => {
                    setDeleteFolderTarget(null);
                    setSelectedFolderId(null);
                    refetchFolders();
                },
            });
        }
    };

    // Document Actions
    const handleUploadSubmit = (formData: FormData) => {
        uploadDocumentMutation.mutate(formData, {
            onSuccess: () => {
                setUploadDialogOpen(false);
                refetchDocuments();
            },
        });
    };

    const handleConfirmDeleteDoc = () => {
        if (deleteDocTarget) {
            deleteDocumentMutation.mutate(deleteDocTarget.id, {
                onSuccess: () => {
                    setDeleteDocTarget(null);
                    refetchDocuments();
                },
            });
        }
    };

    const handleConfirmMoveDoc = (targetId: number | null) => {
        if (moveDialogTarget) {
            moveDocumentMutation.mutate(
                { id: moveDialogTarget.id, folderId: targetId },
                {
                    onSuccess: () => {
                        setMoveDialogTarget(null);
                        refetchDocuments();
                    },
                }
            );
        }
    };

    const handleConfirmCopyDoc = (targetId: number | null) => {
        if (copyDialogTarget) {
            copyDocumentMutation.mutate(
                { id: copyDialogTarget.id, folderId: targetId },
                {
                    onSuccess: () => {
                        setCopyDialogTarget(null);
                        refetchDocuments();
                    },
                }
            );
        }
    };

    const handleDownloadDocument = (doc: Document) => {
        downloadDocumentMutation.mutate({ id: doc.id, fileName: doc.file_name });
    };

    const handleEditDocSubmit = (data: { title: string; description: string; tags: string[] }) => {
        if (editDocTarget) {
            updateDocumentMutation.mutate(
                { id: editDocTarget.id, data: { title: data.title, description: data.description, tags: data.tags } },
                {
                    onSuccess: () => {
                        setEditDocTarget(null);
                        refetchDocuments();
                    },
                }
            );
        }
    };


    const handleRefresh = () => {
        refetchFolders();
        refetchDocuments();
    };


    const handleVersionsClick = (doc: Document) => {
        router.push(`/tenant/documents/${doc.id}/versions`);
    };

    return (
        <AuthenticatedLayout>
            <Stack spacing={3}>
                {/* Top Header */}
                <Stack spacing={2}>
                    <Stack
                        sx={{
                            flexDirection: { xs: "column", md: "row" },
                            justifyContent: "space-between",
                            alignItems: { xs: "flex-start", md: "center" },
                            flexWrap: "wrap",
                            rowGap: 2,
                        }}>
                        <Stack spacing={0.5}>
                            <Typography variant="h4" sx={{ fontWeight: 600 }}>
                                Documents
                            </Typography>
                            {breadcrumbChain.length > 0 && (
                                <DocumentBreadcrumb folders={breadcrumbChain} onFolderClick={setSelectedFolderId} />
                            )}
                        </Stack>

                        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", rowGap: 1 }}>
                            <Button
                                variant="outlined"
                                color="inherit"
                                size="small"
                                startIcon={<RefreshIcon />}
                                onClick={handleRefresh}
                                sx={{ borderColor: "divider" }}
                            >
                                Refresh
                            </Button>
                            <Button
                                component={Link}
                                href="/tenant/documents/categories"
                                variant="outlined"
                                color="inherit"
                                size="small"
                                startIcon={<CategoryIcon />}
                                sx={{ borderColor: "divider" }}
                            >
                                Categories
                            </Button>
                            <Button
                                variant="outlined"
                                color="primary"
                                size="small"
                                startIcon={<CreateNewFolderIcon />}
                                onClick={() => handleOpenCreateFolder(selectedFolderId)}
                            >
                                New Folder
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                startIcon={<AddIcon />}
                                onClick={() => setUploadDialogOpen(true)}
                            >
                                Upload File
                            </Button>
                        </Stack>
                    </Stack>
                    <Divider />
                </Stack>

                {foldersError || documentsError ? (
                    <ErrorState message="You are not authorized to view document repository." />
                ) : (
                    <Grid container spacing={3}>
                        {/* Sidebar Folder Navigation */}
                        {sidebarOpen && (
                            <Grid size={{ xs: 12, md: 3 }}>
                                <Paper
                                    sx={{
                                        p: 2.5,
                                        height: "100%",
                                        minHeight: "450px",
                                        borderRadius: "12px",
                                        border: "1px solid",
                                        borderColor: "divider",
                                        boxShadow: "none",
                                    }}
                                >
                                    {foldersLoading ? (
                                        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
                                            <CircularProgress size={30} />
                                        </Box>
                                    ) : (
                                        <FolderTree
                                            folders={folderTree}
                                            selectedFolderId={selectedFolderId}
                                            onSelectFolder={setSelectedFolderId}
                                            onCreateFolder={handleOpenCreateFolder}
                                            onRenameFolder={handleOpenRenameFolder}
                                            onDeleteFolder={setDeleteFolderTarget}
                                        />
                                    )}
                                </Paper>
                            </Grid>
                        )}

                        {/* Document Listing Panel */}
                        <Grid size={{ xs: 12, md: sidebarOpen ? 9 : 12 }}>
                            <Paper
                                sx={{
                                    p: 3,
                                    borderRadius: "12px",
                                    border: "1px solid",
                                    borderColor: "divider",
                                    boxShadow: "none",
                                }}
                            >

                                <DocumentSearch
                                    filters={searchFilters}
                                    onFiltersChange={(newFilters) => {
                                        setSearchFilters(newFilters);
                                        setPage(1); // Reset page on filter change
                                    }}
                                    folders={flatFolderList}
                                    categories={categories}
                                />
                                <Button
                                    variant="text"
                                    onClick={() => setSidebarOpen(!sidebarOpen)}
                                    startIcon={sidebarOpen ? <ArrowBackIcon /> : null}
                                    sx={{ color: "text.secondary", mb: 2 }}
                                >
                                    {sidebarOpen ? "Hide Folders" : "Show Folders"}
                                </Button>


                                {/* Documents Table */}
                                {documentsLoading ? (
                                    <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                                        <CircularProgress />
                                    </Box>
                                ) : (
                                    <DocumentsTable
                                        documents={documentsData?.items || []}
                                        total={documentsData?.pagination?.total || 0}
                                        page={page}
                                        perPage={10}
                                        onPageChange={setPage}
                                        onDownload={handleDownloadDocument}
                                        onEdit={setEditDocTarget}
                                        onMove={setMoveDialogTarget}
                                        onCopy={setCopyDialogTarget}
                                        onDelete={setDeleteDocTarget}
                                        onVersions={handleVersionsClick}
                                    />
                                )}
                            </Paper>
                        </Grid>
                    </Grid>
                )}
            </Stack>

            {/* Folder Dialog */}
            <FolderDialog
                open={folderDialogOpen}
                onClose={() => setFolderDialogOpen(false)}
                onSubmit={handleFolderSubmit}
                folderList={flatFolderList}
                editFolder={editFolderTarget}
                defaultParentId={defaultParentId}
            />

            {/* Delete Folder Dialog */}
            <DeleteFolderDialog
                open={Boolean(deleteFolderTarget)}
                folder={deleteFolderTarget}
                onClose={() => setDeleteFolderTarget(null)}
                onConfirm={handleConfirmDeleteFolder}
            />

            {/* Upload Document Dialog */}
            <UploadDialog
                open={uploadDialogOpen}
                onClose={() => setUploadDialogOpen(false)}
                onSubmit={handleUploadSubmit}
                folders={flatFolderList}
                categories={categories}
                defaultFolderId={selectedFolderId}
                isUploading={uploadDocumentMutation.isPending}
            />

            {/* Move Document Dialog */}
            <MoveDialog
                open={Boolean(moveDialogTarget)}
                document={moveDialogTarget}
                folders={flatFolderList}
                onClose={() => setMoveDialogTarget(null)}
                onConfirm={handleConfirmMoveDoc}
            />

            {/* Copy Document Dialog */}
            <MoveDialog
                open={Boolean(copyDialogTarget)}
                document={copyDialogTarget}
                folders={flatFolderList}
                onClose={() => setCopyDialogTarget(null)}
                onConfirm={handleConfirmCopyDoc}
                isCopy
            />

            {/* Delete Document Dialog */}
            <DeleteDocumentDialog
                open={Boolean(deleteDocTarget)}
                document={deleteDocTarget}
                onClose={() => setDeleteDocTarget(null)}
                onConfirm={handleConfirmDeleteDoc}
            />

            {/* Edit Document Dialog */}
            <EditDocumentDialog
                open={Boolean(editDocTarget)}
                onClose={() => setEditDocTarget(null)}
                onSubmit={handleEditDocSubmit}
                document={editDocTarget}
            />
        </AuthenticatedLayout>
    );
}