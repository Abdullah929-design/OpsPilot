<?php

namespace App\Actions;

use App\Models\Document;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class ExtractDocumentTextAction
{
    /**
     * Extract plain text from a document using LibreOffice and save it.
     *
     * @param Document $document
     * @return void
     */
    public function execute(Document $document): void
    {
        $extension = strtolower($document->extension);

         // 1. If it's a PDF, use the native PHP PDF parser (fast, runs in memory)
        if ($extension === 'pdf') {
            try {
                $parser = new \Smalot\PdfParser\Parser();
                $pdf = $parser->parseFile(Storage::disk('local')->path($document->file_path));
                $document->content_text = $pdf->getText();
                $document->save();
                return;
            } catch (\Exception $e) {
                Log::error("Smalot PDF parser failed for document {$document->id}: " . $e->getMessage());
            }
        }
        
        $supportedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];
        if (!in_array($extension, $supportedExtensions)) {
            Log::warning("Text extraction not supported for extension: {$extension}");
            return;
        }

        if (!Storage::disk('local')->exists($document->file_path)) {
            Log::error("Source file not found for extraction: {$document->file_path}");
            return;
        }

        $sourceFullPath = str_replace('/', DIRECTORY_SEPARATOR, Storage::disk('local')->path($document->file_path));

        if ($extension === 'txt') {
            $text = Storage::disk('local')->get($document->file_path);
             $document->content_text = $text;
           $document->save();
            return;
        }

        $officeExtensions = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
        if (in_array($extension, $officeExtensions)) {
            // Create an isolated temp directory for text conversion
            $companyId = $document->company_id;
            $tempDirRelative = "companies/{$companyId}/previews/tmp_txt_{$document->id}";
            $outputFullDirectory = str_replace('/', DIRECTORY_SEPARATOR, Storage::disk('local')->path($tempDirRelative));

            if (!file_exists($outputFullDirectory)) {
                mkdir($outputFullDirectory, 0755, true);
            }

            $libreofficePath = str_replace('/', DIRECTORY_SEPARATOR, env('LIBREOFFICE_PATH', 'soffice'));

            // Command to convert document to .pdf headlessly (Calc and Impress natively support exporting to PDF)
            $command = sprintf(
                '"%s" --headless --convert-to pdf --outdir "%s" "%s" 2>&1',
                $libreofficePath,
                $outputFullDirectory,
                $sourceFullPath
            );

            exec($command, $output, $returnVar);

            if ($returnVar !== 0) {
                Log::error("LibreOffice Office-to-PDF conversion failed. Command: {$command}. Output: " . implode("\n", $output));
                if (file_exists($outputFullDirectory)) {
                    @rmdir($outputFullDirectory);
                }
                return;            }

            // Find the generated .pdf file in the temp directory
            $files = glob("{$outputFullDirectory}/*.pdf");
            if (!empty($files)) {
                $generatedPdfPath = $files[0];
                try {
                   $parser = new \Smalot\PdfParser\Parser();
                    $pdf = $parser->parseFile($generatedPdfPath);
                    $text = $pdf->getText();

                    $cleanText = mb_convert_encoding($text, 'UTF-8', 'UTF-8');
                    $document->content_text = $cleanText;
                    $document->save();
                } catch (\Exception $e) {
                    Log::error("Smalot PDF parser failed for converted office document {$document->id}: " . $e->getMessage());
                }

                @unlink($generatedPdfPath);
                @rmdir($outputFullDirectory);
                return;
            }

            if (file_exists($outputFullDirectory)) {
                @rmdir($outputFullDirectory);
            }
        }

       
    }
}
