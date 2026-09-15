import React, { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Button,
    Stack,
    Typography,
    Tooltip,
    Box,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DownloadIcon from "@mui/icons-material/Download";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import Link from "next/link";

import { useEmployeeDocuments, useAttachEmployeeDocument, useDetachEmployeeDocument } from "@/hooks/useEmployeeDocuments";
import { useDownloadDocument } from "@/hooks/useDocument";
import { Document } from "@/services/documentService";
import FileIcon from "@/components/documents/FileIcon";
import FileSizeChip from "@/components/documents/FileSizeChip";
import CategoryChip from "@/components/documents/CategoryChip";
import TagChip from "@/components/documents/TagChip";
import AttachDocumentDialog from "@/components/employees/AttachDocumentDialog";
import ConfirmDialog from "@/components/common/ConfirmDialog";

interface EmployeeDocumentsTabProps {
    employeeId: number;
}

export default function EmployeeDocumentsTab({ employeeId }: EmployeeDocumentsTabProps) {
    const [attachDialogOpen, setAttachDialogOpen] = useState(false);
    const [detachTarget, setDetachTarget] = useState<Document | null>(null);

    const { data: documents = [], isLoading, refetch } = useEmployeeDocuments(employeeId);
    const attachMutation = useAttachEmployeeDocument();
    const detachMutation = useDetachEmployeeDocument();
    const downloadMutation = useDownloadDocument();

    const handleAttachSubmit = (data: { document_id: number; note: string }) => {
        attachMutation.mutate(
            { employeeId, data },
            {
                onSuccess: () => {
                    setAttachDialogOpen(false);
                    refetch();
                },
            }
        );
    };

    const handleConfirmDetach = () => {
        if (detachTarget) {
            detachMutation.mutate(
                { employeeId, documentId: detachTarget.id },
                {
                    onSuccess: () => {
                        setDetachTarget(null);
                        refetch();
                    },
                }
            );
        }
    };

    const handleDownload = (doc: Document) => {
        downloadMutation.mutate({ id: doc.id, fileName: doc.file_name });
    };

    return (
        <Box>
            <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Attached Documents
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => setAttachDialogOpen(true)}
                >
                    Attach Document
                </Button>
            </Stack>

            <TableContainer component={Paper} sx={{ borderRadius: "12px", border: "1px solid", borderColor: "divider", boxShadow: "none" }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Document</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Size</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Note</TableCell>
                            <TableCell sx={{ fontWeight: 600, textAlign: "right" }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                    <Typography variant="body2" color="text.secondary">Loading documents...</Typography>
                                </TableCell>
                            </TableRow>
                        ) : documents.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                    <Typography color="text.secondary" variant="body2">
                                        No documents attached to this employee.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            documents.map((doc) => (
                                <TableRow key={doc.id} hover>
                                    <TableCell>
                                        <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
                                            <Box sx={{ mt: 0.5 }}>
                                                <FileIcon extension={doc.extension} mimeType={doc.mime_type} />
                                            </Box>
                                            <Box>
                                                <Typography
                                                    component={Link}
                                                    href={`/tenant/documents/${doc.id}`}
                                                    variant="body2"
                                                    sx={{
                                                        fontWeight: 600,
                                                        cursor: "pointer",
                                                        textDecoration: "none",
                                                        color: "text.primary",
                                                        "&:hover": { textDecoration: "underline", color: "primary.main" }
                                                    }}
                                                >
                                                    {doc.title}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                                                    {doc.file_name}
                                                </Typography>
                                                {doc.tags && doc.tags.length > 0 && (
                                                    <Stack direction="row" spacing={0.5} useFlexGap sx={{ flexWrap: "wrap", mt: 0.5 }}>
                                                        {doc.tags.map((t) => <TagChip key={t.id} name={t.name} />)}
                                                    </Stack>
                                                )}
                                            </Box>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        {doc.category ? (
                                            <CategoryChip name={doc.category.name} />
                                        ) : (
                                            <Typography variant="caption" color="text.secondary">-</Typography>
                                        )}
                                    </TableCell>

                                    <TableCell>
                                        <FileSizeChip bytes={doc.size} />
                                    </TableCell>
                                    <TableCell sx={{ color: "text.secondary", maxWidth: 250, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                                        {(doc as any).pivot?.note || <Typography variant="caption" sx={{ fontStyle: "italic", color: "text.disabled" }}>No note</Typography>}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Stack direction="row" spacing={0.5} sx={{ justifyContent: "flex-end" }}>
                                            <Tooltip title="Download">
                                                <IconButton size="small" onClick={() => handleDownload(doc)}>
                                                    <DownloadIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Detach Document">
                                                <IconButton size="small" color="error" onClick={() => setDetachTarget(doc)}>
                                                    <LinkOffIcon fontSize="small" />
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

            {/* Attach Dialog */}
            <AttachDocumentDialog
                open={attachDialogOpen}
                onClose={() => setAttachDialogOpen(false)}
                onSubmit={handleAttachSubmit}
                isAttaching={attachMutation.isPending}
            />

            {/* Detach Confirm Dialog */}
            <ConfirmDialog
                open={Boolean(detachTarget)}
                title="Detach Document?"
                message={`Are you sure you want to detach "${detachTarget?.title}" from this employee? The document will not be deleted from the system.`}
                onCancel={() => setDetachTarget(null)}
                onConfirm={handleConfirmDetach}
                destructive
            />
        </Box>
    );
}
