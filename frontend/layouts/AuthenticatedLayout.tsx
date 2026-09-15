"use client";

import { ReactNode, useState } from "react";
import NotificationBell from "@/components/layout/NotificationBell";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import HistoryIcon from "@mui/icons-material/History";
import BusinessIcon from "@mui/icons-material/Business";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import GroupsIcon from "@mui/icons-material/Groups";
import WorkIcon from "@mui/icons-material/Work";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import SettingsIcon from "@mui/icons-material/Settings";

import {
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  Select,
  Menu,
  MenuItem,
  Breadcrumbs,
  Link as MuiLink,
  Badge,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import DescriptionIcon from "@mui/icons-material/Description";
import NotificationsIcon from "@mui/icons-material/Notifications";
import RouteGuard from "@/components/layout/RouteGuard";
import { useAuth } from "@/hooks/useAuth";
import apiClient from "@/services/apiClient";
import NextLink from "next/link";
import FloatingAssistant from "@/components/ai/FloatingAssistant";

const drawerWidth = 240;

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: <DashboardIcon /> },
  { label: "Company Profile", href: "/company", icon: <BusinessIcon />, permission: "company.view" },
  { label: "Employees", href: "/employees", icon: <PeopleIcon />, permission: "employees.view" },
  { label: "Departments", href: "/departments", icon: <AccountTreeIcon />, permission: "departments.view" },
  { label: "Teams", href: "/teams", icon: <GroupsIcon />, permission: "departments.view" },
  { label: "Designations", href: "/designations", icon: <WorkIcon />, permission: "designations.manage" },
  { label: "Offices", href: "/offices", icon: <LocationOnIcon />, permission: "offices.manage" },
  { label: "Users", href: "/users", icon: <PeopleIcon />, permission: "users.view" },
  { label: "Documents", href: "/documents", icon: <DescriptionIcon />, permission: "documents.view" },
  { label: "Workflows", href: "/workflows", icon: <AccountTreeIcon />, permission: "workflow.view" },
  { label: "Roles", href: "/roles", icon: <AdminPanelSettingsIcon />, permission: "roles.manage" },
  { label: "Recent Activities", href: "/settings/activity", icon: <HistoryIcon />, permission: "logs.activity.view" },
];

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user, logout } = useAuth();

  const handleSwitchCompany = async (companyId: number) => {
    try {
      const res = await apiClient.post("/v1/auth/switch-token", { company_id: companyId });
      if (res.data.success && res.data.data.redirect_url) {
        // Create a hidden form and submit via POST
        const form = document.createElement("form");
        form.method = "POST";
        form.action = res.data.data.redirect_url; // points to http://target.opspilot.test:3000/sso/switch

        const input = document.createElement("input");
        input.type = "hidden";
        input.name = "token";
        input.value = res.data.data.token; // Pass token in POST body

        form.appendChild(input);
        document.body.appendChild(form);
        form.submit();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to initiate switcher.");
    }
  };


  const hasPermission = (permission: string) => {
    return user?.permissions?.some((p) => p.name === permission) ||
      user?.roles?.some((r) => r.name === "Super Admin");
  };
  const filteredNavItems = navItems.filter((item) => {
    if (!item.permission) return true;
    return hasPermission(item.permission);
  });

  const drawerContent = (
    <List>
      {filteredNavItems.map((item) => (
        <ListItemButton key={item.label} component={NextLink} href={item.href}>
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText primary={item.label} />
        </ListItemButton>
      ))}
    </List>
  );


  return (
    <RouteGuard>
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        {/* Header */}
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            {/* Left Box (Logo & Mobile Menu Trigger) */}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton
                color="inherit"
                edge="start"
                onClick={() => setMobileOpen(!mobileOpen)}
                sx={{ mr: 2, display: { sm: "none" } }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" noWrap>
                OpsPilot
              </Typography>
            </Box>

            {/* Right Box (Company Switcher, Notifications, Avatar) */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {user?.companies && user.companies.length > 1 && (
                <Select
                  size="small"
                  value={user.companies.find(c => typeof window !== 'undefined' && window.location.hostname.startsWith(c.subdomain))?.id || ""}
                  onChange={(e) => handleSwitchCompany(Number(e.target.value))}
                  sx={{
                    minWidth: 150,
                    bgcolor: "rgba(255, 255, 255, 0.15)",
                    color: "white",
                    borderRadius: 1,
                    "& .MuiSelect-select": { py: 1, color: "white" },
                    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                    "& .MuiSvgIcon-root": { color: "white" }
                  }}
                >
                  {user.companies.map((company) => (
                    <MenuItem key={company.id} value={company.id}>
                      {company.name}
                    </MenuItem>
                  ))}
                </Select>
              )}
              <NotificationBell />

              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>

                <Avatar sx={{ width: 32, height: 32 }}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </Avatar>
              </IconButton>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                <MenuItem
                  component={NextLink}
                  href="/profile"
                  onClick={() => setAnchorEl(null)}
                >
                  Profile
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setAnchorEl(null);
                    logout.mutate();
                  }}
                >
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Sidebar - mobile */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": { width: drawerWidth },
          }}
        >
          <Toolbar />
          {drawerContent}
        </Drawer>

        {/* Sidebar - desktop */}
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
          }}
        >
          <Toolbar />
          {drawerContent}
        </Drawer>
        {/* Main content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Toolbar />
          <Breadcrumbs sx={{ mb: 2 }}>
            <MuiLink underline="hover" color="inherit" href="#">
              Home
            </MuiLink>
            <Typography color="text.primary">Dashboard</Typography>
          </Breadcrumbs>

          <Box sx={{ flexGrow: 1 }}>{children}</Box>

          <Box component="footer" sx={{ pt: 3, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} OpsPilot
            </Typography>
          </Box>
        </Box>
      </Box>
      <FloatingAssistant />
    </RouteGuard>
  );
}
