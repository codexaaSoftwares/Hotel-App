<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Setting;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Get existing default_gst_percentage if it exists
        $oldGstSetting = Setting::where('key', 'default_gst_percentage')
            ->where('group', 'GST Settings')
            ->first();

        // If old setting exists, migrate it to CGST and SGST (split 50/50)
        if ($oldGstSetting) {
            $oldGstValue = (float) $oldGstSetting->value;
            $cgstValue = $oldGstValue / 2;
            $sgstValue = $oldGstValue / 2;

            // Create CGST setting if it doesn't exist
            Setting::updateOrCreate(
                [
                    'key' => 'cgst_percentage',
                    'group' => 'GST Settings',
                ],
                [
                    'value' => (string) $cgstValue,
                    'description' => 'Central GST percentage',
                ]
            );

            // Create SGST setting if it doesn't exist
            Setting::updateOrCreate(
                [
                    'key' => 'sgst_percentage',
                    'group' => 'GST Settings',
                ],
                [
                    'value' => (string) $sgstValue,
                    'description' => 'State GST percentage',
                ]
            );
        } else {
            // If no old setting exists, create default values
            Setting::updateOrCreate(
                [
                    'key' => 'cgst_percentage',
                    'group' => 'GST Settings',
                ],
                [
                    'value' => '2.5',
                    'description' => 'Central GST percentage',
                ]
            );

            Setting::updateOrCreate(
                [
                    'key' => 'sgst_percentage',
                    'group' => 'GST Settings',
                ],
                [
                    'value' => '2.5',
                    'description' => 'State GST percentage',
                ]
            );
        }

        // Always create Service Tax setting (default 0)
        Setting::updateOrCreate(
            [
                'key' => 'service_tax_percentage',
                'group' => 'GST Settings',
            ],
            [
                'value' => '0',
                'description' => 'Service Tax percentage (can be 0)',
            ]
        );

        // Note: We don't delete the old default_gst_percentage setting
        // to maintain backward compatibility if needed
        // You can manually remove it later if desired
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Remove the new GST settings
        Setting::where('key', 'cgst_percentage')
            ->where('group', 'GST Settings')
            ->delete();

        Setting::where('key', 'sgst_percentage')
            ->where('group', 'GST Settings')
            ->delete();

        Setting::where('key', 'service_tax_percentage')
            ->where('group', 'GST Settings')
            ->delete();
    }
};

