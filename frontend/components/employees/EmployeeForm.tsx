"use client";

import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
    Grid,
    TextField,
    MenuItem,
    Button,
    Card,
    CardContent,
    Typography,
    Stack,
    Divider,
    Alert,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { userService } from "@/services/userService";
import { departmentService } from "@/services/departmentService";
import { designationService } from "@/services/designationService";
import { officeService } from "@/services/officeService";
import { teamService } from "@/services/teamService";
import { employeeService, EmployeeData } from "@/services/employeeService";

interface EmployeeFormProps {
    initialValues?: Partial<EmployeeData>;
    onSubmit: (values: Partial<EmployeeData>) => void;
    isPending?: boolean;
    errorMsg?: string | null;
}

export default function EmployeeForm({ initialValues, onSubmit, isPending, errorMsg }: EmployeeFormProps) {
    const [selectedDeptId, setSelectedDeptId] = useState<number | "">(initialValues?.department_id || "");

    // 1. Fetch Company Users (for link-to-user selector)
    const { data: usersData } = useQuery({
        queryKey: ["users", { per_page: 100 }],
        queryFn: () => userService.getUsers({ per_page: 100 }),
    });

    // 2. Fetch Departments
    const { data: deptsData } = useQuery({
        queryKey: ["departments"],
        queryFn: () => departmentService.getDepartments({ per_page: 100, status: "active" }),
    });

    // 3. Fetch Designations
    const { data: desgsData } = useQuery({
        queryKey: ["designations"],
        queryFn: () => designationService.getDesignations({ per_page: 100, status: "active" }),
    });

    // 4. Fetch Office Locations
    const { data: officesData } = useQuery({
        queryKey: ["offices"],
        queryFn: () => officeService.getOffices({ per_page: 100, status: "active" }),
    });

    // 5. Fetch Managers (exclude self to prevent simple cycle)
    const { data: managersData } = useQuery({
        queryKey: ["employees", { per_page: 100, is_manager: true }],
        queryFn: () => employeeService.getEmployees({ per_page: 100, status: "active", is_manager: true }),
    });


    // 6. Fetch Teams based on selected Department
    const { data: teamsData, refetch: refetchTeams } = useQuery({
        queryKey: ["teams", selectedDeptId],
        queryFn: () => teamService.getTeams(Number(selectedDeptId), { status: "active" }),
        enabled: !!selectedDeptId,
    });

    useEffect(() => {
        if (selectedDeptId) {
            refetchTeams();
        }
    }, [selectedDeptId, refetchTeams]);

    const formik = useFormik({
        initialValues: {
            user_id: initialValues?.user_id || "",
            first_name: initialValues?.first_name || "",
            last_name: initialValues?.last_name || "",
            email: initialValues?.email || "",
            phone: initialValues?.phone || "",
            gender: initialValues?.gender || "",
            date_of_birth: initialValues?.date_of_birth || "",
            joining_date: initialValues?.joining_date || "",
            employment_type: initialValues?.employment_type || "full_time",
            employment_status: initialValues?.employment_status || "active",
            employee_code: initialValues?.employee_code || "",
            department_id: initialValues?.department_id || "",
            team_id: initialValues?.team_id || "",
            designation_id: initialValues?.designation_id || "",
            office_location_id: initialValues?.office_location_id || "",
            manager_id: initialValues?.manager_id || "",
            address: initialValues?.address || "",
            city: initialValues?.city || "",
            country: initialValues?.country || "",
            emergency_contact_name: initialValues?.emergency_contact_name || "",
            emergency_contact_phone: initialValues?.emergency_contact_phone || "",
        },
        enableReinitialize: true,
        validationSchema: Yup.object({
            employee_code: Yup.string().required("Employee code is required"),
            department_id: Yup.number().required("Department is required"),
            designation_id: Yup.number().required("Designation is required"),
            joining_date: Yup.date().required("Joining date is required").nullable(),
            employment_type: Yup.string().required("Employment type is required"),
            employment_status: Yup.string().required("Employment status is required"),
            // Conditional validation: if user_id is empty, name/email are required
            first_name: Yup.string().when("user_id", {
                is: (val: any) => !val,
                then: () => Yup.string().required("First name is required"),
            }),
            last_name: Yup.string().when("user_id", {
                is: (val: any) => !val,
                then: () => Yup.string().required("Last name is required"),
            }),
            email: Yup.string().when("user_id", {
                is: (val: any) => !val,
                then: () => Yup.string().email("Invalid email format").required("Email is required"),
            }),
        }),
        onSubmit: (values) => {
            // Clean empty strings to null for nullable foreign keys
            const payload = {
                ...values,
                user_id: values.user_id === "" ? null : Number(values.user_id),
                team_id: values.team_id === "" ? null : Number(values.team_id),
                office_location_id: values.office_location_id === "" ? null : Number(values.office_location_id),
                manager_id: values.manager_id === "" ? null : Number(values.manager_id),
                date_of_birth: values.date_of_birth === "" ? null : values.date_of_birth,
            };
            onSubmit(payload as Partial<EmployeeData>);
        },
    });

    // Auto-source values if user_id is selected
    const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const userIdVal = e.target.value;
        formik.setFieldValue("user_id", userIdVal);

        if (userIdVal) {
            const selectedUser = usersData?.items?.find((u: any) => u.id === Number(userIdVal));
            if (selectedUser) {
                const parts = selectedUser.name.split(" ");
                formik.setFieldValue("first_name", parts[0] || "");
                formik.setFieldValue("last_name", parts.slice(1).join(" ") || "");
                formik.setFieldValue("email", selectedUser.email || "");
            }
        } else {
            formik.setFieldValue("first_name", "");
            formik.setFieldValue("last_name", "");
            formik.setFieldValue("email", "");
        }
    };

    const isLinked = !!formik.values.user_id;
    const availableManagers = managersData?.data?.items?.filter((m: any) => m.id !== initialValues?.id) || [];

    return (
        <form onSubmit={formik.handleSubmit}>
            <Stack spacing={4}>
                {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

                {/* Section 1: User Linkage */}
                <Card sx={{ borderRadius: 2 }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                            Platform User Linkage
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    select
                                    fullWidth
                                    id="user_id"
                                    name="user_id"
                                    label="Link to Existing Platform User Account"
                                    value={formik.values.user_id}
                                    onChange={handleUserChange}
                                    helperText="Select a user to lock and auto-sync identity details (name/email/avatar). Leave blank for standalone HR records."
                                >
                                    <MenuItem value="">Standalone HR Record (Not Linked)</MenuItem>
                                    {usersData?.items?.map((user: any) => (
                                        <MenuItem key={user.id} value={user.id}>
                                            {user.name} ({user.email})
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Section 2: Personal & Contact */}
                <Card sx={{ borderRadius: 2 }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                            Personal & Contact Details
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    fullWidth
                                    id="first_name"
                                    name="first_name"
                                    label="First Name"
                                    value={formik.values.first_name}
                                    onChange={formik.handleChange}
                                    disabled={isLinked}
                                    error={formik.touched.first_name && Boolean(formik.errors.first_name)}
                                    helperText={formik.touched.first_name && formik.errors.first_name}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    fullWidth
                                    id="last_name"
                                    name="last_name"
                                    label="Last Name"
                                    value={formik.values.last_name}
                                    onChange={formik.handleChange}
                                    disabled={isLinked}
                                    error={formik.touched.last_name && Boolean(formik.errors.last_name)}
                                    helperText={formik.touched.last_name && formik.errors.last_name}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    fullWidth
                                    id="email"
                                    name="email"
                                    label="Corporate Email Address"
                                    value={formik.values.email}
                                    onChange={formik.handleChange}
                                    disabled={isLinked}
                                    error={formik.touched.email && Boolean(formik.errors.email)}
                                    helperText={formik.touched.email && formik.errors.email}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    fullWidth
                                    id="phone"
                                    name="phone"
                                    label="Phone Number"
                                    value={formik.values.phone}
                                    onChange={formik.handleChange}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    select
                                    fullWidth
                                    id="gender"
                                    name="gender"
                                    label="Gender"
                                    value={formik.values.gender}
                                    onChange={formik.handleChange}
                                >
                                    <MenuItem value="">Unspecified</MenuItem>
                                    <MenuItem value="male">Male</MenuItem>
                                    <MenuItem value="female">Female</MenuItem>
                                    <MenuItem value="other">Other</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    fullWidth
                                    id="date_of_birth"
                                    name="date_of_birth"
                                    label="Date of Birth"
                                    type="date"
                                    slotProps={{ inputLabel: { shrink: true } }}
                                    value={formik.values.date_of_birth}
                                    onChange={formik.handleChange}
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={2}
                                    id="address"
                                    name="address"
                                    label="Residential Address"
                                    value={formik.values.address}
                                    onChange={formik.handleChange}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    id="city"
                                    name="city"
                                    label="City"
                                    value={formik.values.city}
                                    onChange={formik.handleChange}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    id="country"
                                    name="country"
                                    label="Country"
                                    value={formik.values.country}
                                    onChange={formik.handleChange}
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Section 3: Organization & Employment */}
                <Card sx={{ borderRadius: 2 }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                            Organization & Employment Details
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    fullWidth
                                    id="employee_code"
                                    name="employee_code"
                                    label="Employee ID Code"
                                    value={formik.values.employee_code}
                                    onChange={formik.handleChange}
                                    error={formik.touched.employee_code && Boolean(formik.errors.employee_code)}
                                    helperText={formik.touched.employee_code && formik.errors.employee_code}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    select
                                    fullWidth
                                    id="department_id"
                                    name="department_id"
                                    label="Department"
                                    value={formik.values.department_id}
                                    onChange={(e) => {
                                        formik.handleChange(e);
                                        setSelectedDeptId(e.target.value === "" ? "" : Number(e.target.value));
                                        formik.setFieldValue("team_id", "");
                                    }}
                                    error={formik.touched.department_id && Boolean(formik.errors.department_id)}
                                    helperText={formik.touched.department_id && formik.errors.department_id}
                                >
                                    <MenuItem value="">Select Department</MenuItem>
                                    {deptsData?.data?.map((dept: any) => (
                                        <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    select
                                    fullWidth
                                    id="team_id"
                                    name="team_id"
                                    label="Team"
                                    value={formik.values.team_id}
                                    onChange={formik.handleChange}
                                    disabled={!selectedDeptId}
                                    helperText={!selectedDeptId ? "Select department first" : ""}
                                >
                                    <MenuItem value="">Select Team</MenuItem>
                                    {teamsData?.map((team: any) => (
                                        <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    select
                                    fullWidth
                                    id="designation_id"
                                    name="designation_id"
                                    label="Designation"
                                    value={formik.values.designation_id}
                                    onChange={formik.handleChange}
                                    error={formik.touched.designation_id && Boolean(formik.errors.designation_id)}
                                    helperText={formik.touched.designation_id && formik.errors.designation_id}
                                >
                                    <MenuItem value="">Select Designation</MenuItem>
                                    {desgsData?.data?.map((desg: any) => (
                                        <MenuItem key={desg.id} value={desg.id}>{desg.title}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    select
                                    fullWidth
                                    id="office_location_id"
                                    name="office_location_id"
                                    label="Office Location"
                                    value={formik.values.office_location_id}
                                    onChange={formik.handleChange}
                                >
                                    <MenuItem value="">Select Location</MenuItem>
                                    {officesData?.data?.map((office: any) => (
                                        <MenuItem key={office.id} value={office.id}>{office.name}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    select
                                    fullWidth
                                    id="manager_id"
                                    name="manager_id"
                                    label="Reporting Line Manager"
                                    value={formik.values.manager_id}
                                    onChange={formik.handleChange}
                                >
                                    <MenuItem value="">No Manager (Top Level)</MenuItem>
                                    {availableManagers.map((mgr: any) => (
                                        <MenuItem key={mgr.id} value={mgr.id}>
                                            {mgr.first_name} {mgr.last_name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    fullWidth
                                    id="joining_date"
                                    name="joining_date"
                                    label="Employment Joining Date"
                                    type="date"
                                    slotProps={{ inputLabel: { shrink: true } }}
                                    value={formik.values.joining_date}
                                    onChange={formik.handleChange}
                                    error={formik.touched.joining_date && Boolean(formik.errors.joining_date)}
                                    helperText={formik.touched.joining_date && formik.errors.joining_date}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    select
                                    fullWidth
                                    id="employment_type"
                                    name="employment_type"
                                    label="Employment Type"
                                    value={formik.values.employment_type}
                                    onChange={formik.handleChange}
                                >
                                    <MenuItem value="full_time">Full Time</MenuItem>
                                    <MenuItem value="part_time">Part Time</MenuItem>
                                    <MenuItem value="contract">Contract</MenuItem>
                                    <MenuItem value="intern">Internship</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField
                                    select
                                    fullWidth
                                    id="employment_status"
                                    name="employment_status"
                                    label="Employment Status"
                                    value={formik.values.employment_status}
                                    onChange={formik.handleChange}
                                >
                                    <MenuItem value="active">Active</MenuItem>
                                    <MenuItem value="inactive">Inactive</MenuItem>
                                    <MenuItem value="terminated">Terminated</MenuItem>
                                </TextField>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Section 4: Emergency Contact */}
                <Card sx={{ borderRadius: 2 }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                            Emergency Contact Details
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    id="emergency_contact_name"
                                    name="emergency_contact_name"
                                    label="Contact Person Name"
                                    value={formik.values.emergency_contact_name}
                                    onChange={formik.handleChange}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    id="emergency_contact_phone"
                                    name="emergency_contact_phone"
                                    label="Contact Person Phone"
                                    value={formik.values.emergency_contact_phone}
                                    onChange={formik.handleChange}
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Submission Actions */}
                <Stack direction="row" spacing={2} sx={{ justifyContent: "flex-end" }}>
                    <Button variant="outlined" href="/employees">
                        Cancel
                    </Button>
                    <Button type="submit" variant="contained" disabled={isPending}>
                        {initialValues?.id ? "Update Employee" : "Save Employee"}
                    </Button>
                </Stack>
            </Stack>
        </form>
    );
}