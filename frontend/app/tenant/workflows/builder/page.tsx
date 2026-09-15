'use client';

import React, { useState, useEffect, Suspense } from 'react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    useWorkflowMeta,
    useCreateWorkflow,
    useUpdateWorkflow,
    useWorkflows
} from '@/hooks/useWorkflows';
import {
    Box,
    Paper,
    TextField,
    Button,
    Select,
    MenuItem,
    Typography,
    Stack,
    IconButton,
    Divider,
    Alert,
    FormControl,
    InputLabel
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SaveIcon from '@mui/icons-material/Save';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NextLink from 'next/link';

function WorkflowBuilderContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const workflowId = searchParams.get('id');

    const { data: metaData } = useWorkflowMeta();
    const { data: workflowsData } = useWorkflows();
    const createMutation = useCreateWorkflow();
    const updateMutation = useUpdateWorkflow();

    // Form states
    const [name, setName] = useState('');
    const [triggerType, setTriggerType] = useState('');
    const [conditions, setConditions] = useState<any[]>([]);
    const [actions, setActions] = useState<any[]>([
        { action_type: 'notify', action_config: { target: 'manager', message: 'Trigger event notification' }, order: 0 }
    ]);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Load existing workflow for editing if ID is provided
    useEffect(() => {
        if (workflowId && workflowsData) {
            const existing = workflowsData.data?.find((w: any) => w.id === parseInt(workflowId, 10));
            if (existing) {
                setName(existing.name);
                setTriggerType(existing.trigger_type);
                setConditions(existing.conditions || []);
                setActions(existing.actions || []);
            }
        }
    }, [workflowId, workflowsData]);

    const activeTrigger = metaData?.triggers?.find((t: any) => t.value === triggerType);

    const handleAddCondition = () => {
        if (!activeTrigger) return;
        setConditions([...conditions, { field: activeTrigger.fields[0] || 'id', operator: '=', value: '' }]);
    };

    const handleRemoveCondition = (index: number) => {
        setConditions(conditions.filter((_, idx) => idx !== index));
    };

    const handleConditionChange = (index: number, key: string, value: string) => {
        const updated = [...conditions];
        updated[index][key] = value;
        setConditions(updated);
    };

    const handleAddAction = () => {
        const nextOrder = actions.length;
        setActions([...actions, { action_type: 'notify', action_config: { target: 'manager', message: '' }, order: nextOrder }]);
    };

    const handleRemoveAction = (index: number) => {
        setActions(actions.filter((_, idx) => idx !== index).map((act, idx) => ({ ...act, order: idx })));
    };

    const handleActionTypeChange = (index: number, type: string) => {
        const updated = [...actions];
        updated[index].action_type = type;
        
        // Populate default configs based on type
        if (type === 'notify') {
            updated[index].action_config = { target: 'manager', message: '' };
        } else if (type === 'update_record') {
            updated[index].action_config = { field: '', value: '' };
        } else if (type === 'create_task') {
            updated[index].action_config = { title: '', description: '' };
        } else if (type === 'send_email') {
            updated[index].action_config = { to: '', subject: '', body: '' };
        }
        setActions(updated);
    };

    const handleActionConfigChange = (actionIndex: number, configKey: string, value: string) => {
        const updated = [...actions];
        updated[actionIndex].action_config[configKey] = value;
        setActions(updated);
    };

    const handleSave = () => {
        if (!name.trim()) {
            setErrorMsg('Workflow name is required.');
            return;
        }
        if (!triggerType) {
            setErrorMsg('A trigger event type must be selected.');
            return;
        }
        if (actions.length === 0) {
            setErrorMsg('At least one action is required.');
            return;
        }

        const payload = {
            name,
            trigger_type: triggerType,
            conditions,
            actions,
            is_active: true
        };

        const mutation = workflowId 
            ? updateMutation.mutateAsync({ id: parseInt(workflowId, 10), data: payload })
            : createMutation.mutateAsync(payload);

        mutation
            .then(() => {
                router.push('/tenant/workflows');
            })
            .catch((err) => {
                setErrorMsg(err.response?.data?.message || 'Failed to save workflow.');
            });
    };

    return (
        <AuthenticatedLayout>
            <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {/* Header Navigation */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Button
                        size="small"
                        component={NextLink}
                        href="/tenant/workflows"
                        startIcon={<ArrowBackIcon />}
                        sx={{ textTransform: 'none' }}
                    >
                        Back to Workflows
                    </Button>
                </Box>

                <Box sx={{ display: 'flex', gap: 4, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
                    {/* Left Panel: Builder Form */}
                    <Box sx={{ flexGrow: 1, flexBasis: '60%', display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                                {workflowId ? 'Edit Workflow Automation' : 'New Workflow Automation'}
                            </Typography>
                            {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}

                            <Stack spacing={3}>
                                <TextField
                                    label="Workflow Name"
                                    placeholder="e.g. Notify Manager on Department Change"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    fullWidth
                                />

                                <FormControl fullWidth>
                                    <InputLabel id="trigger-select-label">Trigger Event Source</InputLabel>
                                    <Select
                                        labelId="trigger-select-label"
                                        value={triggerType}
                                        label="Trigger Event Source"
                                        onChange={(e) => {
                                            setTriggerType(e.target.value);
                                            setConditions([]); // Reset conditions when trigger event changes
                                        }}
                                    >
                                        {metaData?.triggers?.map((t: any) => (
                                            <MenuItem key={t.value} value={t.value}>
                                                {t.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Stack>
                        </Paper>

                        {/* Step 2: Conditions */}
                        {triggerType && (
                            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                        Step 2: Filter Conditions (Optional)
                                    </Typography>
                                    <Button
                                        size="small"
                                        startIcon={<AddIcon />}
                                        onClick={handleAddCondition}
                                        sx={{ textTransform: 'none' }}
                                    >
                                        Add Filter
                                    </Button>
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    Only execute this workflow if the triggering event meets these specific filter rules.
                                </Typography>

                                {conditions.length === 0 ? (
                                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 1 }}>
                                        No conditions defined. This workflow will always execute when the event triggers.
                                    </Typography>
                                ) : (
                                    <Stack spacing={2}>
                                        {conditions.map((cond, idx) => (
                                            <Box key={idx} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                                <FormControl sx={{ minWidth: 150 }}>
                                                    <Select
                                                        value={cond.field}
                                                        onChange={(e) => handleConditionChange(idx, 'field', e.target.value)}
                                                        size="small"
                                                    >
                                                        {activeTrigger?.fields?.map((f: string) => (
                                                            <MenuItem key={f} value={f}>
                                                                {f}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>

                                                <FormControl sx={{ minWidth: 110 }}>
                                                    <Select
                                                        value={cond.operator}
                                                        onChange={(e) => handleConditionChange(idx, 'operator', e.target.value)}
                                                        size="small"
                                                    >
                                                        <MenuItem value="=">=</MenuItem>
                                                        <MenuItem value="!=">!=</MenuItem>
                                                        <MenuItem value="<">&lt;</MenuItem>
                                                        <MenuItem value=">">&gt;</MenuItem>
                                                        <MenuItem value="contains">contains</MenuItem>
                                                    </Select>
                                                </FormControl>

                                                <TextField
                                                    placeholder="Value"
                                                    value={cond.value}
                                                    onChange={(e) => handleConditionChange(idx, 'value', e.target.value)}
                                                    size="small"
                                                    sx={{ flexGrow: 1 }}
                                                />

                                                <IconButton color="error" onClick={() => handleRemoveCondition(idx)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Box>
                                        ))}
                                    </Stack>
                                )}
                            </Paper>
                        )}

                        {/* Step 3: Actions */}
                        {triggerType && (
                            <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                        Step 3: Triggered Actions
                                    </Typography>
                                    <Button
                                        size="small"
                                        startIcon={<AddIcon />}
                                        onClick={handleAddAction}
                                        sx={{ textTransform: 'none' }}
                                    >
                                        Add Action
                                    </Button>
                                </Box>

                                <Stack spacing={3}>
                                    {actions.map((act, idx) => (
                                        <Box key={idx} sx={{ p: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', position: 'relative' }}>
                                            <IconButton 
                                                color="error" 
                                                size="small"
                                                onClick={() => handleRemoveAction(idx)}
                                                sx={{ position: 'absolute', top: 8, right: 8 }}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>

                                            <Stack spacing={2}>
                                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                                                        Action #{idx + 1}:
                                                    </Typography>
                                                    <FormControl size="small" sx={{ minWidth: 180 }}>
                                                        <Select
                                                            value={act.action_type}
                                                            onChange={(e) => handleActionTypeChange(idx, e.target.value)}
                                                        >
                                                            {metaData?.actions?.map((a: any) => (
                                                                <MenuItem key={a.value} value={a.value}>
                                                                    {a.label}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                </Box>

                                                <Divider sx={{ my: 0.5 }} />

                                                {/* Dynamic Action Config Form */}
                                                {act.action_type === 'notify' && (
                                                    <Stack spacing={2}>
                                                        <TextField
                                                            label="Recipient / Target Role"
                                                            placeholder="e.g. manager, hr_head"
                                                            value={act.action_config.target || ''}
                                                            onChange={(e) => handleActionConfigChange(idx, 'target', e.target.value)}
                                                            size="small"
                                                            fullWidth
                                                        />
                                                        <TextField
                                                            label="Notification Message"
                                                            placeholder="Enter message details"
                                                            value={act.action_config.message || ''}
                                                            onChange={(e) => handleActionConfigChange(idx, 'message', e.target.value)}
                                                            size="small"
                                                            fullWidth
                                                            multiline
                                                            rows={2}
                                                        />
                                                    </Stack>
                                                )}

                                                {act.action_type === 'update_record' && (
                                                    <Stack direction="row" spacing={2}>
                                                        <TextField
                                                            label="Field Name"
                                                            placeholder="e.g. status"
                                                            value={act.action_config.field || ''}
                                                            onChange={(e) => handleActionConfigChange(idx, 'field', e.target.value)}
                                                            size="small"
                                                            sx={{ flexGrow: 1 }}
                                                        />
                                                        <TextField
                                                            label="New Value"
                                                            placeholder="e.g. active"
                                                            value={act.action_config.value || ''}
                                                            onChange={(e) => handleActionConfigChange(idx, 'value', e.target.value)}
                                                            size="small"
                                                            sx={{ flexGrow: 1 }}
                                                        />
                                                    </Stack>
                                                )}

                                                {act.action_type === 'create_task' && (
                                                    <Stack spacing={2}>
                                                        <TextField
                                                            label="Task Title"
                                                            placeholder="e.g. Review documents"
                                                            value={act.action_config.title || ''}
                                                            onChange={(e) => handleActionConfigChange(idx, 'title', e.target.value)}
                                                            size="small"
                                                            fullWidth
                                                        />
                                                        <TextField
                                                            label="Task Description"
                                                            placeholder="Enter descriptions"
                                                            value={act.action_config.description || ''}
                                                            onChange={(e) => handleActionConfigChange(idx, 'description', e.target.value)}
                                                            size="small"
                                                            fullWidth
                                                            multiline
                                                            rows={2}
                                                        />
                                                    </Stack>
                                                )}

                                                {act.action_type === 'send_email' && (
                                                    <Stack spacing={2}>
                                                        <TextField
                                                            label="Recipient Email"
                                                            placeholder="e.g. test@example.com"
                                                            value={act.action_config.to || ''}
                                                            onChange={(e) => handleActionConfigChange(idx, 'to', e.target.value)}
                                                            size="small"
                                                            fullWidth
                                                        />
                                                        <TextField
                                                            label="Email Subject"
                                                            placeholder="Enter email subject"
                                                            value={act.action_config.subject || ''}
                                                            onChange={(e) => handleActionConfigChange(idx, 'subject', e.target.value)}
                                                            size="small"
                                                            fullWidth
                                                        />
                                                    </Stack>
                                                )}
                                            </Stack>
                                        </Box>
                                    ))}
                                </Stack>
                            </Paper>
                        )}

                        {triggerType && (
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                                <Button
                                    variant="contained"
                                    onClick={handleSave}
                                    startIcon={<SaveIcon />}
                                    sx={{ fontWeight: 600, px: 4 }}
                                    disabled={createMutation.isPending || updateMutation.isPending}
                                >
                                    Save Workflow
                                </Button>
                            </Box>
                        )}
                    </Box>

                    {/* Right Panel: Live Visual Flow Preview */}
                    <Box sx={{ flexGrow: 1, flexBasis: '40%', position: 'sticky', top: 88, alignSelf: 'flex-start' }}>
                        <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none', bgcolor: 'grey.50' }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 3, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                Live Visual Logic Flow
                            </Typography>

                            <Stack spacing={2.5} sx={{ alignItems: 'center' }}>
                                {/* Trigger Box */}
                                <Box sx={{ width: '100%', p: 2, bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: 2, textAlign: 'center', boxShadow: 1 }}>
                                    <Typography variant="caption" sx={{ textTransform: 'uppercase', opacity: 0.8, fontWeight: 700 }}>
                                        Triggering Event
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                        {activeTrigger?.label || 'Select Trigger Source...'}
                                    </Typography>
                                </Box>

                                <ArrowForwardIcon sx={{ transform: 'rotate(90deg)', color: 'action.active' }} />

                                {/* Condition Box */}
                                <Box sx={{ width: '100%', p: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2, textAlign: 'center' }}>
                                    <Typography variant="caption" sx={{ textTransform: 'uppercase', color: 'text.secondary', fontWeight: 700 }}>
                                        Conditions Evaluation
                                    </Typography>
                                    {conditions.length === 0 ? (
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                                            Always Met (No conditions)
                                        </Typography>
                                    ) : (
                                        <Stack spacing={0.5} sx={{ mt: 1 }}>
                                            {conditions.map((cond, idx) => (
                                                <Typography key={idx} variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                                                    {cond.field} {cond.operator} {cond.value || '""'}
                                                </Typography>
                                            ))}
                                        </Stack>
                                    )}
                                </Box>

                                <ArrowForwardIcon sx={{ transform: 'rotate(90deg)', color: 'action.active' }} />

                                {/* Actions Stack */}
                                <Stack spacing={1} sx={{ width: '100%' }}>
                                    {actions.length === 0 ? (
                                        <Box sx={{ p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 2, textAlign: 'center', color: 'text.secondary' }}>
                                            <Typography variant="body2">No actions added</Typography>
                                        </Box>
                                    ) : (
                                        actions.map((act, idx) => (
                                            <Box key={idx} sx={{ p: 1.5, bgcolor: 'secondary.light', color: 'secondary.contrastText', borderRadius: 2, textAlign: 'center' }}>
                                                <Typography variant="caption" sx={{ textTransform: 'uppercase', opacity: 0.8, fontWeight: 700 }}>
                                                    Action #{idx + 1}: {act.action_type}
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                    {act.action_type === 'notify' && `Notify: ${act.action_config.target}`}
                                                    {act.action_type === 'update_record' && `Update: ${act.action_config.field}`}
                                                    {act.action_type === 'create_task' && `Task: ${act.action_config.title}`}
                                                    {act.action_type === 'send_email' && `Email: ${act.action_config.to}`}
                                                </Typography>
                                            </Box>
                                        ))
                                    )}
                                </Stack>
                            </Stack>
                        </Paper>
                    </Box>
                </Box>
            </Box>
        </AuthenticatedLayout>
    );
}

export default function WorkflowBuilderPage() {
    return (
        <Suspense fallback={null}>
            <WorkflowBuilderContent />
        </Suspense>
    );
}
