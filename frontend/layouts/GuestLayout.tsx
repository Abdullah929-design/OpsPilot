"use client";

import { ReactNode } from "react";
import { Box, Card, CardContent, Container } from "@mui/material";

interface GuestLayoutProps {
  children: ReactNode;
}

export default function GuestLayout({ children }: GuestLayoutProps) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "grey.50",
      }}
    >
      <Container maxWidth="xs">
        <Card sx={{ display: "flex", flexDirection: "column", p: 2, boxShadow: 3 }}>
          <CardContent>{children}</CardContent>
        </Card>
      </Container>
    </Box>
  );
}
