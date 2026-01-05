<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

trait PaginatesResults
{
    /**
     * Paginate a query builder with dynamic sorting controls.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  array<string>  $sortableColumns
     * @param  array{column:string|null,direction:string|null}  $defaultSort
     * @return array{paginator:LengthAwarePaginator, sortBy:string|null, sortDirection:string|null}
     */
    protected function buildPaginator(
        Request $request,
        Builder $query,
        array $sortableColumns = [],
        array $defaultSort = []
    ): array {
        $page = max((int) $request->input('page', 1), 1);
        $limit = (int) $request->input('limit', 20);
        $limit = min(max($limit, 1), 100);

        $requestedSort = $request->input('sort_by');
        $sortBy = $requestedSort ?: ($defaultSort['column'] ?? null);

        $direction = strtolower($request->input('sort_direction', $defaultSort['direction'] ?? 'asc'));
        $sortDirection = $direction === 'desc' ? 'desc' : 'asc';

        if ($sortBy) {
            if (empty($sortableColumns) || in_array($sortBy, $sortableColumns, true)) {
                $query->orderBy($sortBy, $sortDirection);
            } elseif (isset($defaultSort['column'])) {
                $query->orderBy($defaultSort['column'], $sortDirection);
                $sortBy = $defaultSort['column'];
            }
        }

        $paginator = $query->paginate($limit, ['*'], 'page', $page);
        $paginator->appends($request->except(['page']));

        return [
            'paginator' => $paginator,
            'sortBy' => $sortBy,
            'sortDirection' => $sortBy ? $sortDirection : null,
        ];
    }

    /**
     * Build a standardized pagination meta array.
     *
     * @param  \Illuminate\Pagination\LengthAwarePaginator  $paginator
     * @param  string|null  $sortBy
     * @param  string|null  $sortDirection
     * @return array<string, mixed>
     */
    protected function paginationMeta(
        LengthAwarePaginator $paginator,
        ?string $sortBy = null,
        ?string $sortDirection = null
    ): array {
        return [
            'total' => $paginator->total(),
            'page' => $paginator->currentPage(),
            'limit' => $paginator->perPage(),
            'totalPages' => $paginator->lastPage(),
            'hasNext' => $paginator->hasMorePages(),
            'hasPrev' => $paginator->currentPage() > 1,
            'sortBy' => $sortBy,
            'sortDirection' => $sortDirection,
        ];
    }
}


