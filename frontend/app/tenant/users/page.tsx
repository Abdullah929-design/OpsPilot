"use client";

import { useState } from "react";
import AuthenticatedLayout from "@/layouts/AuthenticatedLayout";
import UsersTable, { UserItem } from "@/components/users/UsersTable";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { useUsers, useDeleteUser, useToggleUserStatus } from "@/hooks/useUsers";
import { Typography, Button, Stack, Box, CircularProgress } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import NextLink from "next/link";
import ErrorState from "@/components/common/ErrorState";



export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");

  const [deleteUserTarget, setDeleteUserTarget] = useState<UserItem | null>(null);
  const [toggleStatusTarget, setToggleStatusTarget] = useState<UserItem | null>(null);

  const { data, isLoading, error } = useUsers({ page, search, role, per_page: 15 });
  const deleteMutation = useDeleteUser();
  const toggleStatusMutation = useToggleUserStatus();

  return (
    <AuthenticatedLayout>
      <Stack spacing={3}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Users
          </Typography>
          <Button component={NextLink} href="/users/create" variant="contained" startIcon={<AddIcon />}>
            Add User
          </Button>
        </Box>

        {error ? (
          <ErrorState message={(error as any)?.response?.data?.message || "not authorized to perform the task"} />
        ) : isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <UsersTable
            users={data?.items || []}
            total={data?.pagination?.total || 0}
            page={page}
            perPage={15}
            onPageChange={setPage}
            onSearchChange={setSearch}
            onRoleFilterChange={setRole}
            onDeleteClick={setDeleteUserTarget}
            onToggleStatusClick={setToggleStatusTarget}
          />
        )}

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={Boolean(deleteUserTarget)}
          title="Delete User"
          message={`Are you sure you want to delete ${deleteUserTarget?.name}?`}
          onConfirm={async () => {
            if (deleteUserTarget) {
              try {
                await deleteMutation.mutateAsync(deleteUserTarget.id);
              } catch (err: any) {
                alert(err.response?.data?.message || "Failed to delete user.");
              } finally {
                setDeleteUserTarget(null);
              }
            }
          }}
          onCancel={() => setDeleteUserTarget(null)}
        />

        {/* Toggle Status Confirmation */}
        <ConfirmDialog
          open={Boolean(toggleStatusTarget)}
          title={toggleStatusTarget?.is_active ? "Deactivate User" : "Activate User"}
          message={`Are you sure you want to ${toggleStatusTarget?.is_active ? "deactivate" : "activate"} ${toggleStatusTarget?.name}?`}
          onConfirm={async () => {
            if (toggleStatusTarget) {
              await toggleStatusMutation.mutateAsync({
                id: toggleStatusTarget.id,
                activate: !toggleStatusTarget.is_active,
              });
              setToggleStatusTarget(null);
            }
          }}
          onCancel={() => setToggleStatusTarget(null)}
        />
      </Stack>
    </AuthenticatedLayout>
  );
}
