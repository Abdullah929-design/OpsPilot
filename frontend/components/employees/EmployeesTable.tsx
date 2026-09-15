import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Stack,
    Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import EmployeeAvatar from "../common/EmployeeAvatar";
import StatusBadge from "../common/StatusBadge";
import { EmployeeData } from "@/services/employeeService";
import Link from "next/link";


interface EmployeesTableProps {
    employees: EmployeeData[];
    onEdit: (employee: EmployeeData) => void;
    onDelete: (employee: EmployeeData) => void;
}

export default function EmployeesTable({ employees, onEdit, onDelete }: EmployeesTableProps) {
    return (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Designation</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Employment</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600, textAlign: "right" }}>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {employees.map((emp) => (
                        <TableRow key={emp.id} hover>
                            <TableCell>
                                <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
                                    <EmployeeAvatar
                                        firstName={emp.first_name}
                                        lastName={emp.last_name}
                                        photoUrl={emp.profile_photo}
                                    />
                                    <Stack>
                                        <Typography
                                            variant="body2"
                                            component={Link}
                                            href={`/employees/${emp.id}`}
                                            sx={{
                                                fontWeight: 600,
                                                color: "primary.main",
                                                textDecoration: "none",
                                                "&:hover": { textDecoration: "underline" }
                                            }}
                                        >
                                            {emp.first_name} {emp.last_name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {emp.email}
                                        </Typography>
                                    </Stack>

                                </Stack>
                            </TableCell>
                            <TableCell>{emp.employee_code}</TableCell>
                            <TableCell>{emp.designation?.title || "N/A"}</TableCell>
                            <TableCell>{emp.department?.name || "N/A"}</TableCell>
                            <TableCell>
                                <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
                                    {emp.employment_type?.replace("_", " ")}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <StatusBadge status={emp.employment_status} />
                            </TableCell>
                            <TableCell sx={{ textAlign: "right" }}>
                                <IconButton color="primary" onClick={() => onEdit(emp)}>
                                    <EditIcon />
                                </IconButton>
                                <IconButton color="error" onClick={() => onDelete(emp)}>
                                    <DeleteIcon />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                    {!employees.length && (
                        <TableRow>
                            <TableCell colSpan={7} sx={{ textAlign: "center", py: 4 }}>
                                No employees found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
