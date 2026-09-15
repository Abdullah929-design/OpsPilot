<?php

return [
    'user_daily_limit' => env('AI_USER_DAILY_LIMIT', 20),      // per-user AI calls/day
    'user_minute_limit' => env('AI_USER_MINUTE_LIMIT', 3),     // per-user AI calls/minute
    'company_daily_limit' => env('AI_COMPANY_DAILY_LIMIT', 300), // safety net under Groq's org-wide cap
    'rag_max_chunks' => 3,
    'rag_chunk_char_limit' => 800,      // ~200 tokens
    'document_agent_char_limit' => 4000, // ~1,000 words sent for auto-fill, not the full file
    'cache_ttl_hours' => 168, // 7 days — cached Q&A answers
];
