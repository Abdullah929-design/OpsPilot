import React, { useEffect, useState, useRef } from "react";
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
    MenuItem,
    Autocomplete,
    Chip,
    Box,
    Typography,
    SelectChangeEvent,
    LinearProgress,
    IconButton,
    Paper,
    Stack,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { Folder } from "@/services/folderService";
import { DocumentCategory } from "@/services/categoryService";
import { useTags } from "@/hooks/useTags";

interface UploadDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (formData: FormData) => void;
    folders: Folder[];
    categories: DocumentCategory[];
    defaultFolderId?: number | null;
    isUploading?: boolean;
}

export default function UploadDialog({
    open,
    onClose,
    onSubmit,
    folders,
    categories,
    defaultFolderId = null,
    isUploading = false,
}: UploadDialogProps) {
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [folderId, setFolderId] = useState<string>("");
    const [categoryId, setCategoryId] = useState<string>("");
    const [tags, setTags] = useState<string[]>([]);
    const [tagInputValue, setTagInputValue] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { data: existingTags = [] } = useTags({ type: "document" });

    useEffect(() => {
        if (open) {
            setFile(null);
            setTitle("");
            setDescription("");
            setFolderId(defaultFolderId ? String(defaultFolderId) : "");
            setCategoryId("");
            setTags([]);
            setTagInputValue("");
            setErrors({});
        }
    }, [open, defaultFolderId]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const selectedFile = files[0];
            setFile(selectedFile);
            const lastDotIndex = selectedFile.name.lastIndexOf(".");
            const cleanTitle = lastDotIndex !== -1 ? selectedFile.name.substring(0, lastDotIndex) : selectedFile.name;
            setTitle(cleanTitle);
            setErrors((prev) => ({ ...prev, file: "" }));
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const selectedFile = files[0];
            setFile(selectedFile);
            const lastDotIndex = selectedFile.name.lastIndexOf(".");
            const cleanTitle = lastDotIndex !== -1 ? selectedFile.name.substring(0, lastDotIndex) : selectedFile.name;
            setTitle(cleanTitle);
            setErrors((prev) => ({ ...prev, file: "" }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};

        if (!file) newErrors.file = "Please select a file to upload.";
        if (!title.trim()) newErrors.title = "Document title is required.";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const formData = new FormData();
        formData.append("file", file!);
        formData.append("title", title.trim());
        formData.append("description", description.trim());
        if (folderId) formData.append("folder_id", folderId);
        if (categoryId) formData.append("category_id", categoryId);

        const finalTags = [...tags];
        const trimmedInput = tagInputValue.trim();
        if (trimmedInput && !finalTags.includes(trimmedInput)) {
            finalTags.push(trimmedInput);
        }

        finalTags.forEach((tag, idx) => {
            formData.append(`tags[${idx}]`, tag);
        });

        onSubmit(formData);
    };

    return (
        <Dialog open={open} onClose={isUploading ? undefined : onClose} fullWidth maxWidth="sm">
            <DialogTitle>Upload Document</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent dividers>
                    {isUploading && (
                        <Box sx={{ width: "100%", mb: 2 }}>
                            <Typography variant="caption" color="text.secondary">Uploading file...</Typography>
                            <LinearProgress />
                        </Box>
                    )}

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                        {!file ? (
                            <Box
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                sx={{
                                    border: "2px dashed",
                                    borderColor: errors.file ? "error.main" : "divider",
                                    borderRadius: "8px",
                                    p: 4,
                                    textAlign: "center",
                                    cursor: "pointer",
                                    backgroundColor: "action.hover",
                                    transition: "border-color 0.2s",
                                    "&:hover": { borderColor: "primary.main" },
                                }}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    style={{ display: "none" }}
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp,.zip"
                                />
                                <CloudUploadIcon sx={{ fontSize: "3rem", color: "text.secondary", mb: 1.5 }} />
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    Drag & drop file here or click to browse
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Supported: PDF, Word, Excel, PowerPoint, JPEG, PNG, GIF, ZIP (Max 50MB)
                                </Typography>
                                {errors.file && (
                                    <Typography variant="caption" color="error.main" sx={{ display: "block", mt: 1 }}>
                                        {errors.file}
                                    </Typography>
                                )}
                            </Box>
                        ) : (
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 2,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    borderColor: "success.light",
                                    backgroundColor: "action.hover",
                                }}
                            >
                                <Stack sx={{ display: "flex", flexDirection: "row", gap: 1.5, alignItems: "center" }}>
                                    <InsertDriveFileIcon sx={{ color: "primary.main" }} />
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 600, maxWidth: 300 }}>
                                            {file.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                                        </Typography>
                                    </Box>
                                </Stack>
                                <IconButton size="small" onClick={() => setFile(null)} disabled={isUploading}>
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </Paper>
                        )}

                        <TextField
                            label="Document Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            error={!!errors.title}
                            helperText={errors.title}
                            fullWidth
                            size="small"
                            required
                            disabled={isUploading}
                        />

                        <TextField
                            label="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            multiline
                            rows={2}
                            fullWidth
                            size="small"
                            disabled={isUploading}
                        />

                        <Box sx={{ display: "flex", gap: 2 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel id="folder-select-label">Folder</InputLabel>
                                <Select
                                    labelId="folder-select-label"
                                    value={folderId}
                                    label="Folder"
                                    onChange={(e) => setFolderId(e.target.value)}
                                    disabled={isUploading}
                                >
                                    <MenuItem value="">
                                        <em>Root Directory</em>
                                    </MenuItem>
                                    {folders.map((f) => (
                                        <MenuItem key={f.id} value={String(f.id)}>
                                            {f.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl fullWidth size="small">
                                <InputLabel id="category-select-label">Category</InputLabel>
                                <Select
                                    labelId="category-select-label"
                                    value={categoryId}
                                    label="Category"
                                    onChange={(e: SelectChangeEvent) => setCategoryId(e.target.value)}
                                    disabled={isUploading}
                                >
                                    <MenuItem value="">
                                        <em>None</em>
                                    </MenuItem>
                                    {categories.map((c) => (
                                        <MenuItem key={c.id} value={String(c.id)}>
                                            {c.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>

                        <Autocomplete
                            multiple
                            freeSolo
                            options={existingTags}
                            value={tags}
                            onChange={(_, newValue) => setTags(newValue as string[])}
                            inputValue={tagInputValue}
                            onInputChange={(_, newInputValue) => setTagInputValue(newInputValue)}
                            renderValue={(value: string[], getItemProps) =>
                                value.map((option: string, index: number) => {
                                    const { key, ...restProps } = getItemProps({ index });
                                    return (
                                        <Chip
                                            key={key}
                                            variant="outlined"
                                            label={option}
                                            size="small"
                                            {...restProps}
                                        />
                                    );
                                })
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Tags"
                                    placeholder="Press enter to add tag"
                                    size="small"
                                    fullWidth
                                />
                            )}
                            disabled={isUploading}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="inherit" disabled={isUploading}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="contained" color="primary" disabled={isUploading}>
                        Upload
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
