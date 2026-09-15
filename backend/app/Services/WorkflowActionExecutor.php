<?php

namespace App\Services;

use App\Models\WorkflowAction;
use Illuminate\Support\Facades\Log;

class WorkflowActionExecutor
{
    public function execute(WorkflowAction $action, $model): void
    {
        match ($action->action_type) {
            'notify' => $this->notify($action, $model),
            'update_record' => $this->updateRecord($action, $model),
            'create_task' => $this->createTask($action, $model),
            'send_email' => $this->sendEmail($action, $model),
            default => throw new \InvalidArgumentException("Unknown action type: {$action->action_type}"),
        };
    }

    private function notify(WorkflowAction $action, $model): void
    {
        $config = $action->action_config;
        $target = $config['target'] ?? 'manager';
        $message = $config['message'] ?? 'Workflow notification triggered.';

        // For V1, we log the notification event. In Phase 4, we will hook it up to a Notification model or job.
        Log::info("WORKFLOW NOTIFICATION: [Target: {$target}] {$message}", [
            'model_id' => $model->id,
            'model_type' => get_class($model)
        ]);
    }

    private function updateRecord(WorkflowAction $action, $model): void
    {
        $config = $action->action_config;
        $field = $config['field'] ?? null;
        $value = $config['value'] ?? null;

        if ($field && $model) {
            $model->{$field} = $value;
            $model->save();
        }
    }

    private function createTask(WorkflowAction $action, $model): void
    {
        $config = $action->action_config;
        $title = $config['title'] ?? 'Automated Workflow Task';
        
        Log::info("WORKFLOW CREATE TASK: {$title}", [
            'config' => $config,
            'model_id' => $model->id
        ]);
    }

    private function sendEmail(WorkflowAction $action, $model): void
    {
        $config = $action->action_config;
        $to = $config['to'] ?? '';
        $subject = $config['subject'] ?? 'Workflow Notification';

        Log::info("WORKFLOW SEND EMAIL: to {$to} [Subject: {$subject}]", [
            'model_id' => $model->id
        ]);
    }
}
