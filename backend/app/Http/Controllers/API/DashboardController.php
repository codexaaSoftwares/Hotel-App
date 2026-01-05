<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Dashboard summary - Empty for now, will be implemented later.
     */
    public function summary(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => [
                'message' => 'Dashboard will be implemented here',
            ],
        ]);
    }

}
