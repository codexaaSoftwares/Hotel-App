<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\RoleController;
use App\Http\Controllers\API\PermissionController;
use App\Http\Controllers\API\SettingController;
use App\Http\Controllers\API\BranchController;
use App\Http\Controllers\API\DashboardController;
use App\Http\Controllers\API\FoodCategoryController;
use App\Http\Controllers\API\RestaurantSettingsController;
use App\Http\Controllers\API\FoodItemController;
use App\Http\Controllers\API\TableController;
use App\Http\Controllers\API\CustomerController;
use App\Http\Controllers\API\WalletTransactionController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Public routes
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Authentication
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/user', [AuthController::class, 'user']);
    Route::put('/auth/change-password', [AuthController::class, 'changePassword']);

    // User Management
    Route::get('/users', [UserController::class, 'index'])->middleware('permission:view_user');
    Route::post('/users', [UserController::class, 'store'])->middleware('permission:create_user');
    
    // User Profile (current user) - Must come before /users/{user} route
    Route::get('/users/profile', [UserController::class, 'profile']);
    Route::put('/users/profile', [UserController::class, 'updateProfile']);
    Route::post('/users/profile/avatar', [UserController::class, 'uploadAvatar']);
    Route::delete('/users/profile/avatar', [UserController::class, 'deleteAvatar']);
    
    // User Management (by ID) - Must come after /users/profile
    Route::get('/users/{user}', [UserController::class, 'show'])->middleware('permission:view_user');
    Route::put('/users/{user}', [UserController::class, 'update'])->middleware('permission:edit_user');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->middleware('permission:delete_user');

    // Role Management
    Route::get('/roles', [RoleController::class, 'index'])->middleware('permission:view_role');
    Route::post('/roles', [RoleController::class, 'store'])->middleware('permission:create_role');
    Route::get('/roles/{role}', [RoleController::class, 'show'])->middleware('permission:view_role');
    Route::put('/roles/{role}', [RoleController::class, 'update'])->middleware('permission:edit_role');
    Route::delete('/roles/{role}', [RoleController::class, 'destroy'])->middleware('permission:delete_role');
    Route::put('/roles/{role}/permissions', [RoleController::class, 'updatePermissions'])->middleware('permission:edit_role');

    // Permission Management
    Route::get('/permissions', [PermissionController::class, 'index'])->middleware('permission:view_permission');
    Route::get('/permissions/{permission}', [PermissionController::class, 'show'])->middleware('permission:view_permission');

    // Branch Management
    Route::get('/branches', [BranchController::class, 'index'])->middleware('permission:view_branch');
    Route::post('/branches', [BranchController::class, 'store'])->middleware('permission:create_branch');
    Route::get('/branches/{branch}', [BranchController::class, 'show'])->middleware('permission:view_branch');
    Route::put('/branches/{branch}', [BranchController::class, 'update'])->middleware('permission:edit_branch');
    Route::delete('/branches/{branch}', [BranchController::class, 'destroy'])->middleware('permission:delete_branch');

    // Food Category Management
    Route::get('/food-categories', [FoodCategoryController::class, 'index'])->middleware('permission:view_food_category');
    Route::get('/food-categories/hierarchy', [FoodCategoryController::class, 'hierarchy'])->middleware('permission:view_food_category');
    Route::post('/food-categories', [FoodCategoryController::class, 'store'])->middleware('permission:create_food_category');
    Route::get('/food-categories/{foodCategory}', [FoodCategoryController::class, 'show'])->middleware('permission:view_food_category');
    Route::put('/food-categories/{foodCategory}', [FoodCategoryController::class, 'update'])->middleware('permission:edit_food_category');
    Route::delete('/food-categories/{foodCategory}', [FoodCategoryController::class, 'destroy'])->middleware('permission:delete_food_category');

    // Food Item Management
    Route::get('/food-items', [FoodItemController::class, 'index'])->middleware('permission:view_food_item');
    Route::post('/food-items', [FoodItemController::class, 'store'])->middleware('permission:create_food_item');
    Route::get('/food-items/{foodItem}', [FoodItemController::class, 'show'])->middleware('permission:view_food_item');
    Route::put('/food-items/{foodItem}', [FoodItemController::class, 'update'])->middleware('permission:edit_food_item');
    Route::delete('/food-items/{foodItem}', [FoodItemController::class, 'destroy'])->middleware('permission:delete_food_item');
    Route::post('/food-items/{foodItem}/upload-image', [FoodItemController::class, 'uploadImage'])->middleware('permission:edit_food_item');
    Route::delete('/food-items/{foodItem}/image', [FoodItemController::class, 'deleteImage'])->middleware('permission:edit_food_item');
    Route::post('/food-items/{foodItem}/move-up', [FoodItemController::class, 'moveUp'])->middleware('permission:edit_food_item');
    Route::post('/food-items/{foodItem}/move-down', [FoodItemController::class, 'moveDown'])->middleware('permission:edit_food_item');

    // Table Management
    Route::get('/tables', [TableController::class, 'index'])->middleware('permission:view_table');
    Route::post('/tables', [TableController::class, 'store'])->middleware('permission:create_table');
    Route::get('/tables/{table}', [TableController::class, 'show'])->middleware('permission:view_table');
    Route::put('/tables/{table}', [TableController::class, 'update'])->middleware('permission:edit_table');
    Route::delete('/tables/{table}', [TableController::class, 'destroy'])->middleware('permission:delete_table');

    // Customer Management
    Route::get('/customers', [CustomerController::class, 'index'])->middleware('permission:view_customer');
    Route::post('/customers', [CustomerController::class, 'store'])->middleware('permission:create_customer');
    Route::get('/customers/{customer}', [CustomerController::class, 'show'])->middleware('permission:view_customer');
    Route::put('/customers/{customer}', [CustomerController::class, 'update'])->middleware('permission:edit_customer');
    Route::delete('/customers/{customer}', [CustomerController::class, 'destroy'])->middleware('permission:delete_customer');

    // Wallet Transaction Management
    Route::get('/wallet-transactions', [WalletTransactionController::class, 'index'])->middleware('permission:view_wallet_transaction');
    Route::post('/wallet-transactions', [WalletTransactionController::class, 'store'])->middleware('permission:create_wallet_transaction');
    Route::get('/wallet-transactions/{walletTransaction}', [WalletTransactionController::class, 'show'])->middleware('permission:view_wallet_transaction');
    Route::put('/wallet-transactions/{walletTransaction}', [WalletTransactionController::class, 'update'])->middleware('permission:edit_wallet_transaction');
    Route::delete('/wallet-transactions/{walletTransaction}', [WalletTransactionController::class, 'destroy'])->middleware('permission:delete_wallet_transaction');
    
    // Customer-specific wallet transactions (Customer Ledger)
    Route::get('/customers/{customer}/wallet-transactions', [WalletTransactionController::class, 'getByCustomer'])->middleware('permission:view_customer_ledger');

    // Restaurant Settings Management
    Route::prefix('restaurant-settings')->middleware('permission:view_restaurant_settings')->group(function () {
        Route::get('/', [RestaurantSettingsController::class, 'index']);
        Route::get('/by-section', [RestaurantSettingsController::class, 'listBySection']);
        Route::get('/by-section/{section}', [RestaurantSettingsController::class, 'getSection']);
        Route::get('/key/{key}', [RestaurantSettingsController::class, 'showByKey']);
    });

    Route::prefix('restaurant-settings')->middleware('permission:edit_restaurant_settings')->group(function () {
        Route::post('/', [RestaurantSettingsController::class, 'store']);
        Route::post('/bulk', [RestaurantSettingsController::class, 'bulkUpdate']);
    });


    // Dashboard
    Route::get('/dashboard/summary', [DashboardController::class, 'summary'])->middleware('permission:view_dashboard');

    // Reports
    // Report routes will be added here as needed

    // Settings
    Route::get('/settings', [SettingController::class, 'index'])->middleware('permission:view_setting');
    // Specific routes must come before parameterized routes
    Route::post('/settings/test-email', [SettingController::class, 'testEmail'])->middleware('permission:edit_setting');
            Route::post('/settings/upload-logo', [SettingController::class, 'uploadLogo'])->middleware('permission:edit_setting');
            Route::delete('/settings/delete-logo', [SettingController::class, 'deleteLogo'])->middleware('permission:edit_setting');
    Route::post('/settings/{group}', [SettingController::class, 'updateGroup'])->middleware('permission:edit_setting');

    Route::prefix('global-settings')->group(function () {
        Route::middleware('permission:view_setting')->group(function () {
            Route::get('/', [SettingController::class, 'listAll']);
            Route::get('/by-section', [SettingController::class, 'listBySection']);
            Route::get('/by-section/{section}', [SettingController::class, 'getSection']);
            Route::get('/key/{key}', [SettingController::class, 'showByKey']);
            Route::get('/{setting}', [SettingController::class, 'show']);
        });

        Route::middleware('permission:edit_setting')->group(function () {
            Route::post('/', [SettingController::class, 'store']);
            Route::put('/key/{key}', [SettingController::class, 'updateByKey']);
            Route::put('/{setting}', [SettingController::class, 'update']);
            Route::delete('/key/{key}', [SettingController::class, 'destroyByKey']);
            Route::delete('/{setting}', [SettingController::class, 'destroy']);
        });
    });
});

