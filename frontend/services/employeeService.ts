import apiClient from "./apiClient";

export interface EmployeeData {
    id: number;
    company_id: number;
    user_id: number | null;
    department_id: number;
    team_id: number | null;
    designation_id: number;
    office_location_id: number | null;
    manager_id: number | null;
    employee_code: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    gender: string | null;
    date_of_birth: string | null;
    joining_date: string;
    employment_type: string;
    employment_status: string;
    profile_photo: string | null;
    address: string | null;
    city: string | null;
    country: string | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
    created_at: string;
    updated_at: string;

    // Nested relations
    department?: { id: number; name: string } | null;
    team?: { id: number; name: string } | null;
    designation?: { id: number; title: string } | null;
    office_location?: { id: number; name: string } | null;
    manager?: { id: number; name: string } | null;
}

export interface GetEmployeesParams {
    search?: string;
    department_id?: number | string;
    designation_id?: number | string;
    status?: string;
    page?: number;
    per_page?: number;
    is_manager?: boolean;
}

export const employeeService = {
    getEmployees: (params?: GetEmployeesParams) =>
        apiClient.get("/v1/employees", { params }).then((res) => res.data),

    createEmployee: (data: Partial<EmployeeData>) =>
        apiClient.post("/v1/employees", data).then((res) => res.data.data),

    updateEmployee: (id: number, data: Partial<EmployeeData>) =>
        apiClient.put(`/v1/employees/${id}`, data).then((res) => res.data.data),

    deleteEmployee: (id: number) =>
        apiClient.delete(`/v1/employees/${id}`).then((res) => res.data),

    restoreEmployee: (id: number) =>
        apiClient.post(`/v1/employees/${id}/restore`).then((res) => res.data.data),

    updateStatus: (id: number, status: string) =>
        apiClient.patch(`/v1/employees/${id}/status`, { employment_status: status }).then((res) => res.data.data),

    uploadPhoto: (id: number, file: File) => {
        const formData = new FormData();
        formData.append("photo", file);
        return apiClient.post(`/v1/employees/${id}/photo`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }).then((res) => res.data.data);
    },

};
