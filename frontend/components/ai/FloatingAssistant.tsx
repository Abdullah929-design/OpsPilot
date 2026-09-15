"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    Box,
    Fab,
    Paper,
    Typography,
    IconButton,
    TextField,
    Button,
    CircularProgress,
    Divider,
    Stack,
    Alert,
    Autocomplete,
    Chip
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CloseIcon from "@mui/icons-material/Close";
import DescriptionIcon from "@mui/icons-material/Description";
import ChatIcon from "@mui/icons-material/Chat";
import { useAuth } from "@/hooks/useAuth";
import { useAIAssistant } from "@/hooks/useAIAssistant";
import { aiService } from "@/services/aiService";
import { usePathname } from "next/navigation";
import NextLink from "next/link";

export default function FloatingAssistant() {
    const { user } = useAuth();
    const {
        askQuestion,
        isAsking,
        answerData,
        remainingQuota,
        dailyLimit,
        errorMsg,
        resetError,
    } = useAIAssistant();

    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [aiMode, setAiMode] = useState(false); // Toggle to show AI answers vs search results
    const [currentQuestion, setCurrentQuestion] = useState("");
    // Page detection and attachment states
    const pathname = usePathname();
    const docPageMatch = pathname?.match(/\/tenant\/documents\/(\d+)/);
    const currentDocId = docPageMatch ? parseInt(docPageMatch[1], 10) : undefined;
    const [detectedDoc, setDetectedDoc] = useState<any | null>(null);
    const [attachedDoc, setAttachedDoc] = useState<any | null>(null);
    const [showDocSelector, setShowDocSelector] = useState(false);
    const [attachedDocSearch, setAttachedDocSearch] = useState("");
    const [attachedDocResults, setAttachedDocResults] = useState<any[]>([]);
    const [isSearchingDoc, setIsSearchingDoc] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Permission Guard: Only render if user has 'ai.access' or is Super Admin
    const hasAiAccess = user?.permissions?.some((p) => p.name === "ai.access") ||
        user?.roles?.some((r) => r.name === "Super Admin");

    // 1. Fetch document title if page detection identifies a document ID
    useEffect(() => {
        if (currentDocId) {
            import("@/services/documentService").then(({ documentService }) => {
                documentService.getDocument(currentDocId)
                    .then((doc) => setDetectedDoc(doc))
                    .catch(() => setDetectedDoc(null));
            });
        } else {
            setDetectedDoc(null);
        }
    }, [currentDocId]);

    // 2. Query documents for manual selection
    useEffect(() => {
        const trimmed = attachedDocSearch.trim();
        if (!trimmed) {
            setAttachedDocResults([]);
            return;
        }
        setIsSearchingDoc(true);
        const delay = setTimeout(() => {
            aiService.searchDocuments(trimmed)
                .then((res) => {
                    setAttachedDocResults(res?.data?.items || []);
                })
                .catch(() => {
                    setAttachedDocResults([]);
                })
                .finally(() => {
                    setIsSearchingDoc(false);
                });
        }, 300);
        return () => clearTimeout(delay);
    }, [attachedDocSearch]);

    // Scroll to bottom when AI answer updates
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [answerData, isAsking]);

    if (!hasAiAccess) return null;

    const handleAskAI = () => {
        if (!query.trim()) return;
        setAiMode(true);
        setCurrentQuestion(query);
        askQuestion(query.trim(), attachedDoc?.id ?? currentDocId);
    };

    const handleClose = () => {
        setOpen(false);
        setAiMode(false);
        setQuery("");
        resetError();
    };

    return (
        <Box sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 1000 }}>
            {/* Floating Action Button */}
            {!open && (
                <Fab
                    color="primary"
                    aria-label="ai-assistant"
                    onClick={() => setOpen(true)}
                    sx={{ boxShadow: 4 }}
                >
                    <AutoAwesomeIcon />
                </Fab>
            )}

            {/* Assistant Panel */}
            {open && (
                <Paper
                    elevation={6}
                    sx={{
                        width: 380,
                        height: 520,
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: 3,
                        overflow: "hidden",
                    }}
                >
                    {/* Header */}
                    <Box sx={{ p: 2, bgcolor: "primary.main", color: "primary.contrastText", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Stack direction="row" sx={{ spacing: 1, alignItems: "center" }}>
                            <AutoAwesomeIcon sx={{ fontSize: 18 }} />
                            <Typography sx={{ variant: "subtitle1", fontWeight: 700 }}>
                                OpsPilot Assistant
                            </Typography>
                        </Stack>
                        <IconButton size="small" color="inherit" onClick={handleClose}>
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    {/* Context Bar */}
                    <Box sx={{ px: 2, py: 1, bgcolor: "grey.50", borderBottom: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center", minWidth: 0, flexGrow: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary", textTransform: "uppercase", fontSize: 10, letterSpacing: 0.5 }}>
                                Context:
                            </Typography>
                            {attachedDoc ? (
                                <Chip
                                    icon={< DescriptionIcon sx={{ fontSize: "14px !important" }} />}
                                    label={attachedDoc.title}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                    onDelete={() => setAttachedDoc(null)}
                                    sx={{ maxWidth: 180, height: 22, fontSize: 11 }}
                                />
                            ) : detectedDoc ? (
                                <Chip
                                    icon={<DescriptionIcon sx={{ fontSize: "14px !important" }} />}
                                    label={`Page: ${detectedDoc.title}`}
                                    size="small"
                                    color="secondary"
                                    variant="outlined"
                                    sx={{ maxWidth: 180, height: 22, fontSize: 11 }}
                                />
                            ) : (
                                <Chip
                                    label="Global Search"
                                    size="small"
                                    variant="outlined"
                                    sx={{ height: 22, fontSize: 11 }}
                                />
                            )}
                        </Stack>

                        <Button
                            size="small"
                            variant="text"
                            onClick={() => setShowDocSelector(!showDocSelector)}
                            sx={{ fontSize: 11, textTransform: "none", minWidth: 0, p: 0.5 }}
                        >
                            {showDocSelector ? "Close" : "Attach File"}
                        </Button>
                    </Box>

                    {/* Collapsible Document Selector */}
                    {showDocSelector && (
                        <Box sx={{ p: 1.5, bgcolor: "grey.100", borderBottom: "1px solid", borderColor: "divider" }}>
                            <Autocomplete
                                size="small"
                                options={attachedDocResults}
                                getOptionLabel={(option: any) => option.title || ""}
                                loading={isSearchingDoc}
                                inputValue={attachedDocSearch}
                                onInputChange={(_, val) => setAttachedDocSearch(val)}
                                onChange={(_, val) => {
                                    if (val) {
                                        setAttachedDoc(val);
                                        setShowDocSelector(false);
                                        setAttachedDocSearch("");
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        placeholder="Search document to attach..."
                                        variant="outlined"
                                        size="small"
                                    />
                                )}
                            />
                        </Box>
                    )}


                    {/* Chat & Search Results area */}
                    <Box ref={scrollRef} sx={{ flexGrow: 1, p: 2, overflowY: "auto", display: "flex", flexDirection: "column", gap: 1.5 }}>
                        {errorMsg && (
                            <Alert severity="error" onClose={resetError} sx={{ py: 0 }}>
                                {errorMsg}
                            </Alert>
                        )}

                        {!aiMode ? (
                            // WELCOME SCREEN
                            <Stack spacing={1.5} sx={{ alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center", py: 4, px: 2 }}>
                                <AutoAwesomeIcon sx={{ fontSize: 40, color: "primary.main", opacity: 0.8 }} />
                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                    OpsPilot AI Assistant
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Ask questions about your documents. Your conversation will use the referenced file context specified above.
                                </Typography>
                            </Stack>
                        ) : (
                            // AI CHAT VIEW
                            <Stack spacing={2} sx={{ flexGrow: 1 }}>
                                {/* User Question */}
                                <Box sx={{ alignSelf: "flex-end", bgcolor: "primary.light", color: "primary.contrastText", p: 1.5, borderRadius: "12px 12px 0 12px", maxWidth: "80%" }}>
                                    <Typography variant="body2">{currentQuestion}</Typography>
                                </Box>

                                {/* AI Response */}
                                <Box sx={{ alignSelf: "flex-start", bgcolor: "grey.100", p: 2, borderRadius: "12px 12px 12px 0", maxWidth: "85%", border: "1px solid", borderColor: "grey.200" }}>
                                    {isAsking ? (
                                        <Stack direction="row" sx={{ spacing: 1.5, alignItems: "center" }}>
                                            <CircularProgress size={16} />
                                            <Typography variant="body2" color="text.secondary">
                                                Thinking...
                                            </Typography>
                                        </Stack>
                                    ) : (
                                        <Stack spacing={1}>
                                            <Typography variant="body2" sx={{ whiteSpace: "pre-line", lineHeight: 1.5 }}>
                                                {isAsking ? null : answerData?.answer}
                                            </Typography>
                                            {answerData?.cached && (
                                                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>
                                                    ⚡ Cached response
                                                </Typography>
                                            )}
                                        </Stack>
                                    )}
                                </Box>

                                {/* New Question / Reset button */}
                                {!isAsking && (
                                    <Button
                                        size="small"
                                        variant="text"
                                        startIcon={<ChatIcon />}
                                        onClick={() => {
                                            setAiMode(false);
                                            setQuery("");
                                            resetError();
                                        }}
                                        sx={{ alignSelf: "flex-start", textTransform: "none" }}
                                    >
                                        Ask a new question
                                    </Button>
                                )}
                            </Stack>
                        )}
                    </Box>

                    <Divider />

                    {/* Footer Input Controls */}
                    <Box sx={{ p: 2, bgcolor: "background.paper" }}>
                        <Stack spacing={1.5}>
                            <TextField
                                size="small"
                                fullWidth
                                placeholder="Type keywords or ask a question..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleAskAI();
                                    }
                                }}
                            />

                            <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                                {/* Quota Label */}
                                <Typography variant="caption" color="text.secondary">
                                    {remainingQuota !== null && dailyLimit !== null ? (
                                        `Quota: ${remainingQuota}/${dailyLimit} left today`
                                    ) : (
                                        "Quota-aware session"
                                    )}
                                </Typography>

                                <Button
                                    size="small"
                                    variant="contained"
                                    onClick={handleAskAI}
                                    disabled={!query.trim() || isAsking}
                                    startIcon={<AutoAwesomeIcon />}
                                    sx={{ textTransform: "none", fontWeight: 600 }}
                                >
                                    Get Written Answer
                                </Button>
                            </Stack>
                        </Stack>
                    </Box>
                </Paper>
            )
            }
        </Box >
    );
}
