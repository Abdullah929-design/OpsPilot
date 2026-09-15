import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { employeeService, GetEmployeesParams, EmployeeData } from "@/services/employeeService";

export function useEmployees(params?: GetEmployeesParams) {
    return useQuery({
        queryKey: ["employees", params],
        queryFn: () => employeeService.getEmployees(params),
    });
}

export function useCreateEmployee() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<EmployeeData>) => employeeService.createEmployee(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["employees"] });
        },
    });
}

export function useUpdateEmployee() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<EmployeeData> }) =>
            employeeService.updateEmployee(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["employees"] });
            queryClient.invalidateQueries({ queryKey: ["employee", data.id] });
        },
    });
}

export function useDeleteEmployee() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => employeeService.deleteEmployee(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["employees"] });
        },
    });
}
