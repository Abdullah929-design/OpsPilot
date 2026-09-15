import { CircularProgress, Box } from "@mui/material";

export default function LoadingSpinner({ fullHeight = false }: { fullHeight?: boolean }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: fullHeight ? "60vh" : "auto",
        py: fullHeight ? 0 : 4,
      }}
    >
      <CircularProgress />
    </Box>
  );
}