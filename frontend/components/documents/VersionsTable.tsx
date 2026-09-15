import React from "react";
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
    Tooltip,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import RestoreIcon from "@mui/icons-material/SettingsBackupRestore";

import { DocumentVersion } from "@/services/documentVersionService";
import FileSizeChip from "./FileSizeChip";
import VersionBadge from "./VersionBadge";

interface VersionsTableProps {
    versions: DocumentVersion[];
    currentVersion: number;
    onDownload: (version: DocumentVersion) => void;
    onRestore: (version: DocumentVersion) => void;
}

export default function VersionsTable({
    versions,
    currentVersion,
    onDownload,
    onRestore,
}: VersionsTableProps) {
    return (
        <TableContainer component={Paper} sx={{ borderRadius: "12px", border: "1px solid", borderColor: "divider", boxShadow: "none" }}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Version</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>File Name</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Size</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Uploaded By</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 600, textAlign: "right" }}>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {versions.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                <Typography color="text.secondary" variant="body2">
                                    No version history found.
                                </Typography>
                            </TableCell>
                        </TableRow>
                    ) : (
                        versions.map((v) => {
                            const isCurrent = v.version === currentVersion;
                            return (
                                <TableRow key={v.id} hover sx={{ backgroundColor: isCurrent ? "action.selected" : "inherit" }}>
                                    <TableCell>
                                        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                                            <VersionBadge version={v.version} />
                                            {isCurrent && (
                                                <Typography variant="caption" color="primary" sx={{ fontWeight: 700 }}>
                                                    Active
                                                </Typography>
                                            )}
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: isCurrent ? 600 : 400 }}>
                                            {v.file_name}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <FileSizeChip bytes={v.size} />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {v.uploader?.name || "System"}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {new Date(v.created_at).toLocaleString()}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Stack direction="row" spacing={0.5} sx={{ justifyContent: "flex-end" }}>
                                            <Tooltip title="Download version file">
                                                <IconButton size="small" onClick={() => onDownload(v)}>
                                                    <DownloadIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={isCurrent ? "This is the current active version" : "Restore this version"}>
                                                <span>
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        onClick={() => onRestore(v)}
                                                        disabled={isCurrent}
                                                    >
                                                        <RestoreIcon fontSize="small" />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
