import React from "react";
import { Chip, SxProps, Theme } from "@mui/material";

interface CategoryChipProps {
    name: string;
    size?: "small" | "medium";
    sx?: SxProps<Theme>;
}

export default function CategoryChip({ name, size = "small", sx }: CategoryChipProps) {
    // Generate stable pastel colors from name string
    const getColors = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const h = Math.abs(hash) % 360;
        return {
            bg: `hsl(${h}, 70%, 92%)`,
            text: `hsl(${h}, 80%, 25%)`,
        };
    };

    const colors = getColors(name || "General");

    return (
        <Chip
            label={name || "General"}
            size={size}
            sx={{
                backgroundColor: colors.bg,
                color: colors.text,
                fontWeight: 600,
                fontSize: "0.75rem",
                borderRadius: "6px",
                ...sx,
            }}
        />
    );
}
