<?php

namespace App\Services;

use App\Models\Workflow;
use App\Models\WorkflowCondition;
use App\Models\WorkflowLog;

class WorkflowEngineService
{
    public function run(Workflow $workflow, $model): void
    {
        // 1. Evaluate all conditions
        foreach ($workflow->conditions as $condition) {
            if (!$this->conditionMet($condition, $model)) {
                WorkflowLog::create([
                    'company_id' => $workflow->company_id,
                    'workflow_id' => $workflow->id,
                    'status' => 'condition_not_met',
                    'context' => $model->toArray(),
                ]);
                return;
            }
        }

        // 2. Execute all actions in order
        $executor = app(WorkflowActionExecutor::class);
        try {
            foreach ($workflow->actions as $action) {
                $executor->execute($action, $model);
            }

            WorkflowLog::create([
                'company_id' => $workflow->company_id,
                'workflow_id' => $workflow->id,
                'status' => 'success',
                'context' => $model->toArray(),
            ]);
        } catch (\Throwable $e) {
            WorkflowLog::create([
                'company_id' => $workflow->company_id,
                'workflow_id' => $workflow->id,
                'status' => 'failed',
                'context' => $model->toArray(),
                'error_message' => $e->getMessage(),
            ]);
        }
    }

    private function conditionMet(WorkflowCondition $condition, $model): bool
    {
        // data_get allows dot-notation nesting: e.g., 'department.name'
        $actual = data_get($model, $condition->field);

        return match ($condition->operator) {
            '=' => $actual == $condition->value,
            '!=' => $actual != $condition->value,
            '<' => (float)$actual < (float)$condition->value,
            '>' => (float)$actual > (float)$condition->value,
            'contains' => str_contains(strtolower((string)$actual), strtolower($condition->value)),
            default => false,
        };
    }
}
