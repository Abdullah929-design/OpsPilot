import React from "react";
import { Chip, SxProps, Theme } from "@mui/material";

interface FileSizeChipProps {
    bytes: number;
    size?: "small" | "medium";
    sx?: SxProps<Theme>;
}

export default function FileSizeChip({ bytes, size = "small", sx }: FileSizeChipProps) {
    const formatBytes = (b: number): string => {
        if (b <= 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB", "TB"];
        const i = Math.floor(Math.log(b) / Math.log(k));
        return parseFloat((b / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    };

    return (
        <Chip
            label={formatBytes(bytes)}
            size={size}
            variant="outlined"
            sx={{
                fontSize: "0.75rem",
                height: "20px",
                borderColor: "divider",
                color: "text.secondary",
                ...sx,
            }}
        />
    );
}
