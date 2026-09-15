"use client";

import { useState, useEffect } from "react";
import PlatformRouteGuard from "@/components/layout/PlatformRouteGuard";
import { usePlatformSettings, PlatformSettings } from "@/hooks/usePlatformSettings";
import {
    Container, Paper, Typography, TextField, Button, Stack, Box,
    CircularProgress, Alert, Tabs, Tab, FormControlLabel, Switch
} from "@mui/material";
import PlatformLayout from "@/layouts/PlatformLayout";

function SettingsForm() {
    const { settings, isLoading, updateSettings } = usePlatformSettings();
    const [activeTab, setActiveTab] = useState(0);
    const [formData, setFormData] = useState<Partial<PlatformSettings>>({});
    const [policy, setPolicy] = useState({
        min_length: 8,
        require_special: true,
        require_numbers: true
    });

    useEffect(() => {
        if (formData.password_policy) {
            try {
                setPolicy(JSON.parse(formData.password_policy));
            } catch (e) {
                // Fallback if parsing fails
            }
        }
    }, [formData.password_policy]);

    useEffect(() => {
        if (settings) {
            setFormData(settings);
        }
    }, [settings]);

    const handlePolicyChange = (key: string, value: any) => {
        const updatedPolicy = { ...policy, [key]: value };
        setPolicy(updatedPolicy);
        setFormData((prev) => ({
            ...prev,
            password_policy: JSON.stringify(updatedPolicy)
        }));
    };


    const handleChange = (key: keyof PlatformSettings, value: string) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handleToggle = (key: keyof PlatformSettings, checked: boolean) => {
        setFormData((prev) => ({ ...prev, [key]: checked ? "1" : "0" }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateSettings.mutateAsync(formData);
    };

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 6 }}>
            <Paper sx={{ p: 4, borderRadius: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
                    Platform Settings
                </Typography>

                <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 4 }}>
                    <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)}>
                        <Tab label="General Settings" />
                    </Tabs>
                </Box>

                <form onSubmit={handleSubmit}>
                    <Stack spacing={3}>
                        {updateSettings.isSuccess && (
                            <Alert severity="success">Settings updated successfully!</Alert>
                        )}

                        {activeTab === 0 && (
                            <Stack spacing={3}>
                                <TextField
                                    label="App Name"
                                    fullWidth
                                    value={formData.app_name || ""}
                                    onChange={(e) => handleChange("app_name", e.target.value)}
                                />
                                <TextField
                                    label="Logo URL"
                                    fullWidth
                                    value={formData.logo || ""}
                                    onChange={(e) => handleChange("logo", e.target.value)}
                                />
                                <TextField
                                    label="Default Timezone"
                                    fullWidth
                                    value={formData.default_timezone || ""}
                                    onChange={(e) => handleChange("default_timezone", e.target.value)}
                                />
                                <TextField
                                    label="Default Language"
                                    fullWidth
                                    value={formData.default_language || ""}
                                    onChange={(e) => handleChange("default_language", e.target.value)}
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.maintenance_mode === "1"}
                                            onChange={(e) => handleToggle("maintenance_mode", e.target.checked)}
                                        />
                                    }
                                    label="Maintenance Mode"
                                />
                            </Stack>
                        )}
                        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={updateSettings.isPending}
                            >
                                {updateSettings.isPending ? "Saving..." : "Save Settings"}
                            </Button>
                        </Box>
                    </Stack>
                </form>
            </Paper>
        </Container>
    );
}

export default function PlatformSettingsPage() {
    return (
        <PlatformLayout>
            <SettingsForm />
        </PlatformLayout>
    );
}
