"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    IconButton,
    Tooltip,
    Box,
    TextField,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    TablePagination,
    Stack,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import NextLink from "next/link";
import { useState } from "react";

export interface UserItem {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
    roles: { id: number; name: string }[];
    created_at: string;
}

interface UsersTableProps {
    users: UserItem[];
    total: number;
    page: number;
    perPage: number;
    onPageChange: (newPage: number) => void;
    onSearchChange: (search: string) => void;
    onRoleFilterChange: (role: string) => void;
    onDeleteClick: (user: UserItem) => void;
    onToggleStatusClick: (user: UserItem) => void;
}

export default function UsersTable({
    users,
    total,
    page,
    perPage,
    onPageChange,
    onSearchChange,
    onRoleFilterChange,
    onDeleteClick,
    onToggleStatusClick,
}: UsersTableProps) {
    const [search, setSearch] = useState("");
    const [role, setRole] = useState("");

    return (
        <Stack spacing={2}>
            {/* Filters Bar */}
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <TextField
                    size="small"
                    label="Search Users"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        onSearchChange(e.target.value);
                    }}
                    sx={{ minWidth: 240 }}
                />
                <FormControl size="small" sx={{ minWidth: 160 }}>
                    <InputLabel>Filter by Role</InputLabel>
                    <Select
                        value={role}
                        label="Filter by Role"
                        onChange={(e) => {
                            setRole(e.target.value);
                            onRoleFilterChange(e.target.value);
                        }}
                    >
                        <MenuItem value="">All Roles</MenuItem>
                        <MenuItem value="Super Admin">Super Admin</MenuItem>
                        <MenuItem value="Admin">Admin</MenuItem>
                        <MenuItem value="Manager">Manager</MenuItem>
                        <MenuItem value="Employee">Employee</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Roles</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id} hover>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Box sx={{ display: "flex", gap: 0.5 }}>
                                        {user.roles?.map((r) => (
                                            <Chip key={r.id} label={r.name} size="small" variant="outlined" />
                                        ))}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={user.is_active ? "Active" : "Inactive"}
                                        color={user.is_active ? "success" : "default"}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Tooltip title="View">
                                        <IconButton component={NextLink} href={`/users/${user.id}`} size="small">
                                            <VisibilityIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Edit">
                                        <IconButton component={NextLink} href={`/users/${user.id}/edit`} size="small">
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title={user.is_active ? "Deactivate" : "Activate"}>
                                        <IconButton onClick={() => onToggleStatusClick(user)} size="small" color={user.is_active ? "warning" : "success"}>
                                            {user.is_active ? <ToggleOffIcon fontSize="small" /> : <ToggleOnIcon fontSize="small" />}
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete">
                                        <IconButton onClick={() => onDeleteClick(user)} size="small" color="error">
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <TablePagination
                    component="div"
                    count={total}
                    page={page - 1}
                    onPageChange={(_, newPage) => onPageChange(newPage + 1)}
                    rowsPerPage={perPage}
                    rowsPerPageOptions={[perPage]}
                />
            </TableContainer>
        </Stack>
    );
}
