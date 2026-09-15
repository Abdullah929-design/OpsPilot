<?php

namespace App\Listeners;

use App\Events\EmployeeCreated;
use App\Events\EmployeeUpdated;
use App\Events\DocumentUploaded;
use App\Models\Workflow;
use App\Services\WorkflowEngineService;

class RunWorkflowsForEvent
{
    public function handle($event): void
    {
        $triggerType = $this->resolveTriggerType($event);
        if (!$triggerType) {
            return;
        }

        $model = $event->employee ?? $event->document ?? null;
        if (!$model) {
            return;
        }

        // Fetch all active workflows for this trigger type and company
        $workflows = Workflow::where('trigger_type', $triggerType)
            ->where('company_id', $model->company_id)
            ->where('is_active', true)
            ->get();

        $engine = app(WorkflowEngineService::class);
        foreach ($workflows as $workflow) {
            $engine->run($workflow, $model);
        }
    }

    private function resolveTriggerType($event): ?string
    {
        return match (get_class($event)) {
            EmployeeCreated::class => 'employee.created',
            EmployeeUpdated::class => 'employee.updated',
            DocumentUploaded::class => 'document.expiring', // or 'document.uploaded'
            default => null,
        };
    }
}
