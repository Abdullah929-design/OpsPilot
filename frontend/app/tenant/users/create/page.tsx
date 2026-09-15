"use client";

import AuthenticatedLayout from "@/layouts/AuthenticatedLayout";
import UserForm from "@/components/users/UserForm";
import { useCreateUser } from "@/hooks/useUsers";
import { Typography, Paper, Box } from "@mui/material";
import { useRouter } from "next/navigation";

export default function CreateUserPage() {
  const createUser = useCreateUser();
  const router = useRouter();

  return (
    <AuthenticatedLayout>
      <Box sx={{ maxWidth: 600, mx: "auto" }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          Create New User
        </Typography>
        <Paper sx={{ p: 4, borderRadius: 2 }}>
          <UserForm
            onSubmit={async (values) => {
              await createUser.mutateAsync(values);
              router.push("/users");
            }}
            isSubmitting={createUser.isPending}
          />
        </Paper>
      </Box>
    </AuthenticatedLayout>
  );
}
