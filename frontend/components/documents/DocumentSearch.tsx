import React, { useState, useEffect } from "react";
import {
    Box,
    TextField,
    InputAdornment,
    Collapse,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Stack,
    Chip,
    SelectChangeEvent,
    Typography,
    Grid,
    Paper,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";

import { Folder } from "@/services/folderService";
import { DocumentCategory } from "@/services/categoryService";

export interface SearchFilters {
    q?: string;
    folder_id?: number | null;
    category_id?: number | null;
    extension?: string;
    date_from?: string;
    date_to?: string;
}

interface DocumentSearchProps {
    filters: SearchFilters;
    onFiltersChange: (filters: SearchFilters) => void;
    folders: Folder[];
    categories: DocumentCategory[];
}

export default function DocumentSearch({
    filters,
    onFiltersChange,
    folders,
    categories,
}: DocumentSearchProps) {
    const [showFilters, setShowFilters] = useState(false);
    const [searchVal, setSearchVal] = useState(filters.q || "");

    // Debounce search query input (300ms)
    useEffect(() => {
        const handler = setTimeout(() => {
            onFiltersChange({ ...filters, q: searchVal || undefined });
        }, 300);

        return () => clearTimeout(handler);
    }, [searchVal]);

    // Sync search input value with parent filters.q
    useEffect(() => {
        setSearchVal(filters.q || "");
    }, [filters.q]);

    const handleFilterChange = (key: keyof SearchFilters, value: any) => {
        onFiltersChange({
            ...filters,
            [key]: value === "" ? undefined : value,
        });
    };

    const handleClearAll = () => {
        setSearchVal("");
        onFiltersChange({});
    };

    // Extension options mapping
    const allowedExtensions = [
        { label: "PDF Document (.pdf)", value: "pdf" },
        { label: "Word Document (.doc, .docx)", value: "docx" },
        { label: "Excel Spreadsheet (.xls, .xlsx)", value: "xlsx" },
        { label: "PowerPoint Presentation (.ppt, .pptx)", value: "pptx" },
        { label: "Image (.jpg, .jpeg, .png)", value: "png" },
        { label: "Archive (.zip)", value: "zip" },
    ];

    // Helper to generate text for active filter chips
    const activeChips = React.useMemo(() => {
        const chips: { key: keyof SearchFilters; label: string }[] = [];

        if (filters.category_id) {
            const cat = categories.find((c) => c.id === filters.category_id);
            if (cat) chips.push({ key: "category_id", label: `Category: ${cat.name}` });
        }

        if (filters.folder_id) {
            const f = folders.find((folder) => folder.id === filters.folder_id);
            if (f) chips.push({ key: "folder_id", label: `Folder: ${f.name}` });
        }

        if (filters.extension) {
            const ext = allowedExtensions.find((e) => e.value === filters.extension);
            if (ext) chips.push({ key: "extension", label: `Type: ${ext.label.split(" (")[0]}` });
        }

        if (filters.date_from) {
            chips.push({ key: "date_from", label: `From: ${filters.date_from}` });
        }

        if (filters.date_to) {
            chips.push({ key: "date_to", label: `To: ${filters.date_to}` });
        }

        return chips;
    }, [filters, categories, folders]);

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
            {/* Search Input Row */}
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                <TextField
                    placeholder="Search documents, tags, content..."
                    value={searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                    size="small"
                    fullWidth
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: "text.secondary" }} />
                                </InputAdornment>
                            ),
                        },
                    }}
                />
                <Button
                    variant="outlined"
                    color="inherit"
                    startIcon={<FilterListIcon />}
                    endIcon={showFilters ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
                    onClick={() => setShowFilters(!showFilters)}
                    sx={{ borderColor: "divider", textTransform: "none", height: "40px", whiteSpace: "nowrap" }}
                >
                    Filters
                </Button>
            </Stack>

            {/* Expandable Advanced Filter Panel */}
            <Collapse in={showFilters}>
                <Paper
                    variant="outlined"
                    sx={{
                        p: 2.5,
                        borderRadius: "12px",
                        backgroundColor: "action.hover",
                        borderColor: "divider",
                    }}
                >
                    <Grid container spacing={2.5}>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel id="search-folder-label">Folder</InputLabel>
                                <Select
                                    labelId="search-folder-label"
                                    value={filters.folder_id ? String(filters.folder_id) : ""}
                                    label="Folder"
                                    onChange={(e: SelectChangeEvent) =>
                                        handleFilterChange("folder_id", e.target.value ? Number(e.target.value) : null)
                                    }
                                >
                                    <MenuItem value="">
                                        <em>All Folders</em>
                                    </MenuItem>
                                    {folders.map((f) => (
                                        <MenuItem key={f.id} value={String(f.id)}>
                                            {f.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel id="search-category-label">Category</InputLabel>
                                <Select
                                    labelId="search-category-label"
                                    value={filters.category_id ? String(filters.category_id) : ""}
                                    label="Category"
                                    onChange={(e: SelectChangeEvent) =>
                                        handleFilterChange("category_id", e.target.value ? Number(e.target.value) : null)
                                    }
                                >
                                    <MenuItem value="">
                                        <em>All Categories</em>
                                    </MenuItem>
                                    {categories.map((c) => (
                                        <MenuItem key={c.id} value={String(c.id)}>
                                            {c.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel id="search-type-label">File Type</InputLabel>
                                <Select
                                    labelId="search-type-label"
                                    value={filters.extension || ""}
                                    label="File Type"
                                    onChange={(e: SelectChangeEvent) => handleFilterChange("extension", e.target.value)}
                                >
                                    <MenuItem value="">
                                        <em>All File Types</em>
                                    </MenuItem>
                                    {allowedExtensions.map((ext) => (
                                        <MenuItem key={ext.value} value={ext.value}>
                                            {ext.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Date From"
                                type="date"
                                value={filters.date_from || ""}
                                onChange={(e) => handleFilterChange("date_from", e.target.value)}
                                size="small"
                                fullWidth
                                slotProps={{
                                    inputLabel: { shrink: true },
                                }}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Date To"
                                type="date"
                                value={filters.date_to || ""}
                                onChange={(e) => handleFilterChange("date_to", e.target.value)}
                                size="small"
                                fullWidth
                                slotProps={{
                                    inputLabel: { shrink: true },
                                }}
                            />
                        </Grid>
                    </Grid>
                </Paper>
            </Collapse>

            {/* Active Filter Chips */}
            {(activeChips.length > 0 || searchVal) && (
                <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: "center", flexWrap: "wrap" }}>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                        Active filters:
                    </Typography>
                    {searchVal && (
                        <Chip
                            label={`Search: "${searchVal}"`}
                            size="small"
                            onDelete={() => setSearchVal("")}
                        />
                    )}
                    {activeChips.map((chip) => (
                        <Chip
                            key={chip.key}
                            label={chip.label}
                            size="small"
                            onDelete={() => handleFilterChange(chip.key, undefined)}
                        />
                    ))}
                    <Button
                        size="small"
                        color="primary"
                        startIcon={<ClearAllIcon fontSize="small" />}
                        onClick={handleClearAll}
                        sx={{ textTransform: "none", fontSize: "0.75rem", ml: "auto" }}
                    >
                        Clear all
                    </Button>
                </Stack>
            )}
        </Box>
    );
}
