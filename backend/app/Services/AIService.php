<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AIService
{
    /**
     * Send a prompt to Groq API.
     *
     * @param string $prompt
     * @return string
     * @throws \Exception
     */
    public function ask(string $prompt): string
    {
        $apiKey = config('services.groq.api_key');
        $model = config('services.groq.model', 'llama-3.1-8b-instant');
        $maxInputTokens = config('services.groq.max_input_tokens', 1500);
        $maxOutputTokens = config('services.groq.max_output_tokens', 300);

        if (empty($apiKey)) {
            Log::warning('Groq API Key is not set. Returning a mock/fallback message.');
            return "AI feature is not fully configured (API key missing).";
        }

        // Rule: Truncate input to max_input_tokens.
        // In English text, 1 token is roughly 4 characters. We use a safe ceiling:
        $maxChars = $maxInputTokens * 4;
        $truncatedPrompt = mb_substr($prompt, 0, $maxChars);

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(30)->post('https://api.groq.com/openai/v1/chat/completions', [
                'model' => $model,
                'messages' => [
                    [
                        'role' => 'user',
                        'content' => $truncatedPrompt,
                    ],
                ],
                'max_tokens' => $maxOutputTokens,
                'temperature' => 0.2, // Low temperature for factual, grounded answers
            ]);

            if ($response->failed()) {
                Log::error('Groq API error response: ' . $response->body());
                throw new \Exception('Failed to fetch response from Groq API.');
            }

            $content = $response->json('choices.0.message.content');
            
            if (is_null($content)) {
                throw new \Exception('Invalid response structure from Groq API.');
            }

            return trim($content);
        } catch (\Exception $e) {
            Log::error('AIService Exception: ' . $e->getMessage());
            throw $e;
        }
    }
}
