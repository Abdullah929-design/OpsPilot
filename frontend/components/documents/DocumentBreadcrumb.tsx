import React from "react";
import { Breadcrumbs, Link, Typography, SxProps, Theme } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import HomeIcon from "@mui/icons-material/Home";

export interface BreadcrumbFolder {
    id: number;
    name: string;
}

interface DocumentBreadcrumbProps {
    folders: BreadcrumbFolder[];
    onFolderClick: (folderId: number | null) => void;
    sx?: SxProps<Theme>;
}

export default function DocumentBreadcrumb({ folders, onFolderClick, sx }: DocumentBreadcrumbProps) {
    return (
        <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            aria-label="breadcrumb"
            sx={{ py: 1, ...sx }}
        >
            <Link
                component="button"
                variant="body2"
                onClick={() => onFolderClick(null)}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    color: "text.secondary",
                    textDecoration: "none",
                    fontWeight: 500,
                    cursor: "pointer",
                    border: "none",
                    background: "none",
                    p: 0,
                    fontFamily: "inherit",
                    "&:hover": {
                        color: "primary.main",
                        textDecoration: "underline",
                    },
                }}
            >
                <HomeIcon sx={{ mr: 0.5, fontSize: "1.1rem" }} />
                Root
            </Link>

            {folders.map((folder, index) => {
                const isLast = index === folders.length - 1;

                if (isLast) {
                    return (
                        <Typography
                            key={folder.id}
                            variant="body2"
                            sx={{ color: "text.primary", fontWeight: 600 }}
                        >
                            {folder.name}
                        </Typography>
                    );
                }

                return (
                    <Link
                        key={folder.id}
                        component="button"
                        variant="body2"
                        onClick={() => onFolderClick(folder.id)}
                        sx={{
                            color: "text.secondary",
                            textDecoration: "none",
                            fontWeight: 500,
                            cursor: "pointer",
                            border: "none",
                            background: "none",
                            p: 0,
                            fontFamily: "inherit",
                            "&:hover": {
                                color: "primary.main",
                                textDecoration: "underline",
                            },
                        }}
                    >
                        {folder.name}
                    </Link>
                );
            })}
        </Breadcrumbs>
    );
}
