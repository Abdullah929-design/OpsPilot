import GuestLayout from "@/layouts/GuestLayout";
import LoginForm from "@/components/forms/LoginForm";
import { Typography, Stack } from "@mui/material";

export default function LoginPage() {
  return (
    <GuestLayout>
      <Stack spacing={3}>
        <Typography variant="h5" sx={{ fontWeight: 600, textAlign: "center" }}>
          Sign in to OpsPilot
        </Typography>
        <LoginForm />
      </Stack>
    </GuestLayout>
  );
}
