"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/apiClient";
import { Box, CircularProgress, Typography } from "@mui/material";

export default function SSOSwitchPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const calledRef = useRef(false);

    useEffect(() => {
        if (calledRef.current) return;
        calledRef.current = true;

        // No token in the URL! The browser automatically sends the temp cookie.
        apiClient.get(`/v1/auth/switch-login`)
            .then((res) => {
                if (res.data.success) {
                    queryClient.setQueryData(["auth", "me"], res.data.data);
                    queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
                }
                router.replace("/dashboard");
            })
            .catch(() => {
                router.replace("/login");
            });
    }, [router, queryClient]);



    return (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 2 }}>
            <CircularProgress />
            <Typography variant="body1">Switching workspace context...</Typography>
        </Box>
    );
}
