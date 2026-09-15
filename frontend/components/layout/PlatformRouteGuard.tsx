"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePlatformAuth } from "@/hooks/usePlatformAuth";
import { Box, CircularProgress } from "@mui/material";

export default function PlatformRouteGuard({ children }: { children: ReactNode }) {
    const { user, isLoading, isAuthenticated } = usePlatformAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}
