<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\PaginatesResults;
use App\Http\Requests\RoomStoreRequest;
use App\Http\Requests\RoomUpdateRequest;
use App\Http\Resources\RoomResource;
use App\Models\Room;
use App\Models\Setting;
use App\Services\PdfExportService;
use Illuminate\Http\Request;

class RoomController extends Controller
{
    use PaginatesResults;

    /**
     * Display a listing of rooms.
     */
    public function index(Request $request)
    {
        $query = Room::with('roomCategory');

        // Search functionality
        if ($search = $request->input('search')) {
            $query->where(function ($builder) use ($search) {
                $builder->where('room_number', 'like', "%{$search}%")
                    ->orWhere('notes', 'like', "%{$search}%")
                    ->orWhereHas('roomCategory', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            });
        }

        // Status filter
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // Category filter
        if ($categoryId = $request->input('category_id')) {
            $query->where('room_category_id', $categoryId);
        }

        // Floor filter
        if ($request->has('floor_number')) {
            $query->where('floor_number', $request->input('floor_number'));
        }

        // Active filter
        if ($request->has('is_active')) {
            $isActive = filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN);
            $query->where('is_active', $isActive);
        }

        // Default ordering by room_number
        if (!$request->has('sort_by')) {
            $query->orderBy('floor_number', 'asc')->orderBy('room_number', 'asc');
        }

        // Build query for all records (for data field)
        $allQuery = clone $query;
        $allRooms = $allQuery->get();

        // Build paginator for metadata
        $pagination = $this->buildPaginator(
            $request,
            $query,
            ['room_number', 'floor_number', 'bed_type', 'max_occupancy', 'status', 'is_active', 'created_at'],
            ['column' => 'room_number', 'direction' => 'asc']
        );

        /** @var \Illuminate\Pagination\LengthAwarePaginator $paginator */
        $paginator = $pagination['paginator'];

        // Transform all records for data field
        $allRoomsData = array_map(
            function (Room $room) use ($request) {
                return (new RoomResource($room))->toArray($request);
            },
            $allRooms->all()
        );

        return response()->json([
            'success' => true,
            'data' => $allRoomsData,
            'meta' => $this->paginationMeta($paginator, $pagination['sortBy'], $pagination['sortDirection']),
        ]);
    }

    /**
     * Store a newly created room.
     */
    public function store(RoomStoreRequest $request)
    {
        $room = Room::create($request->validated());

        return (new RoomResource($room->load('roomCategory')))
            ->additional([
                'success' => true,
                'message' => 'Room created successfully.',
            ])
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified room.
     */
    public function show(Room $room)
    {
        return (new RoomResource($room->load('roomCategory')))
            ->additional([
                'success' => true,
                'message' => 'Room retrieved successfully.',
            ]);
    }

    /**
     * Update the specified room.
     */
    public function update(RoomUpdateRequest $request, Room $room)
    {
        $room->update($request->validated());

        return (new RoomResource($room->load('roomCategory')))
            ->additional([
                'success' => true,
                'message' => 'Room updated successfully.',
            ]);
    }

    /**
     * Remove the specified room.
     */
    public function destroy(Room $room)
    {
        $room->delete();

        return response()->json([
            'success' => true,
            'message' => 'Room deleted successfully.',
        ]);
    }

    /**
     * Export rooms as PDF.
     */
    public function exportRooms(Request $request)
    {
        $query = Room::with('roomCategory');

        // Search functionality
        if ($search = $request->input('search')) {
            $query->where(function ($builder) use ($search) {
                $builder->where('room_number', 'like', "%{$search}%")
                    ->orWhere('notes', 'like', "%{$search}%")
                    ->orWhereHas('roomCategory', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            });
        }

        // Status filter
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // Category filter
        if ($categoryId = $request->input('category_id')) {
            $query->where('room_category_id', $categoryId);
        }

        // Floor filter
        if ($request->has('floor_number')) {
            $query->where('floor_number', $request->input('floor_number'));
        }

        // Active filter
        if ($request->has('is_active')) {
            $isActive = filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN);
            $query->where('is_active', $isActive);
        }

        // Order by floor and room number
        $query->orderBy('floor_number', 'asc')->orderBy('room_number', 'asc');

        $rooms = $query->get();

        // Get business info
        $businessInfo = Setting::businessInfo(['company_name', 'businessAddress']);
        $businessName = $businessInfo['company_name'] ?? $businessInfo['business_name'] ?? 'Company Name';
        $businessAddress = $businessInfo['businessAddress'] ?? $businessInfo['business_address'] ?? 'Company Address';
        $businessPhone = $businessInfo['business_phone'] ?? null;
        $businessEmail = $businessInfo['business_email'] ?? null;
        $gstNumber = $businessInfo['gstNumber'] ?? null;

        // Calculate summary
        $summary = [
            'total' => $rooms->count(),
            'available' => $rooms->where('status', 'available')->count(),
            'occupied' => $rooms->where('status', 'occupied')->count(),
            'reserved' => $rooms->where('status', 'reserved')->count(),
            'cleaning' => $rooms->where('status', 'cleaning')->count(),
            'maintenance' => $rooms->where('status', 'maintenance')->count(),
            'active' => $rooms->where('is_active', true)->count(),
            'inactive' => $rooms->where('is_active', false)->count(),
        ];

        // Prepare data for PDF
        $data = [
            'rooms' => $rooms,
            'summary' => $summary,
            'businessInfo' => [
                'company_name' => $businessName,
                'business_name' => $businessName,
                'businessAddress' => $businessAddress,
                'business_address' => $businessAddress,
                'businessPhone' => $businessPhone,
                'business_phone' => $businessPhone,
                'businessEmail' => $businessEmail,
                'business_email' => $businessEmail,
                'gstNumber' => $gstNumber,
            ],
            'generatedDate' => now()->format('d/m/Y h:i A'),
        ];

        $filename = 'Rooms_' . now()->format('Y-m-d') . '.pdf';

        $pdfService = new PdfExportService();
        return $pdfService->export('pdfs.rooms', $data, $filename);
    }
}

