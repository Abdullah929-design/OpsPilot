"use client";

import { useQuery } from "@tanstack/react-query";
import { tagService, GetTagsParams } from "@/services/tagService";

export function useTags(params?: GetTagsParams) {
    return useQuery({
        queryKey: ["tags", params],
        queryFn: () => tagService.getTags(params),
    });
}
