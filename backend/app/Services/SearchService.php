<?php

namespace App\Services;

use App\Models\Document;

class SearchService
{
    public function searchDocuments(int $companyId, array $filters): \Illuminate\Pagination\LengthAwarePaginator
    {
        $query = Document::where('company_id', $companyId)
            ->with(['folder', 'category', 'uploader', 'tags', 'employees']);

        if (!empty($filters['q'])) {
            $q = $filters['q'];
            $query->where(fn($sub) => $sub
                ->where('title', 'like', "%{$q}%")
                ->orWhere('file_name', 'like', "%{$q}%")
                ->orWhere('description', 'like', "%{$q}%")
                ->orWhereHas('tags', fn($t) => $t->where('name', 'like', "%{$q}%"))
            );
        }

        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }
        if (!empty($filters['folder_id'])) {
            $query->where('folder_id', $filters['folder_id']);
        }
        if (!empty($filters['uploaded_by'])) {
            $query->where('uploaded_by', $filters['uploaded_by']);
        }
        if (!empty($filters['employee_id'])) {
            $query->whereHas('employees', fn($e) => $e->where('employees.id', $filters['employee_id']));
        }
        if (!empty($filters['extension'])) {
            $query->where('extension', $filters['extension']);
        }
        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }
        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        return $query->latest()->paginate($filters['per_page'] ?? 15);
    }
}
