"use client";

import { Snackbar, Alert, AlertColor } from "@mui/material";

interface ToastProps {
  open: boolean;
  message: string;
  severity?: AlertColor;
  onClose: () => void;
}

export default function Toast({ open, message, severity = "info", onClose }: ToastProps) {
  return (
    <Snackbar open={open} autoHideDuration={4000} onClose={onClose}>
      <Alert onClose={onClose} severity={severity} variant="filled" sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
}