<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Models\Workflow;
use App\Models\WorkflowCondition;
use App\Models\WorkflowAction;
use App\Models\WorkflowLog;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WorkflowController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Workflow::class);

        $workflows = Workflow::where('company_id', $request->user()->company_id)
            ->with(['conditions', 'actions'])
            ->latest()
            ->paginate($request->query('per_page', 15));

        return ResponseHelper::success('Workflows retrieved successfully.', $workflows);
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Workflow::class);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'trigger_type' => 'required|string|max:100',
            'is_active' => 'boolean',
            'conditions' => 'array',
            'conditions.*.field' => 'required|string',
            'conditions.*.operator' => 'required|string|in:=,!=,<,>,contains',
            'conditions.*.value' => 'required|string',
            'actions' => 'required|array|min:1',
            'actions.*.action_type' => 'required|string|in:notify,update_record,create_task,send_email',
            'actions.*.action_config' => 'required|array',
            'actions.*.order' => 'integer',
        ]);

        $companyId = $request->user()->company_id;

        $workflow = DB::transaction(function () use ($validated, $companyId, $request) {
            $workflow = Workflow::create([
                'company_id' => $companyId,
                'name' => $validated['name'],
                'trigger_type' => $validated['trigger_type'],
                'is_active' => $validated['is_active'] ?? true,
                'created_by' => $request->user()->id,
            ]);

            if (!empty($validated['conditions'])) {
                foreach ($validated['conditions'] as $cond) {
                    $workflow->conditions()->create($cond);
                }
            }

            foreach ($validated['actions'] as $act) {
                $workflow->actions()->create($act);
            }

            return $workflow;
        });

        return ResponseHelper::success('Workflow created successfully.', $workflow->load(['conditions', 'actions']), 201);
    }

    public function show(Workflow $workflow): JsonResponse
    {
        $this->authorize('view', $workflow);

        return ResponseHelper::success('Workflow details.', $workflow->load(['conditions', 'actions']));
    }

    public function update(Request $request, Workflow $workflow): JsonResponse
    {
        $this->authorize('update', $workflow);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'trigger_type' => 'required|string|max:100',
            'is_active' => 'boolean',
            'conditions' => 'array',
            'conditions.*.field' => 'required|string',
            'conditions.*.operator' => 'required|string|in:=,!=,<,>,contains',
            'conditions.*.value' => 'required|string',
            'actions' => 'required|array|min:1',
            'actions.*.action_type' => 'required|string|in:notify,update_record,create_task,send_email',
            'actions.*.action_config' => 'required|array',
            'actions.*.order' => 'integer',
        ]);

        DB::transaction(function () use ($workflow, $validated) {
            $workflow->update([
                'name' => $validated['name'],
                'trigger_type' => $validated['trigger_type'],
                'is_active' => $validated['is_active'] ?? true,
            ]);

            // Recreate conditions
            $workflow->conditions()->delete();
            if (!empty($validated['conditions'])) {
                foreach ($validated['conditions'] as $cond) {
                    $workflow->conditions()->create($cond);
                }
            }

            // Recreate actions
            $workflow->actions()->delete();
            foreach ($validated['actions'] as $act) {
                $workflow->actions()->create($act);
            }
        });

        return ResponseHelper::success('Workflow updated successfully.', $workflow->load(['conditions', 'actions']));
    }

    public function destroy(Workflow $workflow): JsonResponse
    {
        $this->authorize('delete', $workflow);

        $workflow->delete();

        return ResponseHelper::success('Workflow deleted successfully.');
    }

    public function activate(Workflow $workflow): JsonResponse
    {
        $this->authorize('activate', $workflow);

        $workflow->update(['is_active' => true]);

        return ResponseHelper::success('Workflow activated successfully.');
    }

    public function deactivate(Workflow $workflow): JsonResponse
    {
        $this->authorize('activate', $workflow);

        $workflow->update(['is_active' => false]);

        return ResponseHelper::success('Workflow deactivated successfully.');
    }

    public function logs(Request $request, Workflow $workflow): JsonResponse
    {
        $this->authorize('view', $workflow);

        $logs = WorkflowLog::where('workflow_id', $workflow->id)
            ->latest()
            ->paginate($request->query('per_page', 15));

        return ResponseHelper::success('Workflow execution logs retrieved.', $logs);
    }

    public function meta(): JsonResponse
    {
        $meta = [
            'triggers' => [
                [
                    'value' => 'employee.created',
                    'label' => 'Employee Created',
                    'fields' => ['first_name', 'last_name', 'email', 'department_id', 'designation_id', 'employment_status']
                ],
                [
                    'value' => 'employee.updated',
                    'label' => 'Employee Updated',
                    'fields' => ['first_name', 'last_name', 'department_id', 'designation_id', 'employment_status']
                ],
                [
                    'value' => 'document.expiring',
                    'label' => 'Document Uploaded',
                    'fields' => ['title', 'category_id', 'extension']
                ]
            ],
            'actions' => [
                [
                    'value' => 'notify',
                    'label' => 'Send Notification',
                    'config_fields' => ['target', 'message']
                ],
                [
                    'value' => 'update_record',
                    'label' => 'Update Record',
                    'config_fields' => ['field', 'value']
                ],
                [
                    'value' => 'create_task',
                    'label' => 'Create Task',
                    'config_fields' => ['title', 'description']
                ],
                [
                    'value' => 'send_email',
                    'label' => 'Send Email',
                    'config_fields' => ['to', 'subject', 'body']
                ]
            ]
        ];

        return ResponseHelper::success('Workflow metadata.', $meta);
    }
}
