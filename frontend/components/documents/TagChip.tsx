import React from "react";
import { Chip, SxProps, Theme } from "@mui/material";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";

interface TagChipProps {
    name: string;
    onDelete?: () => void;
    sx?: SxProps<Theme>;
}

export default function TagChip({ name, onDelete, sx }: TagChipProps) {
    return (
        <Chip
            icon={<LocalOfferIcon sx={{ fontSize: "0.75rem !important" }} />}
            label={name}
            size="small"
            variant="outlined"
            onDelete={onDelete}
            sx={{
                fontSize: "0.7rem",
                height: "22px",
                backgroundColor: "action.hover",
                borderColor: "divider",
                borderRadius: "4px",
                ...sx,
            }}
        />
    );
}
