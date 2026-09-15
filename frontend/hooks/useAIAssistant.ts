"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { aiService } from "@/services/aiService";
import axios from "axios";

export function useAIAssistant() {
    const [remainingQuota, setRemainingQuota] = useState<number | null>(null);
    const [dailyLimit, setDailyLimit] = useState<number | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const askMutation = useMutation({
        mutationFn: ({ question, documentId }: { question: string; documentId?: number }) =>
            aiService.askAI(question, documentId),
        onSuccess: (response) => {
            setErrorMsg(null);

            // Extract remaining quota headers from Axios response object
            const remaining = response.headers['x-ai-user-daily-remaining'];
            const limit = response.headers['x-ai-user-daily-limit'];

            if (remaining !== undefined) {
                setRemainingQuota(Number(remaining));
            }
            if (limit !== undefined) {
                setDailyLimit(Number(limit));
            }
        },
        onError: (err) => {
            if (axios.isAxiosError(err)) {
                // Surface rate limit (429) or other custom error messages
                const message = err.response?.data?.message || err.message;
                setErrorMsg(message);

                const remaining = err.response?.headers['x-ai-user-daily-remaining'];
                if (remaining !== undefined) {
                    setRemainingQuota(Number(remaining));
                }
            } else {
                setErrorMsg("An unexpected error occurred.");
            }
        }
    });

    const suggestMetadataMutation = useMutation({
        mutationFn: (documentId: number) => aiService.suggestMetadata(documentId),
        onSuccess: () => {
            setErrorMsg(null);
        },
        onError: (err) => {
            if (axios.isAxiosError(err)) {
                const message = err.response?.data?.message || err.message;
                setErrorMsg(message);
            } else {
                setErrorMsg("Failed to generate metadata suggestions.");
            }
        }
    });

    return {
        askQuestion: (question: string, documentId?: number) =>
            askMutation.mutate({ question, documentId }),
        isAsking: askMutation.isPending,
        answerData: askMutation.data?.data?.data, // Shape: { answer, source_document_ids, cached }

        suggestMetadata: suggestMetadataMutation.mutateAsync,
        isSuggestingMetadata: suggestMetadataMutation.isPending,

        remainingQuota,
        dailyLimit,
        errorMsg,
        resetError: () => setErrorMsg(null),
    };
}
