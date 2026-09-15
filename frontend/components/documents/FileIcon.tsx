import React from "react";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ArticleIcon from "@mui/icons-material/Article";
import TableChartIcon from "@mui/icons-material/TableChart";
import SlideshowIcon from "@mui/icons-material/Slideshow";
import ImageIcon from "@mui/icons-material/Image";
import FolderZipIcon from "@mui/icons-material/FolderZip";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { SxProps, Theme } from "@mui/material";

interface FileIconProps {
    extension?: string;
    mimeType?: string;
    sx?: SxProps<Theme>;
}

export default function FileIcon({ extension, mimeType, sx }: FileIconProps) {
    const type = (extension || mimeType || "").toLowerCase();

    const iconStyle = {
        ...sx,
    };

    if (type.includes("pdf") || type.includes("application/pdf")) {
        return <PictureAsPdfIcon sx={{ color: "#d32f2f", ...iconStyle }} />;
    }
    if (
        type.includes("doc") ||
        type.includes("docx") ||
        type.includes("word") ||
        type.includes("officedocument.wordprocessingml")
    ) {
        return <ArticleIcon sx={{ color: "#1976d2", ...iconStyle }} />;
    }
    if (
        type.includes("xls") ||
        type.includes("xlsx") ||
        type.includes("excel") ||
        type.includes("spreadsheet") ||
        type.includes("officedocument.spreadsheetml")
    ) {
        return <TableChartIcon sx={{ color: "#2e7d32", ...iconStyle }} />;
    }
    if (
        type.includes("ppt") ||
        type.includes("pptx") ||
        type.includes("powerpoint") ||
        type.includes("presentation") ||
        type.includes("officedocument.presentationml")
    ) {
        return <SlideshowIcon sx={{ color: "#ed6c02", ...iconStyle }} />;
    }
    if (
        type.includes("png") ||
        type.includes("jpg") ||
        type.includes("jpeg") ||
        type.includes("gif") ||
        type.includes("webp") ||
        type.includes("image/")
    ) {
        return <ImageIcon sx={{ color: "#008080", ...iconStyle }} />;
    }
    if (
        type.includes("zip") ||
        type.includes("rar") ||
        type.includes("tar") ||
        type.includes("gz") ||
        type.includes("compressed")
    ) {
        return <FolderZipIcon sx={{ color: "#757575", ...iconStyle }} />;
    }

    return <InsertDriveFileIcon sx={{ color: "#9e9e9e", ...iconStyle }} />;
}
