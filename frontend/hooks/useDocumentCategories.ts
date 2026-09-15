"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryService, CategoryFormData } from "@/services/categoryService";

export function useDocumentCategories() {
    return useQuery({
        queryKey: ["documentCategories"],
        queryFn: () => categoryService.getCategories(),
    });
}

export function useCreateDocumentCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CategoryFormData) => categoryService.createCategory(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["documentCategories"] });
        },
    });
}

export function useUpdateDocumentCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: CategoryFormData }) =>
            categoryService.updateCategory(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["documentCategories"] });
            queryClient.invalidateQueries({ queryKey: ["documents"] });
        },
    });
}

export function useDeleteDocumentCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => categoryService.deleteCategory(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["documentCategories"] });
        },
    });
}
