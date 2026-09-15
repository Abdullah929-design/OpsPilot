import { Box, Typography } from "@mui/material";
import InboxIcon from "@mui/icons-material/Inbox";

export default function EmptyState({
  message = "No data found",
  description,
}: {
  message?: string;
  description?: string;
}) {
  return (
    <Box sx={{ textAlign: "center", py: 6, color: "text.secondary" }}>
      <InboxIcon sx={{ fontSize: 56, mb: 1, opacity: 0.5 }} />
      <Typography variant="h6">{message}</Typography>
      {description && (
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          {description}
        </Typography>
      )}
    </Box>
  );
}