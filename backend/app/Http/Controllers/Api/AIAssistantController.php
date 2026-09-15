<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\AiAnswerCache;
use App\Services\AIService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AIAssistantController extends Controller
{
    public function __construct(private AIService $aiService)
    {
    }

    public function ask(Request $request): JsonResponse
    {
        $request->validate([
            'question' => 'required|string|max:500',
            'document_id' => 'nullable|integer',
        ]);

        $question = $request->input('question');
        $documentId = $request->input('document_id');
        $documents=collect();
        $user = $request->user();
        $companyId = $user->company_id;

        // Dynamic fallback: If user has no company ID (Super Admin) and we are looking
        // at a specific document, infer the company ID from that document context.
        if (!$companyId && $documentId) {
            $doc = Document::find($documentId);
            if ($doc) {
                $companyId = $doc->company_id;
            }
        }

        // 1. Normalize and hash the question
        $normalizedQuestion = trim(mb_strtolower($question));
        // Include document ID in hash so doc-specific Q&A has its own cache entry
        $questionHash = hash('sha256', $normalizedQuestion . '_' . ($documentId ?? 'global'));

        // 2. Check the Cache
         $cachedQuery = AiAnswerCache::where('question_hash', $questionHash);
        if ($companyId) {
            $cachedQuery->where('company_id', $companyId);
        } else {
            $cachedQuery->whereNull('company_id');
        }
        $cached = $cachedQuery->first();
        
        if ($cached) {
            return ResponseHelper::success('Response retrieved from cache (0 tokens used).', [
                'answer' => $cached->answer,
                'source_document_ids' => $cached->source_document_ids,
                'cached' => true,
            ]);
        }

        // 3. FTS Search over documents matching key terms
        $maxChunks = config('ai_limits.rag_max_chunks', 3);
        $chunkCharLimit = config('ai_limits.rag_chunk_char_limit', 800);

        // Strip characters that might break MySQL Boolean mode full-text query syntax
        $cleanQuery = preg_replace('/[+\-><()~*\"@]+/u', ' ', $question);
        $cleanQuery = trim(preg_replace('/\s+/', ' ', $cleanQuery));

        if (empty($cleanQuery)) {
            return ResponseHelper::success('No keywords could be extracted.', [
                'answer' => "I cannot find the answer to this question in the documents.",
                'source_document_ids' => [],
                'cached' => false,
            ]);
        }

        // If a specific document is active in front of the user, load it directly
        if ($documentId) {
            $docQuery = Document::where('id', $documentId)->whereNotNull('content_text');
            if ($companyId) {
                $docQuery->where('company_id', $companyId);
            }
            $document = $docQuery->first();

            if ($document) {
                $documents = collect([$document]);
            }
        }

        // 3. Fallback FTS Search over documents matching key terms (only if no active doc)
        if (empty($documents) || $documents->isEmpty()) {
            // 3a. Check if query matches any files that are ZIPs or Images (only for global search)
            $stopWords = ['what', 'with', 'this', 'that', 'there', 'their', 'document', 'file', 'image', 'about'];
            $queryWords = array_filter(explode(' ', $cleanQuery), fn($w) => strlen($w) > 3 && !in_array(strtolower($w), $stopWords));

            if (!empty($queryWords)) {
                $unsupportedQuery = Document::whereIn('extension', ['zip', 'png', 'jpg', 'jpeg', 'gif', 'bmp']);
                if ($companyId) {
                    $unsupportedQuery->where('company_id', $companyId);
                }
                $unsupportedDocs = $unsupportedQuery->where(function($sub) use ($queryWords) {
                    foreach ($queryWords as $word) {
                        $sub->orWhere('title', 'like', "%{$word}%")
                            ->orWhere('file_name', 'like', "%{$word}%");
                    }
                })->get();

                if ($unsupportedDocs->isNotEmpty()) {
                    $titles = $unsupportedDocs->pluck('title')->map(fn($t) => "'{$t}'")->implode(', ');
                    return ResponseHelper::success('Matched unsupported document types.', [
                        'answer' => "I found matching files ({$titles}), but Q&A is not supported for ZIP files or images.",
                        'source_document_ids' => $unsupportedDocs->pluck('id')->toArray(),
                        'cached' => false,
                    ]);
                }
            }

            $ftsQuery = Document::whereNotNull('content_text');
            if ($companyId) {
                $ftsQuery->where('company_id', $companyId);
            }
            $documents = $ftsQuery->whereRaw('MATCH(content_text) AGAINST(? IN NATURAL LANGUAGE MODE)', [$cleanQuery])
                ->limit($maxChunks)
                ->get();

            // Soft Fallback: If FTS Natural Language returns nothing, match by title
            if ($documents->isEmpty()) {
                $titleQuery = Document::whereNotNull('content_text');
                if ($companyId) {
                    $titleQuery->where('company_id', $companyId);
                }
                $documents = $titleQuery->where(function($sub) use ($cleanQuery) {
                    $sub->where('title', 'like', "%{$cleanQuery}%")
                        ->orWhere('file_name', 'like', "%{$cleanQuery}%");
                })
                ->limit(2)
                ->get();
            }
        }

        if ($documents->isEmpty()) {
            return ResponseHelper::success('No matching documents found.', [
                'answer' => "I cannot find the answer to this question in the documents.",
                'source_document_ids' => [],
                'cached' => false,
            ]);
        }

        // 4. Extract context snippets and build prompt
        $contextParts = [];
        $sourceDocIds = [];

        foreach ($documents as $doc) {
            $snippet = $this->extractRelevantSnippet($doc->content_text, $cleanQuery, $chunkCharLimit);
            $contextParts[] = "Document: \"{$doc->title}\" (ID: {$doc->id})\nContent: {$snippet}";
            $sourceDocIds[] = $doc->id;
        }

        $contextString = implode("\n\n---\n\n", $contextParts);

        $prompt = "You are a professional assistant. Use ONLY the following document snippets to answer the question. If the answer is not contained in the text, reply exactly with: \"I cannot find the answer to this question in the documents.\"\n\n"
            . "Context Snippets:\n"
            . $contextString
            . "\n\nQuestion: " . $question
            . "\nAnswer:";

        try {
            $answer = $this->aiService->ask($prompt);

            // 5. Write to Cache ONLY if the answer is not a failure message
            $failureString = "I cannot find the answer to this question in the documents.";
            if (trim($answer) !== $failureString) {
            AiAnswerCache::create([
                'company_id' => $companyId,
                'question_hash' => $questionHash,
                'question' => $question,
                'answer' => $answer,
                'source_document_ids' => $sourceDocIds,
            ]);
        }

            return ResponseHelper::success('Answer generated successfully.', [
                'answer' => $answer,
                'source_document_ids' => $sourceDocIds,
                'cached' => false,
            ]);
        } catch (\Exception $e) {
            Log::error('AI Q&A failed: ' . $e->getMessage());
            return ResponseHelper::error('Failed to generate answer. Please try again later.', [], 500);
        }
    }

    /**
     * Extract a snippet of text around the keywords of the query.
     */
    private function extractRelevantSnippet(string $text, string $query, int $limit): string
    {
        $words = array_values(array_filter(explode(' ', $query), fn($w) => strlen($w) > 3));
        $bestPos = false;
        $bestScore = -1;

        // Find the position where the most keywords cluster together
        foreach ($words as $word) {
            $pos = mb_stripos($text, $word);
            if ($pos === false) continue;

            // Count how many other keywords appear within a $limit window around this position
            $window = mb_strtolower(mb_substr($text, max(0, $pos - $limit / 2), $limit));
            $score = 0;
            foreach ($words as $w) {
                if (mb_stripos($window, $w) !== false) $score++;
             }
            if ($score > $bestScore) {
                $bestScore = $score;
                $bestPos = $pos;
            }
        }

        if ($bestPos === false) {
            return mb_substr($text, 0, $limit);
        }

        $start = max(0, $bestPos - (int)($limit / 2));
       return mb_substr($text, $start, $limit);
    }
}
