"use client";

import { ReactNode, useState } from "react";
import PlatformRouteGuard from "@/components/layout/PlatformRouteGuard";
import { usePlatformAuth } from "@/hooks/usePlatformAuth";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import {
    Box, AppBar, Toolbar, Typography, Drawer, List, ListItemButton,
    ListItemIcon, ListItemText, IconButton, Avatar, Menu, MenuItem
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BusinessIcon from "@mui/icons-material/Business";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import PeopleIcon from "@mui/icons-material/People";
import HistoryIcon from "@mui/icons-material/History";
import SettingsIcon from "@mui/icons-material/Settings";
import MenuIcon from "@mui/icons-material/Menu";

const drawerWidth = 240;

interface NavItem {
    label: string;
    href: string;
    icon: ReactNode;
}

const navItems: NavItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: <DashboardIcon /> },
    { label: "Companies", href: "/companies", icon: <BusinessIcon /> },
    { label: "Pricing Plans", href: "/plans", icon: <CreditCardIcon /> },
    { label: "Platform Users", href: "/users", icon: <PeopleIcon /> },
    { label: "Platform Audit Logs", href: "/activity-logs", icon: <HistoryIcon /> },
    { label: "Platform Settings", href: "/settings", icon: <SettingsIcon /> },
];

function PlatformLayoutContent({ children }: { children: ReactNode }) {
    const { user, logout } = usePlatformAuth();
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
    };

    const drawerContent = (
        <List sx={{ mt: 2 }}>
            {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                    <ListItemButton
                        key={item.label}
                        component={NextLink}
                        href={item.href}
                        selected={isActive}
                        sx={{
                            mx: 1.5,
                            my: 0.5,
                            borderRadius: 1,
                            "&.Mui-selected": {
                                bgcolor: "primary.light",
                                color: "primary.contrastText",
                                "& .MuiListItemIcon-root": {
                                    color: "primary.contrastText",
                                },
                            },
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: 40, color: isActive ? "inherit" : "text.secondary" }}>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText primary={item.label} slotProps={{
                            primary: {
                                sx: { fontWeight: 600 }
                            }
                        }} />
                    </ListItemButton>
                );
            })}
        </List>
    );

    return (
        <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "grey.50" }}>
            {/* Top Header */}
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        <IconButton
                            color="inherit"
                            edge="start"
                            onClick={() => setMobileOpen(!mobileOpen)}
                            sx={{ mr: 2, display: { sm: "none" } }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" noWrap sx={{ fontWeight: 800 }}>
                            OpsPilot Platform
                        </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        {user && (
                            <Typography variant="body2" sx={{ fontWeight: 600, display: { xs: "none", sm: "block" } }}>
                                {user.name} ({user.roles?.[0]?.name || "Operator"})
                            </Typography>
                        )}
                        <IconButton onClick={handleMenu} color="inherit" sx={{ p: 0.5 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.dark" }}>
                                {user?.name?.[0]?.toUpperCase() || "O"}
                            </Avatar>
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleCloseMenu}
                            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                            transformOrigin={{ vertical: "top", horizontal: "right" }}
                        >
                            <MenuItem disabled sx={{ opacity: "1 !important" }}>
                                <Box>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{user?.name}</Typography>
                                    <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
                                </Box>
                            </MenuItem>
                            <MenuItem
                                onClick={() => {
                                    handleCloseMenu();
                                    logout.mutate();
                                }}
                                sx={{ color: "error.main" }}
                            >
                                Logout
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Left Sidebar Drawer */}
            <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
                {/* Temporary Drawer for Mobile Screens */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={() => setMobileOpen(false)}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: "block", sm: "none" },
                        "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
                    }}
                >
                    <Toolbar />
                    {drawerContent}
                </Drawer>

                {/* Permanent Drawer for Desktop Screens */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: "none", sm: "block" },
                        "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth, borderRight: "1px solid", borderColor: "divider" },
                    }}
                    open
                >
                    <Toolbar />
                    {drawerContent}
                </Drawer>
            </Box>

            {/* Content Area */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 4,
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <Toolbar />
                <Box sx={{ flexGrow: 1 }}>
                    {children}
                </Box>
            </Box>
        </Box>
    );
}

export default function PlatformLayout({ children }: { children: ReactNode }) {
    return (
        <PlatformRouteGuard>
            <PlatformLayoutContent>{children}</PlatformLayoutContent>
        </PlatformRouteGuard>
    );
}
