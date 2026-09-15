import React, { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Autocomplete,
    Box,
    CircularProgress,
} from "@mui/material";
import { useDocuments } from "@/hooks/useDocument";
import { Document } from "@/services/documentService";

interface AttachDocumentDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: { document_id: number; note: string }) => void;
    isAttaching?: boolean;
}

export default function AttachDocumentDialog({
    open,
    onClose,
    onSubmit,
    isAttaching = false,
}: AttachDocumentDialogProps) {
    const [searchVal, setSearchVal] = useState("");
    const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
    const [note, setNote] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Fetch documents matching search query from repository
    const { data: documentsData, isLoading } = useDocuments({
        q: searchVal || undefined,
        per_page: 20,
    });

    const options = documentsData?.items || [];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedDoc) {
            setErrors({ document: "Please select a document to attach." });
            return;
        }

        onSubmit({
            document_id: selectedDoc.id,
            note: note.trim(),
        });
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>Attach Document</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent dividers>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                        <Autocomplete
                            options={options}
                            getOptionLabel={(option: Document) =>
                                `${option.title} (${option.file_name})`
                            }
                            value={selectedDoc}
                            onChange={(_, newValue) => {
                                setSelectedDoc(newValue);
                                setErrors({});
                            }}
                            onInputChange={(_, newInputValue) => {
                                setSearchVal(newInputValue);
                            }}
                            loading={isLoading}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Select Document"
                                    placeholder="Type to search..."
                                    error={!!errors.document}
                                    helperText={errors.document}
                                    required
                                    size="small"
                                />
                            )}
                        />                        <TextField
                            label="Note"
                            placeholder="e.g. Signed NDA, Contract terms"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            multiline
                            rows={2}
                            fullWidth
                            size="small"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="inherit" disabled={isAttaching}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="contained" color="primary" disabled={isAttaching || !selectedDoc}>
                        Attach
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
