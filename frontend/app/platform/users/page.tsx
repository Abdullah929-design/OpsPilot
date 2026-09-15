"use client";

import { useState } from "react";
import PlatformLayout from "@/layouts/PlatformLayout";
import { usePlatformUsers } from "@/hooks/usePlatformUsers";
import { usePlatformRoles } from "@/hooks/usePlatformRoles";
import {
    Container, Paper, Typography, Button, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Stack, Box, CircularProgress, Select, MenuItem, InputLabel, FormControl, Alert,
    Tabs, Tab, Checkbox, FormControlLabel, Grid
} from "@mui/material";
import { usePlatformAuth } from "@/hooks/usePlatformAuth";

function UsersManagementContent() {
    const [activeTab, setActiveTab] = useState(0);
    const { users, isLoading: isUsersLoading, createUser, updateUser, deleteUser } = usePlatformUsers();
    const { roles, permissions, isLoading: isRolesLoading, syncPermissions } = usePlatformRoles();
    const { user: currentUser } = usePlatformAuth();
    const [open, setOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any | null>(null);
    const [errorMsg, setErrorMsg] = useState("");

    const isAdmin = currentUser?.roles?.[0]?.name === "Admin";

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "Manager",
    });

    const handleOpen = (user: any = null) => {
        setErrorMsg("");
        if (user) {
            setEditingUser(user);
            setForm({
                name: user.name,
                email: user.email,
                password: "", // Keep password blank unless changing
                role: user.roles?.[0]?.name || "Manager",
            });
        } else {
            setEditingUser(null);
            setForm({
                name: "",
                email: "",
                password: "",
                role: "Manager",
            });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");

        try {
            if (editingUser) {
                const payload = { ...form };
                if (!payload.password) {
                    delete (payload as any).password;
                }
                await updateUser.mutateAsync({ userId: editingUser.id, userData: payload });
            } else {
                await createUser.mutateAsync(form);
            }
            handleClose();
        } catch (err: any) {
            setErrorMsg(err.response?.data?.message || "An error occurred while saving the user.");
        }
    };

    const handleDelete = async (userId: number) => {
        if (confirm("Are you sure you want to delete this platform operator?")) {
            setErrorMsg("");
            try {
                await deleteUser.mutateAsync(userId);
            } catch (err: any) {
                alert(err.response?.data?.message || "Failed to delete platform operator.");
            }
        }
    };

    if (isUsersLoading || (isAdmin && isRolesLoading)) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg">
            <Paper sx={{ p: 4, borderRadius: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        Platform Management
                    </Typography>
                </Box>

                {isAdmin && (
                    <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 4 }}>
                        <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)}>
                            <Tab label="Platform Operators" />
                            <Tab label="Roles & Permissions" />
                        </Tabs>
                    </Box>
                )}

                {/* Tab 1: Platform Operators */}
                {activeTab === 0 && (
                    <Stack spacing={3}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Platform Operators
                            </Typography>
                            <Button variant="contained" onClick={() => handleOpen()}>
                                Add Operator
                            </Button>
                        </Box>

                        <TableContainer component={Paper} variant="outlined">
                            <Table>
                                <TableHead sx={{ bgcolor: "grey.50" }}>
                                    <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Email</TableCell>
                                        <TableCell>Role</TableCell>
                                        <TableCell>Created At</TableCell>
                                        <TableCell align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell sx={{ fontWeight: 600 }}>{user.name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell sx={{ textTransform: "capitalize" }}>
                                                {user.roles?.[0]?.name || "Operator"}
                                            </TableCell>
                                            <TableCell>
                                                {(user as any).created_at ? new Date((user as any).created_at).toLocaleDateString() : "N/A"}
                                            </TableCell>
                                            <TableCell align="right">
                                                <Button size="small" onClick={() => handleOpen(user)} sx={{ mr: 1 }}>
                                                    Edit
                                                </Button>
                                                <Button
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDelete(user.id)}
                                                    disabled={currentUser?.id === user.id}
                                                >
                                                    Delete
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Stack>
                )}

                {/* Tab 2: Roles & Permissions (Admin only) */}
                {isAdmin && activeTab === 1 && (
                    <Stack spacing={4}>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Configure Platform Role Permissions
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                Customize action privileges assigned globally to Platform Admin and Manager roles.
                            </Typography>
                        </Box>

                        {syncPermissions.isSuccess && (
                            <Alert severity="success">Permissions updated successfully!</Alert>
                        )}

                        {roles.map((role) => {
                            const activePerms = role.permissions.map((p) => p.name);
                            return (
                                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }} key={role.id}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                                        Platform Role: {role.name}
                                    </Typography>
                                    <Grid container spacing={1}>
                                        {permissions.map((perm) => (
                                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={perm}>
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={activePerms.includes(perm)}
                                                            onChange={async () => {
                                                                const newPerms = activePerms.includes(perm)
                                                                    ? activePerms.filter((p) => p !== perm)
                                                                    : [...activePerms, perm];
                                                                await syncPermissions.mutateAsync({
                                                                    roleId: role.id,
                                                                    permissions: newPerms
                                                                });
                                                            }}
                                                            // Avoid locking yourself out of role management permissions
                                                            disabled={
                                                                role.name === "Admin" &&
                                                                perm === "platform.roles.update"
                                                            }
                                                        />
                                                    }
                                                    label={perm}
                                                />
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Paper>
                            );
                        })}
                    </Stack>
                )}
            </Paper>

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <form onSubmit={handleSubmit}>
                    <DialogTitle>{editingUser ? "Edit Platform Operator" : "Add Platform Operator"}</DialogTitle>
                    <DialogContent>
                        <Stack spacing={3} sx={{ mt: 1 }}>
                            {errorMsg && <Alert severity="error">{errorMsg}</Alert>}
                            <TextField
                                label="Name"
                                fullWidth
                                required
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                            />
                            <TextField
                                label="Email"
                                type="email"
                                fullWidth
                                required
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                            />
                            <TextField
                                label="Password"
                                type="password"
                                fullWidth
                                required={!editingUser}
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                helperText={editingUser ? "Leave blank to keep password unchanged." : "Minimum 8 characters."}
                            />
                            <FormControl fullWidth required>
                                <InputLabel>Platform Role</InputLabel>
                                <Select
                                    value={form.role}
                                    label="Platform Role"
                                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                                >
                                    <MenuItem value="Admin">Admin</MenuItem>
                                    <MenuItem value="Manager">Manager</MenuItem>
                                </Select>
                            </FormControl>
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={handleClose}>Cancel</Button>
                        <Button type="submit" variant="contained">
                            Save
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Container>
    );
}

export default function PlatformUsersPage() {
    return (
        <PlatformLayout>
            <UsersManagementContent />
        </PlatformLayout>
    );
}
