<?php

namespace App\Jobs;

use App\Actions\ExtractDocumentTextAction;
use App\Models\Document;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ExtractDocumentTextJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(protected Document $document)
    {
    }

    public function handle(ExtractDocumentTextAction $action): void
    {
        $action->execute($this->document);
    }
}
