"use client";

import { use } from "react";
import AuthenticatedLayout from "@/layouts/AuthenticatedLayout";
import UserForm from "@/components/users/UserForm";
import { useUser, useUpdateUser } from "@/hooks/useUsers";
import { Typography, Paper, Box, CircularProgress, Stack } from "@mui/material";
import { useRouter } from "next/navigation";
import UserPermissionsPanel from "@/components/users/UserPermissionsPanel";
import { useAuth } from "@/hooks/useAuth"; // <-- Add this import


export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const userId = Number(id);

  const { data: user, isLoading } = useUser(userId);
  const { user: currentUser } = useAuth();
  const isSelfEdit = currentUser?.id === userId;
  const updateUser = useUpdateUser();
  const router = useRouter();

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
      <Box sx={{ maxWidth: 800, mx: "auto", pb: 5 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          Edit User #{userId}
        </Typography>
        <Stack spacing={3}>
          <Paper sx={{ p: 4, borderRadius: 2 }}>
            <UserForm
              isEdit
              isSelfEdit={isSelfEdit}
              initialValues={{
                name: user?.name,
                email: user?.email,
                is_active: user?.is_active,
                roles: user?.roles?.map((r: any) => r.name),
              }}
              onSubmit={async (values) => {
                await updateUser.mutateAsync({ id: userId, data: values });
                router.push("/users");
              }}
              isSubmitting={updateUser.isPending}
            />
          </Paper>

          {/* User Overrides Permissions Panel */}
          <UserPermissionsPanel userId={userId} />
        </Stack>
      </Box>
    </AuthenticatedLayout>
  );
}