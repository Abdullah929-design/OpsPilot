import React from "react";
import { Box, SxProps, Theme } from "@mui/material";

interface VersionBadgeProps {
    version: number;
    sx?: SxProps<Theme>;
}

export default function VersionBadge({ version, sx }: VersionBadgeProps) {
    return (
        <Box
            component="span"
            sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                px: 1,
                py: 0.25,
                fontSize: "0.7rem",
                fontWeight: 700,
                borderRadius: "10px",
                backgroundColor: "primary.light",
                color: "primary.contrastText",
                verticalAlign: "middle",
                ...sx,
            }}
        >
            v{version}
        </Box>
    );
}
