'use client';

import React from 'react';
import AuthenticatedLayout from "@/layouts/AuthenticatedLayout";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  LinearProgress,
  Avatar,
  Stack
} from "@mui/material";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { logService, ActivityLogItem } from "@/services/logService";
import { dashboardService, DashboardStats } from "@/services/dashboardService";

// Icons
import AddCardIcon from '@mui/icons-material/AddCard';
import SecurityIcon from '@mui/icons-material/Security';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import DescriptionIcon from '@mui/icons-material/Description';
import FileIcon from "@/components/documents/FileIcon";

function formatBytes(bytes: number) {
  if (!bytes || bytes === 0) return "0 MB";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function stringAvatar(name: string) {
  const parts = name.trim().split(" ");
  const initials = parts.length > 1
    ? `${parts[0]?.[0] || ""}${parts[1]?.[0] || ""}`
    : `${parts[0]?.[0] || ""}${parts[0]?.[1] || ""}`;
  return initials.toUpperCase();
}

// Uniform stat card — fixed height, reserved 2-line label space,
// and a non-wrapping value that shrinks to fit instead of breaking.
function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: React.ReactNode;
  color: string;
}) {
  return (
    <Card
      sx={{
        height: 120,
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          fontWeight: 500,
          fontSize: '0.8rem',
          lineHeight: 1.3,
          minHeight: '2.6em',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontWeight: 700,
          mt: 1,
          color,
          fontSize: 'clamp(1.1rem, 1.6vw, 1.75rem)',
          whiteSpace: 'nowrap',
        }}
      >
        {value}
      </Typography>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  // Fetch recent activity logs
  const { data: recentActivities = [], isLoading } = useQuery<ActivityLogItem[]>({
    queryKey: ['recent-activities'],
    queryFn: async () => {
      const data = await logService.getActivityLogs();
      return data.items.slice(0, 5);
    },
    refetchInterval: 30000,
  });

  // Fetch dashboard stats
  const { data: stats, isLoading: loadingStats } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardService.getStats,
  });

  const hasPermission = (permission: string) => {
    return user?.permissions?.some(p => p.name === permission) || user?.roles?.some(r => r.name === 'Super Admin');
  };

  // Calculate max document count for category bars scale
  const maxDocCount = React.useMemo(() => {
    const counts = stats?.document_stats?.documents_by_category?.map((c: any) => c.documents_count) || [];
    return counts.length > 0 ? Math.max(...counts, 1) : 1;
  }, [stats]);

  return (
    <AuthenticatedLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back to OpsPilot. Here is your overview for today.
        </Typography>
      </Box>

      {/* Stats Cards Section */}
      {loadingStats ? (
        <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
          <CircularProgress size={30} />
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, 1fr)",
              sm: "repeat(3, 1fr)",
              md: "repeat(4, 1fr)",
              lg: "repeat(7, 1fr)",
            },
            gap: 2,
            mb: 4,
          }}
        >
          <StatCard
            label="Active Users"
            value={stats?.active_users ?? 0}
            color="primary.main"
          />
          <StatCard
            label="Total Employees"
            value={stats?.total_employees ?? 0}
            color="info.main"
          />
          <StatCard
            label="Active Employees"
            value={stats?.active_employees ?? 0}
            color="success.main"
          />
          <StatCard
            label="New Joinees (Month)"
            value={stats?.new_joinees_this_month ?? 0}
            color="warning.main"
          />
          <StatCard
            label="Departments"
            value={stats?.departments ?? 0}
            color="primary.main"
          />
          <StatCard
            label="Total Documents"
            value={stats?.document_stats?.total_documents ?? 0}
            color="secondary.main"
          />
          <StatCard
            label="Storage Used"
            value={formatBytes(stats?.document_stats?.storage_used_bytes || 0)}
            color="info.main"
          />
        </Box>
      )}

      <Grid container spacing={3}>
        {/* 1. Welcome Widget */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', p: 2 }}>
            <CardContent>
              <Typography variant="h5" color="primary" sx={{ fontWeight: 600, mb: 1 }}>
                Welcome back, {user?.name || 'User'}!
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                You are logged in as <strong>{user?.email}</strong>.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {user?.roles?.map((role) => (
                  <Chip key={role.id} label={role.name} color="primary" variant="outlined" size="small" />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 2. Recent Hires Widget */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%', p: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Recent Hires
              </Typography>
              {stats?.recent_hires && stats.recent_hires.length > 0 ? (
                <List dense sx={{ p: 0 }}>
                  {stats.recent_hires.map((hire: any) => (
                    <ListItem key={hire.id} sx={{ px: 0, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {hire.first_name} {hire.last_name}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {hire.designation?.title || 'No Designation'} • Joined {new Date(hire.joining_date).toLocaleDateString()}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  No recent hires recorded.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* 3. Documents by Category Widget */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%', p: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Documents by Category
              </Typography>
              {stats?.document_stats?.documents_by_category && stats.document_stats.documents_by_category.length > 0 ? (
                <Stack spacing={2} sx={{ mt: 1 }}>
                  {stats.document_stats.documents_by_category.map((cat: any) => (
                    <Box key={cat.id}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {cat.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {cat.documents_count} {cat.documents_count === 1 ? 'document' : 'documents'}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(cat.documents_count / maxDocCount) * 100}
                        sx={{ height: 8, borderRadius: 4, backgroundColor: 'action.hover' }}
                        color="primary"
                      />
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  No documents categorized.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* 4. Recent Document Uploads Widget */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%', p: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Recent Document Uploads
              </Typography>
              {stats?.document_stats?.recent_uploads && stats.document_stats.recent_uploads.length > 0 ? (
                <List dense sx={{ p: 0 }}>
                  {stats.document_stats.recent_uploads.map((doc: any) => (
                    <ListItem key={doc.id} sx={{ px: 0, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", width: "100%" }}>
                        <FileIcon extension={doc.extension} mimeType={doc.mime_type} />
                        <ListItemText
                          primary={
                            <Typography
                              component={Link}
                              href={`/tenant/documents/${doc.id}`}
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                textDecoration: "none",
                                color: "text.primary",
                                "&:hover": { textDecoration: "underline", color: "primary.main" }
                              }}
                            >
                              {doc.title}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              {doc.file_name} • Uploaded {new Date(doc.created_at).toLocaleDateString()}
                            </Typography>
                          }
                        />
                      </Stack>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  No documents uploaded yet.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* 5. Top Contributors Widget */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%', p: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Top Document Contributors
              </Typography>
              {stats?.document_stats?.top_uploaders && stats.document_stats.top_uploaders.length > 0 ? (
                <List dense sx={{ p: 0 }}>
                  {stats.document_stats.top_uploaders.map((item: any, idx: number) => (
                    <ListItem key={item.uploader.id} sx={{ px: 0, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Stack direction="row" spacing={2} sx={{ alignItems: "center", width: "100%" }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary', minWidth: 20 }}>
                          #{idx + 1}
                        </Typography>
                        <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.light', fontSize: '0.9rem', fontWeight: 600 }}>
                          {stringAvatar(item.uploader.name)}
                        </Avatar>
                        <ListItemText
                          primary={
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {item.uploader.name}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              {item.uploader.email}
                            </Typography>
                          }
                        />
                        <Chip
                          label={`${item.count} uploads`}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ ml: 'auto' }}
                        />
                      </Stack>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  No upload contributors recorded.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* 6. Quick Actions Widget */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%', p: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                {hasPermission('users.create') && (
                  <Grid size={{ xs: 6 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      component={Link}
                      href="/users/create"
                      startIcon={<AddCardIcon />}
                      sx={{ py: 1.5 }}
                    >
                      Add User
                    </Button>
                  </Grid>
                )}
                {hasPermission('roles.manage') && (
                  <Grid size={{ xs: 6 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      component={Link}
                      href="/roles"
                      startIcon={<SecurityIcon />}
                      sx={{ py: 1.5 }}
                    >
                      Manage Roles
                    </Button>
                  </Grid>
                )}
                {hasPermission('company.view') && (
                  <Grid size={{ xs: 6 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      component={Link}
                      href="/company/settings"
                      startIcon={<SettingsIcon />}
                      sx={{ py: 1.5 }}
                    >
                      Company Settings
                    </Button>
                  </Grid>
                )}
                {hasPermission('departments.view') && (
                  <Grid size={{ xs: 6 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      component={Link}
                      href="/departments"
                      startIcon={<AccountTreeIcon />}
                      sx={{ py: 1.5 }}
                    >
                      Departments
                    </Button>
                  </Grid>
                )}
                {hasPermission('documents.view') && (
                  <Grid size={{ xs: 6 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      component={Link}
                      href="/documents"
                      startIcon={<DescriptionIcon />}
                      sx={{ py: 1.5 }}
                    >
                      Documents
                    </Button>
                  </Grid>
                )}
                <Grid size={{ xs: 6 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    component={Link}
                    href="/profile"
                    startIcon={<PersonIcon />}
                    sx={{ py: 1.5 }}
                  >
                    Edit Profile
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* 7. Recent Activity Widget */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%', p: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Recent Activity
              </Typography>
              {isLoading ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  Loading activities...
                </Typography>
              ) : recentActivities.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  No recent activities recorded.
                </Typography>
              ) : (
                <List dense sx={{ p: 0 }}>
                  {recentActivities.map((log) => (
                    <ListItem key={log.id} sx={{ px: 0, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {log.action}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            By {log.user?.name || 'System'} • {new Date(log.created_at).toLocaleString()}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </AuthenticatedLayout>
  );
}