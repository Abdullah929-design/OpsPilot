import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Autocomplete,
    CircularProgress,
    Alert,
    Chip,
} from "@mui/material";
import { useTags } from "@/hooks/useTags";
import { Document } from "@/services/documentService";
import { useAuth } from "@/hooks/useAuth";
import { useAIAssistant } from "@/hooks/useAIAssistant";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

interface EditDocumentDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: { title: string; description: string; tags: string[] }) => void;
    document: Document | null;
}

export default function EditDocumentDialog({
    open,
    onClose,
    onSubmit,
    document,
}: EditDocumentDialogProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const { data: existingTags = [] } = useTags({ type: "document" });

    const { user } = useAuth();
    const { suggestMetadata, isSuggestingMetadata } = useAIAssistant();
    const [infoMessage, setInfoMessage] = useState<string | null>(null);

    const hasAiDocAccess = user?.permissions?.some((p) => p.name === "ai.documents") ||
        user?.roles?.some((r) => r.name === "Super Admin");

    useEffect(() => {
        if (open && document) {
            setTitle(document.title);
            setDescription(document.description || "");
            setTags(document.tags ? document.tags.map((t) => t.name) : []);
            setInputValue("");
            setErrors({});
            setInfoMessage(null);
        }
    }, [open, document]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            setErrors({ title: "Document title is required" });
            return;
        }

        const finalTags = [...tags];
        const trimmedInput = inputValue.trim();
        if (trimmedInput && !finalTags.includes(trimmedInput)) {
            finalTags.push(trimmedInput);
        }

        onSubmit({
            title: title.trim(),
            description: description.trim(),
            tags: finalTags,
        });
    };
    const handleSuggestMetadata = async () => {
        if (!document) return;
        setInfoMessage(null);
        try {
            const suggestions = await suggestMetadata(document.id);
            if (suggestions.title) setTitle(suggestions.title);
            if (suggestions.description) setDescription(suggestions.description);
            if (suggestions.tags && suggestions.tags.length > 0) {
                setTags(suggestions.tags);
            }
            setInfoMessage("✨ AI suggestions loaded! Review the fields and save.");
        } catch (err: any) {
            setInfoMessage("❌ Failed to load suggestions.");
        }
    };



    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>Edit Document Info</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent dividers>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                        {infoMessage && (
                            <Alert severity={infoMessage.startsWith("❌") ? "error" : "success"} sx={{ py: 0 }}>
                                {infoMessage}
                            </Alert>
                        )}

                        {hasAiDocAccess && (
                            <Button
                                variant="outlined"
                                color="secondary"
                                size="small"
                                startIcon={isSuggestingMetadata ? <CircularProgress size={16} /> : <AutoAwesomeIcon />}
                                onClick={handleSuggestMetadata}
                                disabled={isSuggestingMetadata}
                                sx={{ textTransform: "none", alignSelf: "flex-end" }}
                            >
                                {isSuggestingMetadata ? "Analyzing document..." : "Suggest Metadata"}
                            </Button>
                        )}

                        <TextField
                            label="Document Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            error={!!errors.title}
                            helperText={errors.title}
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
                        <Autocomplete
                            multiple
                            freeSolo
                            options={existingTags}
                            value={tags}
                            onChange={(_, newValue) => setTags(newValue as string[])}
                            inputValue={inputValue}
                            onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
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
                                    label="Tags" placeholder="Press enter to add tag"
                                    size="small"
                                    fullWidth
                                />
                            )}
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
