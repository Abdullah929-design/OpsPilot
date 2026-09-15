"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import AuthenticatedLayout from "@/layouts/AuthenticatedLayout";
import { useQuery } from "@tanstack/react-query";
import { employeeService } from "@/services/employeeService";
import EmployeeAvatar from "@/components/common/EmployeeAvatar";
import StatusBadge from "@/components/common/StatusBadge";
import apiClient from "@/services/apiClient";
import { useQueryClient } from "@tanstack/react-query";
import ChangeStatusDialog from "@/components/employees/ChangeStatusDialog";
import EmployeeDocumentsTab from "@/components/employees/EmployeeDocumentsTab";
import {
    Typography,
    Box,
    Paper,
    Grid,
    Stack,
    Button,
    CircularProgress,
    Alert,
    Tabs,
    Tab,
    Card,
    CardContent,
    Divider,
    Chip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LinkIcon from "@mui/icons-material/Link";
import PersonIcon from "@mui/icons-material/Person";

export default function EmployeeProfilePage() {
    const params = useParams();
    const employeeId = Number(params.id);
    const [activeTab, setActiveTab] = useState(0);
    const queryClient = useQueryClient();
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [statusErrorMsg, setStatusErrorMsg] = useState<string | null>(null);
    const [statusPending, setStatusPending] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastSeverity, setToastSeverity] = useState<"success" | "error">("success");


    // Add this handler for photo upload:
    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        employeeService.uploadPhoto(employeeId, file)
            .then(() => {
                queryClient.invalidateQueries({ queryKey: ["employee", employeeId] });
            })
            .catch((err) => {
                alert(err?.response?.data?.message || "Failed to upload profile photo.");
            });
    };

    const handleStatusConfirm = (newStatus: string) => {
        setStatusPending(true);
        setStatusErrorMsg(null);

        employeeService.updateStatus(employeeId, newStatus)
            .then(() => {
                setStatusPending(false);
                setStatusDialogOpen(false);
                queryClient.invalidateQueries({ queryKey: ["employee", employeeId] });
            })
            .catch((err) => {
                setStatusPending(false);
                setStatusErrorMsg(err?.response?.data?.message || "Failed to update employment status.");
            });
    };


    // Fetch Employee Details
    const { data: employee, isLoading, isError } = useQuery({
        queryKey: ["employee", employeeId],
        queryFn: () => employeeService.getEmployees({}).then(() =>
            apiClient.get(`/v1/employees/${employeeId}`).then(res => res.data.data)
        ),
    });

    if (isLoading) {
        return (
            <AuthenticatedLayout>
                <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
                    <CircularProgress />
                </Box>
            </AuthenticatedLayout>
        );
    }

    if (isError || !employee) {
        return (
            <AuthenticatedLayout>
                <Alert severity="error">Failed to load employee details. Please try again.</Alert>
            </AuthenticatedLayout>
        );
    }

    const isLinked = !!employee.user_id;

    return (
        <AuthenticatedLayout>
            {/* Header / Back Action */}
            <Box sx={{ mb: 3 }}>
                <Button
                    variant="text"
                    startIcon={<ArrowBackIcon />}
                    href="/employees"
                    sx={{ mb: 2 }}
                >
                    Back to Directory
                </Button>

                <Paper sx={{ p: 3, borderRadius: 2 }}>
                    <Stack
                        direction={{ xs: "column", md: "row" }}
                        spacing={3}
                        sx={{ alignItems: "center", justifyContent: "space-between" }}
                    >
                        <Stack direction="row" spacing={3} sx={{ alignItems: "center" }}>
                            <EmployeeAvatar
                                firstName={employee.first_name}
                                lastName={employee.last_name}
                                photoUrl={employee.profile_photo}
                                size={80}
                            />
                            <Stack spacing={0.5}>
                                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                    {employee.first_name} {employee.last_name}
                                </Typography>
                                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                                    <Typography variant="body1" color="text.secondary">
                                        {employee.designation?.title || "No Title"} — {employee.department?.name || "No Dept"}
                                    </Typography>
                                    <StatusBadge status={employee.employment_status} />
                                    {/* Upload Button: Rendered only if employee is NOT linked to a platform user */}
                                    {!isLinked && (
                                        <Button
                                            variant="outlined"
                                            component="label"
                                            size="small"
                                            sx={{ ml: 2, py: 0.25, fontSize: "0.75rem" }}
                                        >
                                            Change Photo
                                            <input
                                                type="file"
                                                hidden
                                                accept="image/*"
                                                onChange={handlePhotoUpload}
                                            />
                                        </Button>
                                    )}
                                </Stack>
                            </Stack>
                            <Stack direction="row" spacing={1} sx={{ alignItems: "center", mt: 1 }}>
                                {isLinked ? (
                                    <Chip
                                        icon={<LinkIcon />}
                                        label="Linked to User Account"
                                        color="primary"
                                        variant="outlined"
                                        size="small"
                                    />
                                ) : (
                                    <Chip
                                        icon={<PersonIcon />}
                                        label="Standalone HR Record"
                                        color="default"
                                        variant="outlined"
                                        size="small"
                                    />
                                )}
                            </Stack>
                        </Stack>

                        <Button
                            variant="contained"
                            startIcon={<EditIcon />}
                            href={`/employees/${employee.id}/edit`}
                        >
                            Edit Profile
                        </Button>
                    </Stack>
                </Paper>
            </Box>

            <Stack direction="row" spacing={2}>
                <Button
                    variant="outlined"
                    onClick={() => {
                        setStatusErrorMsg(null);
                        setStatusDialogOpen(true);
                    }}
                >
                    Change Status
                </Button>
                <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    href={`/employees/${employee.id}/edit`}
                >
                    Edit Profile
                </Button>
            </Stack>


            {/* Profile Tab Navigation */}
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
                <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)}>
                    <Tab label="Overview" />
                    <Tab label="Documents" />
                    <Tab label="Performance (Stub)" disabled />
                    <Tab label="Assets (Stub)" disabled />
                    <Tab label="Leave (Stub)" disabled />
                    <Tab label="Attendance (Stub)" disabled />
                </Tabs>
            </Box>

            {/* Overview Tab Content */}
            {
                activeTab === 0 && (
                    <Grid container spacing={3}>
                        {/* Column 1: Personal and Contact */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Stack spacing={3}>
                                <Card sx={{ borderRadius: 2 }}>
                                    <CardContent>
                                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                            Personal & Contact Information
                                        </Typography>
                                        <Stack spacing={2}>
                                            <Grid container>
                                                <Grid size={5}><Typography variant="body2" color="text.secondary">Email:</Typography></Grid>
                                                <Grid size={7}><Typography variant="body2">{employee.email}</Typography></Grid>
                                            </Grid>
                                            <Divider />
                                            <Grid container>
                                                <Grid size={5}><Typography variant="body2" color="text.secondary">Phone:</Typography></Grid>
                                                <Grid size={7}><Typography variant="body2">{employee.phone || "Not provided"}</Typography></Grid>
                                            </Grid>
                                            <Divider />
                                            <Grid container>
                                                <Grid size={5}><Typography variant="body2" color="text.secondary">Gender:</Typography></Grid>
                                                <Grid size={7}><Typography variant="body2" sx={{ textTransform: "capitalize" }}>{employee.gender || "Not specified"}</Typography></Grid>
                                            </Grid>
                                            <Divider />
                                            <Grid container>
                                                <Grid size={5}><Typography variant="body2" color="text.secondary">Date of Birth:</Typography></Grid>
                                                <Grid size={7}><Typography variant="body2">{employee.date_of_birth || "Not specified"}</Typography></Grid>
                                            </Grid>
                                            <Divider />
                                            <Grid container>
                                                <Grid size={5}><Typography variant="body2" color="text.secondary">Address:</Typography></Grid>
                                                <Grid size={7}>
                                                    <Typography variant="body2">
                                                        {employee.address ? `${employee.address}, ${employee.city || ""}, ${employee.country || ""}` : "Not specified"}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </Stack>
                                    </CardContent>
                                </Card>

                                <Card sx={{ borderRadius: 2 }}>
                                    <CardContent>
                                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                            Emergency Contact Details
                                        </Typography>
                                        <Stack spacing={2}>
                                            <Grid container>
                                                <Grid size={5}><Typography variant="body2" color="text.secondary">Contact Person:</Typography></Grid>
                                                <Grid size={7}><Typography variant="body2">{employee.emergency_contact_name || "Not provided"}</Typography></Grid>
                                            </Grid>
                                            <Divider />
                                            <Grid container>
                                                <Grid size={5}><Typography variant="body2" color="text.secondary">Contact Phone:</Typography></Grid>
                                                <Grid size={7}><Typography variant="body2">{employee.emergency_contact_phone || "Not provided"}</Typography></Grid>
                                            </Grid>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Stack>
                        </Grid>

                        {/* Column 2: Employment & Org details */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Card sx={{ borderRadius: 2 }}>
                                <CardContent>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                        Organization & Employment Information
                                    </Typography>
                                    <Stack spacing={2}>
                                        <Grid container>
                                            <Grid size={5}><Typography variant="body2" color="text.secondary">Employee Code:</Typography></Grid>
                                            <Grid size={7}><Typography variant="body2" sx={{ fontWeight: 600 }}>{employee.employee_code}</Typography></Grid>
                                        </Grid>
                                        <Divider />
                                        <Grid container>
                                            <Grid size={5}><Typography variant="body2" color="text.secondary">Department:</Typography></Grid>
                                            <Grid size={7}><Typography variant="body2">{employee.department?.name || "N/A"}</Typography></Grid>
                                        </Grid>
                                        <Divider />
                                        <Grid container>
                                            <Grid size={5}><Typography variant="body2" color="text.secondary">Team:</Typography></Grid>
                                            <Grid size={7}><Typography variant="body2">{employee.team?.name || "N/A"}</Typography></Grid>
                                        </Grid>
                                        <Divider />
                                        <Grid container>
                                            <Grid size={5}><Typography variant="body2" color="text.secondary">Designation:</Typography></Grid>
                                            <Grid size={7}><Typography variant="body2">{employee.designation?.title || "N/A"}</Typography></Grid>
                                        </Grid>
                                        <Divider />
                                        <Grid container>
                                            <Grid size={5}><Typography variant="body2" color="text.secondary">Office Location:</Typography></Grid>
                                            <Grid size={7}><Typography variant="body2">{employee.office_location?.name || "N/A"}</Typography></Grid>
                                        </Grid>
                                        <Divider />
                                        <Grid container>
                                            <Grid size={5}><Typography variant="body2" color="text.secondary">Reporting Manager:</Typography></Grid>
                                            <Grid size={7}><Typography variant="body2">{employee.manager?.name || "Top Level (No Manager)"}</Typography></Grid>
                                        </Grid>
                                        <Divider />
                                        <Grid container>
                                            <Grid size={5}><Typography variant="body2" color="text.secondary">Joining Date:</Typography></Grid>
                                            <Grid size={7}><Typography variant="body2">{employee.joining_date || "N/A"}</Typography></Grid>
                                        </Grid>
                                        <Divider />
                                        <Grid container>
                                            <Grid size={5}><Typography variant="body2" color="text.secondary">Employment Type:</Typography></Grid>
                                            <Grid size={7}>
                                                <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
                                                    {employee.employment_type?.replace("_", " ")}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                )
            }

            {/* Documents Tab Content */}
            {activeTab === 1 && (
                <EmployeeDocumentsTab employeeId={employeeId} />
            )}

            {/* Change Status Dialog */}
            <ChangeStatusDialog
                open={statusDialogOpen}
                currentStatus={employee.employment_status}
                onConfirm={handleStatusConfirm}
                onCancel={() => setStatusDialogOpen(false)}
                isPending={statusPending}
                errorMsg={statusErrorMsg}
            />
        </AuthenticatedLayout >
    );
}
