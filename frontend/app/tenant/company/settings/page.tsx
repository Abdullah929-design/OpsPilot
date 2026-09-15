"use client";

import React from "react";
import AuthenticatedLayout from "@/layouts/AuthenticatedLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { companySettingService, CompanySettingsMap } from "@/services/companySettingService";
import { useFormik } from "formik";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import {
    Typography,
    Box,
    Paper,
    Grid,
    TextField,
    Button,
    CircularProgress,
    Stack,
    FormControl,
    FormLabel,
    FormGroup,
    FormControlLabel,
    Checkbox,
    Divider,
} from "@mui/material";

const ALL_WEEKDAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];

export default function CompanySettingsPage() {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const isEditable = user?.permissions?.some((p) => p.name === "company.update") ||
        user?.roles?.some((r) => r.name === "Super Admin");

    // Fetch settings
    const { data: settings, isLoading } = useQuery<CompanySettingsMap>({
        queryKey: ["company-settings"],
        queryFn: companySettingService.getSettings,
    });

    const updateMutation = useMutation({
        mutationFn: companySettingService.updateSettings,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["company-settings"] });
            alert("Company settings updated successfully.");
        },
    });

    const formik = useFormik({
        initialValues: {
            working_days: settings?.working_days || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            office_hours_start: settings?.office_hours_start || "09:00",
            office_hours_end: settings?.office_hours_end || "17:00",
            weekend: settings?.weekend || ["Saturday", "Sunday"],
            leave_year_start: settings?.leave_year_start || "01-01",
            default_language: settings?.default_language || "en",
            default_currency: settings?.default_currency || "USD",
            email_signature: settings?.email_signature || "",
        },
        enableReinitialize: true,
        onSubmit: (values) => {
            updateMutation.mutate(values);
        },
    });

    const handleWeekdayChange = (day: string, type: "working_days" | "weekend") => {
        const list = [...formik.values[type]];
        const otherType = type === "working_days" ? "weekend" : "working_days";
        const otherList = [...formik.values[otherType]];

        const index = list.indexOf(day);
        if (index > -1) {
            // Unchecking from current: remove from here, and add to the other list
            list.splice(index, 1);
            if (!otherList.includes(day)) {
                otherList.push(day);
                formik.setFieldValue(otherType, otherList);
            }
        } else {
            // Checking in current: add here, and remove from the other list
            list.push(day);
            const otherIndex = otherList.indexOf(day);
            if (otherIndex > -1) {
                otherList.splice(otherIndex, 1);
                formik.setFieldValue(otherType, otherList);
            }
        }
        formik.setFieldValue(type, list);
    };



    if (isLoading) {
        return (
            <AuthenticatedLayout>
                <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
                    <CircularProgress />
                </Box>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout>
            <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                        Company Settings
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Configure operations, work days, calendars, and communications.
                    </Typography>
                </Box>
                <Button
                    component={Link}
                    href="/company"
                    variant="outlined"
                >
                    Back to Profile
                </Button>
            </Box>

            <Paper sx={{ p: 4, borderRadius: 2 }}>
                <form onSubmit={formik.handleSubmit}>
                    {/* Section 1: Office Hours */}
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                        Office Hours & Leave Cycle
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField
                                fullWidth
                                id="office_hours_start"
                                name="office_hours_start"
                                label="Office Hours Start"
                                type="time"
                                value={formik.values.office_hours_start}
                                onChange={formik.handleChange}
                                disabled={!isEditable}
                                slotProps={{ inputLabel: { shrink: true } }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField
                                fullWidth
                                id="office_hours_end"
                                name="office_hours_end"
                                label="Office Hours End"
                                type="time"
                                value={formik.values.office_hours_end}
                                onChange={formik.handleChange}
                                disabled={!isEditable}
                                slotProps={{ inputLabel: { shrink: true } }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField
                                fullWidth
                                id="leave_year_start"
                                name="leave_year_start"
                                label="Leave Cycle Year Start (MM-DD)"
                                value={formik.values.leave_year_start}
                                onChange={formik.handleChange}
                                disabled={!isEditable}
                                placeholder="e.g. 01-01"
                            />
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 4 }} />

                    {/* Section 2: Work Days Schedule */}
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                        Work Days & Weekend Schedule
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <FormControl component="fieldset">
                                <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>
                                    Working Days
                                </FormLabel>
                                <FormGroup row>
                                    {ALL_WEEKDAYS.map((day) => (
                                        <FormControlLabel
                                            key={day}
                                            control={
                                                <Checkbox
                                                    checked={formik.values.working_days.includes(day)}
                                                    onChange={() => handleWeekdayChange(day, "working_days")}
                                                    disabled={!isEditable}
                                                />
                                            }
                                            label={day}
                                        />
                                    ))}
                                </FormGroup>
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <FormControl component="fieldset">
                                <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>
                                    Weekend Days
                                </FormLabel>
                                <FormGroup row>
                                    {ALL_WEEKDAYS.map((day) => (
                                        <FormControlLabel
                                            key={day}
                                            control={
                                                <Checkbox
                                                    checked={formik.values.weekend.includes(day)}
                                                    onChange={() => handleWeekdayChange(day, "weekend")}
                                                    disabled={!isEditable}
                                                />
                                            }
                                            label={day}
                                        />
                                    ))}
                                </FormGroup>
                            </FormControl>
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 4 }} />

                    {/* Section 3: Localization Defaults */}
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                        Regional Defaults
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                id="default_currency"
                                name="default_currency"
                                label="Default System Currency"
                                value={formik.values.default_currency}
                                onChange={formik.handleChange}
                                disabled={!isEditable}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                id="default_language"
                                name="default_language"
                                label="Default Language"
                                value={formik.values.default_language}
                                onChange={formik.handleChange}
                                disabled={!isEditable}
                            />
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 4 }} />

                    {/* Section 4: Communication Settings */}
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                        Communications
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                id="email_signature"
                                name="email_signature"
                                label="Global Email Signature"
                                multiline
                                rows={3}
                                value={formik.values.email_signature}
                                onChange={formik.handleChange}
                                disabled={!isEditable}
                            />
                        </Grid>
                    </Grid>

                    {isEditable && (
                        <Stack sx={{ justifyContent: "flex-end", mt: 4 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={updateMutation.isPending}
                            >
                                Save Settings
                            </Button>
                        </Stack>
                    )}
                </form>
            </Paper>
        </AuthenticatedLayout>
    );
}
