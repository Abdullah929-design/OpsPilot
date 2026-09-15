import React from 'react';
import { Chip, ChipProps } from '@mui/material';

interface PermissionChipProps extends Omit<ChipProps, 'color'> {
    name: string;
    isDenied?: boolean;
    isInherited?: boolean;
}

export default function PermissionChip({ name, isDenied = false, isInherited = false, ...props }: PermissionChipProps) {
    let sxStyles = {};

    if (isDenied) {
        sxStyles = {
            textDecoration: 'line-through',
            backgroundColor: 'rgba(211, 47, 47, 0.08)',
            color: '#d32f2f',
            border: '1px solid rgba(211, 47, 47, 0.5)',
            fontWeight: 500,
        };
    } else if (isInherited) {
        sxStyles = {
            backgroundColor: '#f5f5f5',
            color: '#666',
            border: '1px dashed #ccc',
        };
    } else {
        // Custom Granted Permission
        sxStyles = {
            backgroundColor: 'rgba(25, 118, 210, 0.08)',
            color: '#1976d2',
            border: '1px solid rgba(25, 118, 210, 0.5)',
            fontWeight: 500,
        };
    }

    return (
        <Chip
            label={name}
            size="small"
            sx={sxStyles}
            {...props}
        />
    );
}
