"use client";

import PlatformRouteGuard from "@/components/layout/PlatformRouteGuard";
import { usePlatformAuth } from "@/hooks/usePlatformAuth";
import { usePlatformDashboardStats } from "@/hooks/usePlatformDashboardStats";
import {
    Container, Paper, Typography, Button, Stack, Box, Grid, Card, CardContent, CircularProgress
} from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import PeopleIcon from "@mui/icons-material/People";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import PlatformLayout from "@/layouts/PlatformLayout";


function DashboardContent() {
    const { user, logout } = usePlatformAuth();
    const { stats, isLoading } = usePlatformDashboardStats();

    const statItems = [
        {
            title: "Total Companies",
            value: stats?.total_companies ?? 0,
            icon: <BusinessIcon sx={{ fontSize: 40, color: "primary.main" }} />,
            color: "primary.light",
        },
        {
            title: "Active Companies",
            value: stats?.active_companies ?? 0,
            icon: <CheckCircleIcon sx={{ fontSize: 40, color: "success.main" }} />,
            color: "success.light",
        },
        {
            title: "Total Users (Cross-Tenant)",
            value: stats?.total_users ?? 0,
            icon: <PeopleIcon sx={{ fontSize: 40, color: "info.main" }} />,
            color: "info.light",
        },
        {
            title: "Platform Managers",
            value: stats?.platform_managers ?? 0,
            icon: <AdminPanelSettingsIcon sx={{ fontSize: 40, color: "warning.main" }} />,
            color: "warning.light",
        },
        {
            title: "New Companies (This Month)",
            value: stats?.companies_added_this_month ?? 0,
            icon: <CalendarMonthIcon sx={{ fontSize: 40, color: "secondary.main" }} />,
            color: "secondary.light",
        },
        {
            title: "Paid Subscriptions (Plans)",
            value: stats?.companies_on_paid_plans ?? 0,
            icon: <CreditCardIcon sx={{ fontSize: 40, color: "error.main" }} />,
            color: "error.light",
        },
    ];

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <Stack spacing={4}>
                {/* Header Section */}
                <Paper sx={{ p: 4, borderRadius: 2 }} elevation={2}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
                        <Box>
                            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
                                Platform Dashboard
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                                Welcome back, {user?.name || "Platform Admin"}! Here is the platform-wide operational overview.
                            </Typography>
                        </Box>
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={() => logout.mutate()}
                            disabled={logout.isPending}
                        >
                            {logout.isPending ? "Logging out..." : "Logout"}
                        </Button>
                    </Box>
                </Paper>

                {/* Widgets Grid */}
                {isLoading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        {statItems.map((item, index) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                                <Card sx={{ borderRadius: 2, height: "100%", boxShadow: 1 }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Stack sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                            <Stack spacing={1}>
                                                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                                                    {item.title}
                                                </Typography>
                                                <Typography variant="h3" sx={{ fontWeight: 800 }}>
                                                    {item.value}
                                                </Typography>
                                            </Stack>
                                            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `${item.color}15` }}>
                                                {item.icon}
                                            </Box>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Stack>
        </Container>
    );
}

export default function PlatformDashboardPage() {
    return (
        <PlatformLayout>
            <DashboardContent />
        </PlatformLayout>
    );
}