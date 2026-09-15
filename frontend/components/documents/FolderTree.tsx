import React, { useState } from "react";
import {
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Collapse,
    IconButton,
    Menu,
    MenuItem,
    Box,
    Typography,
    Tooltip,
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Folder } from "@/services/folderService";

interface FolderTreeProps {
    folders: Folder[];
    selectedFolderId: number | null;
    onSelectFolder: (id: number | null) => void;
    onCreateFolder: (parentId: number | null) => void;
    onRenameFolder: (folder: Folder) => void;
    onDeleteFolder: (folder: Folder) => void;
}

export default function FolderTree({
    folders,
    selectedFolderId,
    onSelectFolder,
    onCreateFolder,
    onRenameFolder,
    onDeleteFolder,
}: FolderTreeProps) {
    const [expanded, setExpanded] = useState<Record<number, boolean>>({});
    const [menuAnchor, setMenuAnchor] = useState<{
        el: HTMLElement;
        folder: Folder;
    } | null>(null);

    const handleToggle = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const handleMenuOpen = (e: React.MouseEvent, folder: Folder) => {
        e.stopPropagation();
        setMenuAnchor({ el: e.currentTarget as HTMLElement, folder });
    };

    const handleMenuClose = () => {
        setMenuAnchor(null);
    };

    const renderFolderItem = (folder: Folder, depth = 0) => {
        const hasChildren = folder.children && folder.children.length > 0;
        const isExpanded = !!expanded[folder.id];
        const isSelected = selectedFolderId === folder.id;

        return (
            <React.Fragment key={folder.id}>
                <ListItemButton
                    selected={isSelected}
                    onClick={() => onSelectFolder(folder.id)}
                    sx={{
                        pl: 2 + depth * 2,
                        py: 0.75,
                        borderRadius: "8px",
                        mb: 0.5,
                        position: "relative",
                        "&.Mui-selected": {
                            backgroundColor: "primary.light",
                            color: "primary.contrastText",
                            "& .MuiListItemIcon-root, & .MuiIconButton-root": {
                                color: "primary.contrastText",
                            },
                            "&:hover": {
                                backgroundColor: "primary.light",
                            },
                        },
                        "&:hover .folder-actions-btn": {
                            opacity: 1,
                        },
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 32 }}>
                        {isSelected ? (
                            <FolderOpenIcon sx={{ color: isSelected ? "inherit" : "warning.main" }} />
                        ) : (
                            <FolderIcon sx={{ color: "warning.main" }} />
                        )}
                    </ListItemIcon>

                    <ListItemText
                        primary={folder.name}
                        slotProps={{
                            primary: {
                                variant: "body2",
                                noWrap: true,
                                sx: { fontWeight: isSelected ? 600 : 500 },
                            },
                        }}
                    />

                    {hasChildren && (
                        <IconButton
                            size="small"
                            onClick={(e) => handleToggle(folder.id, e)}
                            sx={{ p: 0.25, mr: 0.5 }}
                        >
                            {isExpanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                        </IconButton>
                    )}

                    <IconButton
                        size="small"
                        className="folder-actions-btn"
                        onClick={(e) => handleMenuOpen(e, folder)}
                        sx={{
                            opacity: 0,
                            transition: "opacity 0.2s",
                            p: 0.25,
                        }}
                    >
                        <MoreVertIcon fontSize="small" />
                    </IconButton>
                </ListItemButton>

                {hasChildren && (
                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            {folder.children!.map((child) => renderFolderItem(child, depth + 1))}
                        </List>
                    </Collapse>
                )}
            </React.Fragment>
        );
    };

    return (
        <Box sx={{ width: "100%" }}>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    px: 1,
                    mb: 1.5,
                }}
            >
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700 }}>
                    FOLDERS
                </Typography>
                <Tooltip title="New Root Folder">
                    <IconButton size="small" onClick={() => onCreateFolder(null)} color="primary">
                        <CreateNewFolderIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>

            <List component="nav" disablePadding>
                <ListItemButton
                    selected={selectedFolderId === null}
                    onClick={() => onSelectFolder(null)}
                    sx={{
                        py: 0.75,
                        borderRadius: "8px",
                        mb: 0.5,
                        "&.Mui-selected": {
                            backgroundColor: "primary.light",
                            color: "primary.contrastText",
                            "& .MuiListItemIcon-root": {
                                color: "primary.contrastText",
                            },
                        },
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 32 }}>
                        <FolderOpenIcon sx={{ color: selectedFolderId === null ? "inherit" : "text.secondary" }} />
                    </ListItemIcon>
                    <ListItemText
                        primary="All Files (Root)"
                        slotProps={{
                            primary: {
                                variant: "body2",
                                sx: { fontWeight: selectedFolderId === null ? 600 : 500 },
                            },
                        }}
                    />
                </ListItemButton>

                {folders.map((folder) => renderFolderItem(folder))}
            </List>

            {/* Context Menu for Folder Actions */}
            <Menu
                anchorEl={menuAnchor?.el}
                open={Boolean(menuAnchor)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <MenuItem
                    onClick={() => {
                        if (menuAnchor) onCreateFolder(menuAnchor.folder.id);
                        handleMenuClose();
                    }}
                >
                    <ListItemIcon>
                        <CreateNewFolderIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="New Subfolder" />
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        if (menuAnchor) onRenameFolder(menuAnchor.folder);
                        handleMenuClose();
                    }}
                >
                    <ListItemIcon>
                        <EditIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Rename" />
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        if (menuAnchor) onDeleteFolder(menuAnchor.folder);
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
        </Box>
    );
}