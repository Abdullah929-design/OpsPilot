"use client";

import { use } from "react";
import AuthenticatedLayout from "@/layouts/AuthenticatedLayout";
import { useUser } from "@/hooks/useUsers";
import { Typography, Paper, Box, Stack, Chip, Button, CircularProgress } from "@mui/material";
import NextLink from "next/link";
import EditIcon from "@mui/icons-material/Edit";

export default function UserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const userId = Number(id);

  const { data: user, isLoading } = useUser(userId);

  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress />
        </Box>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <Box sx={{ maxWidth: 700, mx: "auto" }}>
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            User Details
          </Typography>
          <Button component={NextLink} href={`/users/${userId}/edit`} variant="contained" startIcon={<EditIcon />}>
            Edit User
          </Button>
        </Stack>

        <Paper sx={{ p: 4, borderRadius: 2 }}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Name</Typography>
              <Typography variant="h6">{user?.name}</Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary">Email</Typography>
              <Typography variant="body1">{user?.email}</Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary">Status</Typography>
              <Chip
                label={user?.is_active ? "Active" : "Inactive"}
                color={user?.is_active ? "success" : "default"}
                size="small"
                sx={{ mt: 0.5 }}
              />
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary">Roles</Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                {user?.roles?.map((r: any) => (
                  <Chip key={r.id} label={r.name} variant="outlined" />
                ))}
              </Stack>
            </Box>
          </Stack>
        </Paper>
      </Box>
    </AuthenticatedLayout>
  );
}
