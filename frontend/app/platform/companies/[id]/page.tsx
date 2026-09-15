"use client";

import { use, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import PlatformRouteGuard from "@/components/layout/PlatformRouteGuard";
import { usePlatformCompanies } from "@/hooks/usePlatformCompanies";
import apiClient from "@/services/apiClient";
import { usePlatformPlans } from "@/hooks/usePlatformPlans";
import { usePlatformUsers } from "@/hooks/usePlatformUsers";
import {
    usePlatformCompanyUsers, usePlatformCompanyRoles,
    usePlatformCompanySettings, usePlatformCompanyActivityLogs
} from "@/hooks/usePlatformCompanyAdmin";
import {
    Container, Paper, Typography, Button, Grid, Stack, Box,
    CircularProgress, Select, MenuItem, InputLabel, FormControl, Alert, Divider,
    Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TextField, Checkbox, FormControlLabel, Pagination, Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import PlatformLayout from "@/layouts/PlatformLayout";
import { usePlatformAuth } from "@/hooks/usePlatformAuth";
import { usePlatformCompanyEmployees } from "@/hooks/usePlatformCompanyAdmin";


// All tenant guard 'web' permissions available to assign
const ALL_TENANT_PERMISSIONS = [
    "users.view", "users.create", "users.update", "users.delete",
    "roles.manage", "permissions.manage",
    "profile.update", "dashboard.view", "logs.activity.view", "logs.audit.view",
    "company.view", "company.update",
    "departments.view", "departments.create", "departments.update", "departments.delete",
    "teams.manage", "designations.manage", "offices.manage"
];

const renderLogProperties = (properties: any) => {
    if (!properties || typeof properties !== 'object' || Object.keys(properties).length === 0) {
        return "-";
    }

    return (
        <Stack spacing={0.5}>
            {Object.entries(properties).map(([key, val]) => {
                const displayVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
                const formattedKey = key
                    .split('_')
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');

                return (
                    <Box key={key} sx={{ display: 'flex', gap: 1, fontSize: '0.8rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600, color: '#4b5563' }}>{formattedKey}:</span>
                        <span style={{ color: '#1f2937' }}>{displayVal}</span>
                    </Box>
                );
            })}
        </Stack>
    );
};


function CompanyDetailContent({ companyId }: { companyId: number }) {
    const [activeTab, setActiveTab] = useState(0);
    const { company, isLoading: isCompanyLoading, suspendCompany, activateCompany, changePlan, assignManager, updateCompany, updateSubdomain } = usePlatformCompanies(companyId);
    const { plans } = usePlatformPlans();
    const { users: platformUsers } = usePlatformUsers();

    // Tab State
    const { users: tenantUsers, createUser, updateUser, deleteUser } = usePlatformCompanyUsers(companyId);
    const { roles: tenantRoles, syncPermissions } = usePlatformCompanyRoles(companyId);
    const { settings: tenantSettings, updateSettings } = usePlatformCompanySettings(companyId);
    const [logPage, setLogPage] = useState(1);
    const { logs, pagination } = usePlatformCompanyActivityLogs(companyId, logPage);

    const { user: currentPlatformUser } = usePlatformAuth();
    const isPlatformAdmin = currentPlatformUser?.roles?.some((r: any) => r.name === "Admin");

    const { employees: tenantEmployees, createEmployee, updateEmployee, deleteEmployee } = usePlatformCompanyEmployees(companyId);

    // Modal state for employees
    const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<any>(null);
    const [employeeForm, setEmployeeForm] = useState({
        first_name: "", last_name: "", email: "", employee_code: "",
        department_id: "" as number | "", designation_id: "" as number | "", office_location_id: "" as number | "",
        employment_type: "full_time", employment_status: "active", joining_date: ""
    });

    // Dropdown options loaders
    const { data: deptOptions = [] } = useQuery({
        queryKey: ["platform_depts", companyId],
        queryFn: () => apiClient.get(`/platform/companies/${companyId}/departments`).then(r => r.data.data || [])
    });
    const { data: desgOptions = [] } = useQuery({
        queryKey: ["platform_desgs", companyId],
        queryFn: () => apiClient.get(`/platform/companies/${companyId}/designations`).then(r => r.data.data || [])
    });
    const { data: officeOptions = [] } = useQuery({
        queryKey: ["platform_offices", companyId],
        queryFn: () => apiClient.get(`/platform/companies/${companyId}/offices`).then(r => r.data.data || [])
    });

    const handleOpenEmployeeModal = (emp: any = null) => {
        if (emp) {
            setEditingEmployee(emp);
            setEmployeeForm({
                first_name: emp.first_name || "",
                last_name: emp.last_name || "",
                email: emp.email || "",
                employee_code: emp.employee_code || "",
                department_id: emp.department?.id || "",
                designation_id: emp.designation?.id || "",
                office_location_id: emp.office_location?.id || "",
                employment_type: emp.employment_type || "full_time",
                employment_status: emp.employment_status || "active",
                joining_date: emp.joining_date || ""
            });
        } else {
            setEditingEmployee(null);
            setEmployeeForm({
                first_name: "", last_name: "", email: "", employee_code: "",
                department_id: "", designation_id: "", office_location_id: "",
                employment_type: "full_time", employment_status: "active", joining_date: ""
            });
        }
        setEmployeeModalOpen(true);
    };

    const handleSaveEmployee = async () => {
        try {
            // Clean empty strings to null for optional number values
            const payload = {
                ...employeeForm,
                department_id: employeeForm.department_id === "" ? null : Number(employeeForm.department_id),
                designation_id: employeeForm.designation_id === "" ? null : Number(employeeForm.designation_id),
                office_location_id: employeeForm.office_location_id === "" ? null : Number(employeeForm.office_location_id),
            };

            if (editingEmployee) {
                await updateEmployee.mutateAsync({ employeeId: editingEmployee.id, employeeData: payload });
            } else {
                await createEmployee.mutateAsync(payload);
            }
            setEmployeeModalOpen(false);
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to save employee.");
        }
    };

    const [subdomain, setSubdomain] = useState("");
    const [subdomainStatus, setSubdomainStatus] = useState<{
        checking: boolean;
        available: boolean | null;
        message: string;
    }>({ checking: false, available: null, message: "" });

    // Initialize input when company details load
    useEffect(() => {
        if (company?.subdomain) {
            setSubdomain(company.subdomain);
        }
    }, [company]);

    // Live Subdomain Debounced Checker
    useEffect(() => {
        const cleanSubdomain = subdomain.trim().toLowerCase();
        if (!cleanSubdomain || cleanSubdomain === company?.subdomain) {
            setSubdomainStatus({ checking: false, available: null, message: "" });
            return;
        }

        const formatValid = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(cleanSubdomain);
        if (!formatValid) {
            setSubdomainStatus({ checking: false, available: false, message: "Invalid format (lowercase, numbers, hyphens only)." });
            return;
        }

        const reserved = ['www', 'api', 'admin', 'platform', 'app', 'mail', 'static', 'assets', 'cdn', 'docs', 'support', 'status'];
        if (reserved.includes(cleanSubdomain)) {
            setSubdomainStatus({ checking: false, available: false, message: "This subdomain is reserved." });
            return;
        }

        setSubdomainStatus((prev) => ({ ...prev, checking: true }));

        const delayDebounceFn = setTimeout(() => {
            apiClient.get(`/platform/companies/subdomain-check?value=${cleanSubdomain}`)
                .then((res) => {
                    const isAvailable = res.data.data.available;
                    setSubdomainStatus({
                        checking: false,
                        available: isAvailable,
                        message: isAvailable ? "Subdomain is available!" : "Subdomain is already taken."
                    });
                })
                .catch(() => {
                    setSubdomainStatus({ checking: false, available: null, message: "Failed to check availability." });
                });
        }, 400);

        return () => clearTimeout(delayDebounceFn);
    }, [subdomain, company]);

    const getLiveUrlPreview = (subVal: string) => {
        if (typeof window === "undefined") return "";
        const host = window.location.host;
        const parts = host.split(".");
        if (host.includes("localhost") || parts.length < 2) {
            return `http://${subVal}.OpsPilot.test:3000`;
        }
        const baseDomain = parts.slice(1).join(".");
        return `${window.location.protocol}//${subVal}.${baseDomain}`;
    };

    const handleSaveSubdomain = async () => {
        if (subdomainStatus.available === false || !subdomain || !company) return;

        // Show a clear warning before confirming
        const confirmed = window.confirm(
            "WARNING: Changing this subdomain will break any bookmarked links to the old address.\n\nAre you sure you want to proceed?"
        );
        if (!confirmed) return;

        try {
            await updateSubdomain.mutateAsync({
                companyId: company.id,
                subdomain: subdomain.trim().toLowerCase()
            });
            alert("Subdomain updated successfully!");
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to update subdomain.");
        }
    };


    // Local settings form state
    const [settingsForm, setSettingsForm] = useState<any>({});
    useEffect(() => {
        if (tenantSettings) {
            setSettingsForm(tenantSettings);
        }
    }, [tenantSettings]);

    const [userModalOpen, setUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [userForm, setUserForm] = useState({ name: "", email: "", password: "", roles: [] as string[], is_active: true });



    if (isCompanyLoading || !company) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    const handleStatusToggle = async () => {
        if (company.platform_status === "active") {
            await suspendCompany.mutateAsync(company.id);
        } else {
            await activateCompany.mutateAsync(company.id);
        }
    };

    const handleOpenUserModal = (user: any = null) => {
        if (user) {
            setEditingUser(user);
            setUserForm({
                name: user.name,
                email: user.email,
                password: "",
                roles: user.roles?.map((r: any) => r.name) || [],
                is_active: user.is_active ?? true
            });
        } else {
            setEditingUser(null);
            setUserForm({ name: "", email: "", password: "", roles: [], is_active: true });
        }
        setUserModalOpen(true);
    };


    const handleSaveUser = async () => {
        const payload = { ...userForm };

        // Strip empty password to avoid triggering validation rules
        if (!payload.password) {
            delete (payload as any).password;
        }


        try {
            if (editingUser) {
                await updateUser.mutateAsync({ userId: editingUser.id, userData: payload });
            } else {
                await createUser.mutateAsync(payload);
            }
            setUserModalOpen(false);
        } catch (err: any) {
            const data = err.response?.data;
            const errorMsg = data?.message || "Failed to save user.";
            const errors = data?.errors as Record<string, string[]> | undefined;
            const fieldErrors = errors
                ? Object.entries(errors).map(([field, msgs]) => `${field}: ${msgs.join(", ")}`).join("\n")
                : null;
            const detailedMsg = fieldErrors ? `${errorMsg}\n\n${fieldErrors}` : errorMsg;
            alert(detailedMsg);
        }
    };



    const handlePermissionToggle = async (role: any, permissionName: string) => {
        const active = role.permissions?.map((p: any) => p.name) || [];
        const newPermissions = active.includes(permissionName)
            ? active.filter((p: string) => p !== permissionName)
            : [...active, permissionName];

        await syncPermissions.mutateAsync({ roleId: role.id, permissions: newPermissions });
    };

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <Paper sx={{ p: 4, borderRadius: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {company.name} Administration
                    </Typography>
                    <Button
                        variant="contained"
                        color={company.platform_status === "active" ? "error" : "success"}
                        onClick={handleStatusToggle}
                        disabled={suspendCompany.isPending || activateCompany.isPending}
                    >
                        {company.platform_status === "active" ? "Suspend Company" : "Activate Company"}
                    </Button>
                </Box>

                <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 4 }}>
                    <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)}>
                        <Tab label="Overview" />
                        <Tab label="Users" />
                        <Tab label="Employees" />
                        <Tab label="Roles & Permissions" />
                        <Tab label="Settings" />
                        <Tab label="Audit Logs" />
                    </Tabs>
                </Box>

                {/* 1. Overview Tab */}
                {activeTab === 0 && (
                    <Grid container spacing={4}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Stack spacing={3}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>System Configuration</Typography>
                                <FormControl fullWidth>
                                    <InputLabel>Subscription Plan</InputLabel>
                                    <Select
                                        value={company.plan_id ?? ""}
                                        label="Subscription Plan"
                                        onChange={(e) => changePlan.mutate({ companyId: company.id, planId: e.target.value ? Number(e.target.value) : null })}
                                    >
                                        <MenuItem value=""><em>None</em></MenuItem>
                                        {plans.map((p) => (
                                            <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth>
                                    <InputLabel>Assigned Manager</InputLabel>
                                    <Select
                                        value={company.assigned_manager_id ?? ""}
                                        label="Assigned Manager"
                                        onChange={(e) => assignManager.mutate({ companyId: company.id, managerId: e.target.value ? Number(e.target.value) : null })}
                                    >
                                        <MenuItem value=""><em>Unassigned</em></MenuItem>
                                        {platformUsers.map((u) => (
                                            <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <Paper variant="outlined" sx={{ p: 3, mt: 2 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                                        Domain customization
                                    </Typography>
                                    <Stack spacing={2}>
                                        <TextField
                                            label="Company Subdomain"
                                            value={subdomain}
                                            onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                                            error={subdomainStatus.available === false}
                                            helperText={subdomainStatus.checking ? "Checking..." : subdomainStatus.message}
                                        />
                                        {subdomain && (
                                            <Box sx={{ fontSize: "0.85rem", color: subdomainStatus.available ? "success.main" : "text.secondary" }}>
                                                Portal Address: <strong>{getLiveUrlPreview(subdomain)}</strong>
                                            </Box>
                                        )}
                                        <Button
                                            variant="contained"
                                            onClick={handleSaveSubdomain}
                                            disabled={
                                                subdomain === company?.subdomain ||
                                                subdomainStatus.available === false ||
                                                subdomainStatus.checking ||
                                                updateSubdomain.isPending
                                            }
                                        >
                                            {updateSubdomain.isPending ? "Saving..." : "Save Subdomain"}
                                        </Button>
                                    </Stack>
                                </Paper>
                            </Stack>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Stack spacing={2}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>Company Metadata</Typography>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Legal Name</Typography>
                                    <Typography variant="body1">{company.legal_name || "N/A"}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Contact Email</Typography>
                                    <Typography variant="body1">{company.email || "N/A"}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Timezone & Currency</Typography>
                                    <Typography variant="body1">{company.timezone} ({company.currency})</Typography>
                                </Box>
                            </Stack>
                        </Grid>
                    </Grid>
                )}

                {/* 2. Users Tab */}
                {activeTab === 1 && (
                    <Stack spacing={3}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>Tenant Users</Typography>
                            <Button variant="contained" size="small" onClick={() => handleOpenUserModal()}>Add User</Button>
                        </Box>

                        <TableContainer component={Paper} variant="outlined">
                            <Table>
                                <TableHead sx={{ bgcolor: "grey.50" }}>
                                    <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Email</TableCell>
                                        <TableCell>Roles</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {tenantUsers.map((u) => (
                                        <TableRow key={u.id}>
                                            <TableCell sx={{ fontWeight: 600 }}>{u.name}</TableCell>
                                            <TableCell>{u.email}</TableCell>
                                            <TableCell>{u.roles?.map((r) => r.name).join(", ") || "-"}</TableCell>
                                            <TableCell>{u.is_active ? "Active" : "Disabled"}</TableCell>
                                            <TableCell align="right">
                                                <Button size="small" onClick={() => handleOpenUserModal(u)}>Edit</Button>
                                                <Button
                                                    size="small"
                                                    color="error"
                                                    onClick={() => {
                                                        if (confirm("Are you sure you want to remove this user from this company? If they do not belong to any other company, their account will be soft-deleted.")) {
                                                            deleteUser.mutate(u.id);
                                                        }
                                                    }}
                                                >
                                                    Remove
                                                </Button>

                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Stack>
                )}

                {/* 2.5. Employees Tab */}
                {activeTab === 2 && (
                    <Stack spacing={3}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>Tenant Employees</Typography>
                            {isPlatformAdmin && (
                                <Button variant="contained" size="small" onClick={() => handleOpenEmployeeModal()}>
                                    Add Employee
                                </Button>
                            )}
                        </Box>

                        <TableContainer component={Paper} variant="outlined">
                            <Table>
                                <TableHead sx={{ bgcolor: "grey.50" }}>
                                    <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Code</TableCell>
                                        <TableCell>Designation</TableCell>
                                        <TableCell>Department</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {tenantEmployees.map((emp) => (
                                        <TableRow key={emp.id}>
                                            <TableCell sx={{ fontWeight: 600 }}>
                                                {emp.first_name} {emp.last_name}
                                            </TableCell>
                                            <TableCell>{emp.employee_code}</TableCell>
                                            <TableCell>{emp.designation?.title || "-"}</TableCell>
                                            <TableCell>{emp.department?.name || "-"}</TableCell>
                                            <TableCell sx={{ textTransform: "capitalize" }}>{emp.employment_status}</TableCell>
                                            <TableCell align="right">
                                                <Button size="small" onClick={() => handleOpenEmployeeModal(emp)}>Edit</Button>
                                                {isPlatformAdmin && (
                                                    <Button
                                                        size="small"
                                                        color="error"
                                                        onClick={async () => {
                                                            if (confirm("Are you sure you want to delete this employee?")) {
                                                                try {
                                                                    await deleteEmployee.mutateAsync(emp.id);
                                                                } catch (err: any) {
                                                                    alert(err.response?.data?.message || "Failed to delete employee.");
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        Delete
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Stack>
                )}

                {/* 3. Roles Tab */}
                {activeTab === 3 && (
                    <Stack spacing={3}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>Role Scopes & Permissions</Typography>
                        {tenantRoles.map((role) => {
                            const active = role.permissions?.map((p: any) => p.name) || [];
                            return (
                                <Paper variant="outlined" sx={{ p: 3, mb: 2 }} key={role.id}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                                        Role: {role.name}
                                    </Typography>
                                    <Grid container spacing={1}>
                                        {ALL_TENANT_PERMISSIONS.map((perm) => (
                                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={perm}>
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={active.includes(perm)}
                                                            onChange={() => handlePermissionToggle(role, perm)}
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

                {/* 4. Settings Tab */}
                {activeTab === 4 && (
                    <Stack spacing={3}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>Company Configuration Defaults</Typography>
                        {updateSettings.isSuccess && <Alert severity="success">Settings updated successfully!</Alert>}
                        <TextField
                            label="Business Name"
                            fullWidth
                            value={settingsForm.company_name || ""}
                            onChange={(e) => setSettingsForm({ ...settingsForm, company_name: e.target.value })}
                        />
                        <TextField
                            label="Contact Phone"
                            fullWidth
                            value={settingsForm.contact_phone || ""}
                            onChange={(e) => setSettingsForm({ ...settingsForm, contact_phone: e.target.value })}
                        />
                        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                            <Button
                                variant="contained"
                                onClick={() => updateSettings.mutate(settingsForm)}
                                disabled={updateSettings.isPending}
                            >
                                {updateSettings.isPending ? "Saving..." : "Save Settings"}
                            </Button>
                        </Box>
                    </Stack>
                )}


                {/* 5. Audit Tab */}
                {activeTab === 5 && (
                    <Stack spacing={3}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>Company Audit Trail</Typography>
                        <TableContainer component={Paper} variant="outlined">
                            <Table>
                                <TableHead sx={{ bgcolor: "grey.50" }}>
                                    <TableRow>
                                        <TableCell>Timestamp</TableCell>
                                        <TableCell>Operator</TableCell>
                                        <TableCell>Event</TableCell>
                                        <TableCell>Details</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {logs.map((log: any) => (
                                        <TableRow key={log.id}>
                                            <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>{log.causer?.name || "System"}</TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ fontFamily: "monospace", bgcolor: "grey.100", px: 1, py: 0.5, borderRadius: 1, display: "inline-block" }}>
                                                    {log.description}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ fontSize: "0.8rem" }}>{renderLogProperties(log.properties)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        {pagination.lastPage > 1 && (
                            <Box sx={{ display: "flex", justifyContent: "center" }}>
                                <Pagination count={pagination.lastPage} page={logPage} onChange={(_, v) => setLogPage(v)} color="primary" />
                            </Box>
                        )}
                    </Stack>
                )}
            </Paper>

            {/* User Create/Edit Dialog Modal */}
            <Dialog open={userModalOpen} onClose={() => setUserModalOpen(false)}>
                <DialogTitle>{editingUser ? "Edit User" : "Add User"}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1, width: 350 }}>
                        <TextField label="Name" fullWidth value={userForm.name} onChange={(e) => setUserForm({ ...userForm, name: e.target.value })} helperText={editingUser ? "" : "Leave blank if adding an existing system user"} />
                        <TextField label="Email" fullWidth value={userForm.email} onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} />
                        <TextField label="Password" type="password" fullWidth value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} helperText={editingUser ? "Leave blank to keep unchanged." : "Required. Leave blank to invite/attach an existing system user."} />
                        <FormControl fullWidth>
                            <InputLabel>Role</InputLabel>
                            <Select
                                value={userForm.roles[0] || ""}
                                label="Role"
                                onChange={(e) => setUserForm({ ...userForm, roles: e.target.value ? [e.target.value as string] : [] })}
                            >
                                {tenantRoles.map((r) => (
                                    <MenuItem key={r.name} value={r.name}>{r.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        {editingUser && (
                            <TextField
                                select
                                fullWidth
                                label="Status"
                                value={userForm.is_active ? "1" : "0"}
                                onChange={(e) => setUserForm({ ...userForm, is_active: e.target.value === "1" })}
                            >
                                <MenuItem value="1">Active</MenuItem>
                                <MenuItem value="0">Disabled</MenuItem>
                            </TextField>
                        )}
                    </Stack>

                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setUserModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveUser} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            {/* Employee Create/Edit Dialog Modal */}
            <Dialog open={employeeModalOpen} onClose={() => setEmployeeModalOpen(false)}>
                <DialogTitle>{editingEmployee ? "Edit Employee" : "Add Employee"}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1, width: 350 }}>
                        <TextField label="First Name" fullWidth value={employeeForm.first_name} onChange={(e) => setEmployeeForm({ ...employeeForm, first_name: e.target.value })} />
                        <TextField label="Last Name" fullWidth value={employeeForm.last_name} onChange={(e) => setEmployeeForm({ ...employeeForm, last_name: e.target.value })} />
                        <TextField label="Email" fullWidth value={employeeForm.email} onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })} />
                        <TextField label="Employee Code" fullWidth value={employeeForm.employee_code} onChange={(e) => setEmployeeForm({ ...employeeForm, employee_code: e.target.value })} />
                        <TextField label="Joining Date" type="date" fullWidth slotProps={{ inputLabel: { shrink: true } }} value={employeeForm.joining_date} onChange={(e) => setEmployeeForm({ ...employeeForm, joining_date: e.target.value })} />
                        
                        <FormControl fullWidth>
                            <InputLabel>Department</InputLabel>
                            <Select
                                value={employeeForm.department_id}
                                label="Department"
                                onChange={(e) => setEmployeeForm({ ...employeeForm, department_id: e.target.value })}
                            >
                                {deptOptions.map((d: any) => (
                                    <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>Designation</InputLabel>
                            <Select
                                value={employeeForm.designation_id}
                                label="Designation"
                                onChange={(e) => setEmployeeForm({ ...employeeForm, designation_id: e.target.value })}
                            >
                                {desgOptions.map((d: any) => (
                                    <MenuItem key={d.id} value={d.id}>{d.title}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>Office Location</InputLabel>
                            <Select
                                value={employeeForm.office_location_id}
                                label="Office Location"
                                onChange={(e) => setEmployeeForm({ ...employeeForm, office_location_id: e.target.value })}
                            >
                                <MenuItem value=""><em>None</em></MenuItem>
                                {officeOptions.map((o: any) => (
                                    <MenuItem key={o.id} value={o.id}>{o.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>Employment Type</InputLabel>
                            <Select
                                value={employeeForm.employment_type}
                                label="Employment Type"
                                onChange={(e) => setEmployeeForm({ ...employeeForm, employment_type: e.target.value })}
                            >
                                <MenuItem value="full_time">Full Time</MenuItem>
                                <MenuItem value="part_time">Part Time</MenuItem>
                                <MenuItem value="contract">Contract</MenuItem>
                                <MenuItem value="intern">Intern</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={employeeForm.employment_status}
                                label="Status"
                                onChange={(e) => setEmployeeForm({ ...employeeForm, employment_status: e.target.value })}
                            >
                                <MenuItem value="active">Active</MenuItem>
                                <MenuItem value="inactive">Inactive</MenuItem>
                                <MenuItem value="terminated">Terminated</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEmployeeModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveEmployee} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default function PlatformCompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const companyId = Number(resolvedParams.id);

    return (
        <PlatformLayout>
            <CompanyDetailContent companyId={companyId} />
        </PlatformLayout>
    );
}
