import React from "react";
import { Chip } from "@mui/material";

interface StatusBadgeProps {
    status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
    let color: "success" | "warning" | "error" | "default" = "default";

    switch (status?.toLowerCase()) {
        case "active":
            color = "success";
            break;
        case "inactive":
            color = "warning";
            break;
        case "terminated":
            color = "error";
            break;
        default:
            color = "default";
    }

    return (
        <Chip
            label={status ? status.toUpperCase() : "UNKNOWN"}
            color={color}
            size="small"
            sx={{ fontWeight: 600, fontSize: "0.75rem", borderRadius: "6px" }}
        />
    );
}
