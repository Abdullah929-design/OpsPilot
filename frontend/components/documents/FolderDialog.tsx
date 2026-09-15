import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    SelectChangeEvent,
    MenuItem,
    Box,
} from "@mui/material";
import { Folder } from "@/services/folderService";

interface FolderDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: { name: string; description: string; parent_id: number | null }) => void;
    folderList: Folder[]; // Flat list of folders for parent selection
    editFolder?: Folder | null; // If editing, pre-fill values
    defaultParentId?: number | null; // For subfolder creations
}

export default function FolderDialog({
    open,
    onClose,
    onSubmit,
    folderList,
    editFolder,
    defaultParentId = null,
}: FolderDialogProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [parentId, setParentId] = useState<number | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (open) {
            if (editFolder) {
                setName(editFolder.name);
                setDescription(editFolder.description || "");
                setParentId(editFolder.parent_id);
            } else {
                setName("");
                setDescription("");
                setParentId(defaultParentId);
            }
            setErrors({});
        }
    }, [open, editFolder, defaultParentId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            setErrors({ name: "Folder name is required" });
            return;
        }

        onSubmit({
            name: name.trim(),
            description: description.trim(),
            parent_id: parentId,
        });
    };

    // Filter out self and descendants to prevent circular referencing
    const getEligibleParents = () => {
        if (!editFolder) return folderList;

        const getDescendantIds = (folderId: number): number[] => {
            const ids: number[] = [];
            const findChildren = (fid: number) => {
                const children = folderList.filter((f) => f.parent_id === fid);
                children.forEach((c) => {
                    ids.push(c.id);
                    findChildren(c.id);
                });
            };
            findChildren(folderId);
            return ids;
        };

        const excludedIds = [editFolder.id, ...getDescendantIds(editFolder.id)];
        return folderList.filter((f) => !excludedIds.includes(f.id));
    };

    const handleParentChange = (e: SelectChangeEvent) => {
        setParentId(e.target.value === "" ? null : Number(e.target.value));
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>{editFolder ? "Rename Folder" : "New Folder"}</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent dividers>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                        <TextField
                            label="Folder Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            error={!!errors.name}
                            helperText={errors.name}
                            fullWidth
                            autoFocus
                            size="small"
                            required
                        />

                        <TextField
                            label="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            multiline
                            rows={3}
                            fullWidth
                            size="small"
                        />

                        <FormControl fullWidth size="small">
                            <InputLabel id="parent-folder-select-label">Parent Folder</InputLabel>
                            <Select
                                labelId="parent-folder-select-label"
                                value={parentId === null ? "" : String(parentId)}
                                label="Parent Folder"
                                onChange={handleParentChange}
                            >
                                <MenuItem value="">
                                    <em>None (Root Folder)</em>
                                </MenuItem>
                                {getEligibleParents().map((f) => (
                                    <MenuItem key={f.id} value={String(f.id)}>
                                        {f.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="inherit">
                        Cancel
                    </Button>
                    <Button type="submit" variant="contained" color="primary">
                        Save
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}