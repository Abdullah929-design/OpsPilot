<?php

namespace App\Actions\Documents;

use App\Models\Document;
use App\Models\DocumentCategory;
use App\Services\AIService;
use Illuminate\Support\Facades\Log;

class SuggestDocumentMetadataAction
{
    public function __construct(private AIService $aiService)
    {
    }

    /**
     * Suggest metadata for a document (Title, Description, Category, Tags).
     *
     * @param Document $document
     * @return array
     */
    public function execute(Document $document): array
    {
        $limit = config('ai_limits.document_agent_char_limit', 4000);
        $text = $document->content_text ?: '';
        
        // Truncate input text to limit
        $truncatedText = mb_substr($text, 0, $limit);

        // Fetch available categories for this company to help the LLM categorize accurately
        $categories = DocumentCategory::where('company_id', $document->company_id)
            ->select('id', 'name')
            ->get();

        $categoryListString = $categories->map(fn($c) => "ID: {$c->id} - Name: {$c->name}")->implode("\n");

        $prompt = "You are a document analyzer. Analyze the following excerpt from a document and suggest metadata. You must return ONLY a valid JSON object matching the schema below. Do not include any markdown backticks, conversational explanations, or prefix/suffix. Just return raw JSON.\n\n"
            . "Output JSON Schema:\n"
            . "{\n"
            . "  \"title\": \"A short, clean title based on document contents (max 100 chars)\",\n"
            . "  \"description\": \"A 1-2 sentence summary of what the document contains (max 200 chars)\",\n"
            . "  \"category_id\": <integer matching one of the category IDs below, or null if none fit>,\n"
            . "  \"tags\": [\"tag1\", \"tag2\"] (suggest 1 to 3 relevant tags based on content)\n"
            . "}\n\n"
            . "Available Categories:\n"
            . ($categoryListString ?: "None available")
            . "\n\n"
            . "Document Excerpt:\n"
            . $truncatedText
            . "\n\nJSON output:";

        try {
            $response = $this->aiService->ask($prompt);

            // Clean response in case the model wraps it in ```json ``` markdown code blocks
            $cleanedResponse = preg_replace('/^```(?:json)?\s*/i', '', $response);
            $cleanedResponse = preg_replace('/\s*```$/', '', $cleanedResponse);
            $cleanedResponse = trim($cleanedResponse);

            $data = json_decode($cleanedResponse, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                Log::error('SuggestDocumentMetadataAction: Failed to parse JSON from AI response: ' . $response);
                throw new \Exception('Failed to decode AI response.');
            }

            return [
                'title' => $data['title'] ?? null,
                'description' => $data['description'] ?? null,
                'category_id' => isset($data['category_id']) ? (int) $data['category_id'] : null,
                'tags' => $data['tags'] ?? [],
            ];
        } catch (\Exception $e) {
            Log::error('Metadata suggestion failed: ' . $e->getMessage());
            // Fallback to existing values if AI fails
            return [
                'title' => $document->title,
                'description' => $document->description,
                'category_id' => $document->category_id,
                'tags' => [],
            ];
        }
    }
}
