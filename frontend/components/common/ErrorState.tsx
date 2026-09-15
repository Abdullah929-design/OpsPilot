import { Box, Typography, Button } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlineOutlined";

export default function ErrorState({
  message = "Something went wrong",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <Box sx={{ textAlign: "center", py: 6 }}>
      <ErrorOutlineIcon color="error" sx={{ fontSize: 56, mb: 1 }} />
      <Typography variant="h6" sx={{ mb: 2 }}>
        {message}
      </Typography>
      {onRetry && (
        <Button variant="outlined" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </Box>
  );
}