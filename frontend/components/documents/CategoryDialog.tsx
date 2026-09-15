import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
} from "@mui/material";
import { DocumentCategory } from "@/services/categoryService";

interface CategoryDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: { name: string; description: string }) => void;
    editCategory?: DocumentCategory | null;
}

export default function CategoryDialog({
    open,
    onClose,
    onSubmit,
    editCategory,
}: CategoryDialogProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (open) {
            if (editCategory) {
                setName(editCategory.name);
                setDescription(editCategory.description || "");
            } else {
                setName("");
                setDescription("");
            }
            setErrors({});
        }
    }, [open, editCategory]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            setErrors({ name: "Category name is required" });
            return;
        }

        onSubmit({
            name: name.trim(),
            description: description.trim(),
        });
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>{editCategory ? "Edit Category" : "New Category"}</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent dividers>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                        <TextField
                            label="Category Name"
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
