"use client";

import React, { useState } from "react";
import AuthenticatedLayout from "@/layouts/AuthenticatedLayout";
import {
    Typography,
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    IconButton,
    CircularProgress,
    Stack,
    Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";

// Hooks
import {
    useDocumentCategories,
    useCreateDocumentCategory,
    useUpdateDocumentCategory,
    useDeleteDocumentCategory,
} from "@/hooks/useDocumentCategories";

// Services/Types
import { DocumentCategory } from "@/services/categoryService";

// Components
import CategoryDialog from "@/components/documents/CategoryDialog";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import ErrorState from "@/components/common/ErrorState";

export default function DocumentCategoriesPage() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | null>(null);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<DocumentCategory | null>(null);

    // Queries
    const { data: categories = [], isLoading, error, refetch } = useDocumentCategories();

    // Mutations
    const createMutation = useCreateDocumentCategory();
    const updateMutation = useUpdateDocumentCategory();
    const deleteMutation = useDeleteDocumentCategory();

    const handleOpenCreate = () => {
        setSelectedCategory(null);
        setDialogOpen(true);
    };

    const handleOpenEdit = (category: DocumentCategory) => {
        setSelectedCategory(category);
        setDialogOpen(true);
    };

    const handleDialogSubmit = (values: { name: string; description: string }) => {
        if (selectedCategory) {
            updateMutation.mutate(
                { id: selectedCategory.id, data: values },
                {
                    onSuccess: () => {
                        setDialogOpen(false);
                        refetch();
                    },
                }
            );
        } else {
            createMutation.mutate(values, {
                onSuccess: () => {
                    setDialogOpen(false);
                    refetch();
                },
            });
        }
    };

    const handleOpenDelete = (category: DocumentCategory) => {
        setCategoryToDelete(category);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (categoryToDelete) {
            deleteMutation.mutate(categoryToDelete.id, {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    refetch();
                },
                onError: (err: any) => {
                    alert(err?.response?.data?.message || "Failed to delete category.");
                    setDeleteDialogOpen(false);
                },
            });
        }
    };

    return (
        <AuthenticatedLayout>
            <Stack spacing={3}>
                {/* Top Header */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Stack spacing={0.5}>
                        <Typography variant="h4" sx={{ fontWeight: 600 }}>
                            Document Categories
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Button
                                component={Link}
                                href="/tenant/documents"
                                startIcon={<ArrowBackIcon />}
                                size="small"
                                sx={{ color: "text.secondary", p: 0, textTransform: "none" }}
                            >
                                Back to Documents
                            </Button>
                        </Box>
                    </Stack>

                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleOpenCreate}
                    >
                        New Category
                    </Button>
                </Box>

                {error ? (
                    <ErrorState message="You are not authorized to view document categories." />
                ) : isLoading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <TableContainer component={Paper} sx={{ borderRadius: "12px", border: "1px solid", borderColor: "divider", boxShadow: "none" }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600 }}>Category Name</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Documents Count</TableCell>
                                    <TableCell sx={{ fontWeight: 600, textAlign: "right" }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {categories.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                                            <Typography color="text.secondary" variant="body2">
                                                No categories found. Create a new one to get started.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    categories.map((cat: DocumentCategory) => (
                                        <TableRow key={cat.id} hover>
                                            <TableCell sx={{ fontWeight: 500 }}>{cat.name}</TableCell>
                                            <TableCell sx={{ color: "text.secondary" }}>
                                                {cat.description || <Typography variant="caption" sx={{ fontStyle: "italic", color: "text.disabled" }}>No description</Typography>}
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>
                                                {cat.documents_count ?? 0}
                                            </TableCell>
                                            <TableCell align="right">
                                                <Stack direction="row" spacing={0.5} sx={{ justifyContent: "flex-end" }}>
                                                    <Tooltip title="Edit">
                                                        <IconButton size="small" onClick={() => handleOpenEdit(cat)}>
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete">
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() => handleOpenDelete(cat)}
                                                            disabled={!!cat.documents_count && cat.documents_count > 0}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Stack>

            {/* Category Dialog */}
            <CategoryDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onSubmit={handleDialogSubmit}
                editCategory={selectedCategory}
            />

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={deleteDialogOpen}
                title="Delete Category?"
                message={`Are you sure you want to delete the category "${categoryToDelete?.name}"? This action cannot be undone.`}
                onCancel={() => setDeleteDialogOpen(false)}
                onConfirm={handleConfirmDelete}
            />

        </AuthenticatedLayout>
    );
}
