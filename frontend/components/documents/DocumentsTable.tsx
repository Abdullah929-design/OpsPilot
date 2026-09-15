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
    Stack,
    Typography,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    TablePagination,
    Box,
    Tooltip,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Link from "next/link";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import DriveFileMoveIcon from "@mui/icons-material/DriveFileMove";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import HistoryIcon from "@mui/icons-material/History";

import { Document } from "@/services/documentService";
import FileIcon from "./FileIcon";
import FileSizeChip from "./FileSizeChip";
import CategoryChip from "./CategoryChip";
import TagChip from "./TagChip";
import VersionBadge from "./VersionBadge";

interface DocumentsTableProps {
    documents: Document[];
    total: number;
    page: number;
    perPage: number;
    onPageChange: (page: number) => void;
    onDownload: (doc: Document) => void;
    onEdit: (doc: Document) => void;
    onMove: (doc: Document) => void;
    onCopy: (doc: Document) => void;
    onDelete: (doc: Document) => void;
    onVersions: (doc: Document) => void;
}

export default function DocumentsTable({
    documents,
    total,
    page,
    perPage,
    onPageChange,
    onDownload,
    onEdit,
    onMove,
    onCopy,
    onDelete,
    onVersions,
}: DocumentsTableProps) {
    const [menuAnchor, setMenuAnchor] = useState<{
        el: HTMLElement;
        doc: Document;
    } | null>(null);

    const handleMenuOpen = (e: React.MouseEvent, doc: Document) => {
        setMenuAnchor({ el: e.currentTarget as HTMLElement, doc });
    };

    const handleMenuClose = () => {
        setMenuAnchor(null);
    };

    const handleChangePage = (_: any, newPage: number) => {
        // MUI TablePagination is 0-indexed, our API is 1-indexed
        onPageChange(newPage + 1);
    };

    return (
        <TableContainer component={Paper} sx={{ borderRadius: "12px", border: "1px solid", borderColor: "divider", boxShadow: "none" }}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Document</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Size</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Version</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Uploaded</TableCell>
                        <TableCell sx={{ fontWeight: 600, textAlign: "right" }}>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {documents.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                                <Typography color="text.secondary" variant="body2">
                                    No documents in this folder.
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
                                        <Box>                                            <Typography
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
                                        <Typography variant="caption" color="text.secondary">
                                            -
                                        </Typography>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <FileSizeChip bytes={doc.size} />
                                </TableCell>
                                <TableCell>
                                    <VersionBadge version={doc.current_version} />
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        {doc.uploader?.name || "System"}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                                        {new Date(doc.created_at).toLocaleDateString()}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Stack direction="row" spacing={0.5} sx={{ justifyContent: "flex-end" }}>
                                        <Tooltip title="Download">
                                            <IconButton size="small" onClick={() => onDownload(doc)}>
                                                <DownloadIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, doc)}>
                                            <MoreVertIcon fontSize="small" />
                                        </IconButton>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
            <TablePagination
                component="div"
                count={total}
                page={page - 1} // Converting 1-based index to 0-based index
                rowsPerPage={perPage}
                onPageChange={handleChangePage}
                rowsPerPageOptions={[perPage]}
            />

            {/* Action Popover Menu */}
            <Menu
                anchorEl={menuAnchor?.el}
                open={Boolean(menuAnchor)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <MenuItem
                    onClick={() => {
                        if (menuAnchor) onEdit(menuAnchor.doc);
                        handleMenuClose();
                    }}
                >
                    <ListItemIcon>
                        <EditIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Rename / Edit" />
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        if (menuAnchor) onMove(menuAnchor.doc);
                        handleMenuClose();
                    }}
                >
                    <ListItemIcon>
                        <DriveFileMoveIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Move To" />
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        if (menuAnchor) onCopy(menuAnchor.doc);
                        handleMenuClose();
                    }}
                >
                    <ListItemIcon>
                        <ContentCopyIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Copy Document" />
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        if (menuAnchor) onVersions(menuAnchor.doc);
                        handleMenuClose();
                    }}
                >
                    <ListItemIcon>
                        <HistoryIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Version History" />
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        if (menuAnchor) onDelete(menuAnchor.doc);
                        handleMenuClose();
                    }}
                    sx={{ color: "error.main" }}
                >
                    <ListItemIcon sx={{ color: "error.main" }}>
                        <DeleteIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Delete" />
                </MenuItem>
            </Menu>
        </TableContainer>
    );
}