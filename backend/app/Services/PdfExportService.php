<?php

namespace App\Services;

use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;

class PdfExportService
{
    /**
     * Ensure required storage directories exist.
     *
     * @return void
     */
    protected function ensureDirectoriesExist()
    {
        $directories = [
            storage_path('framework/views'),
            storage_path('framework/cache'),
        ];

        foreach ($directories as $directory) {
            if (!file_exists($directory)) {
                @mkdir($directory, 0755, true);
            }
        }
    }

    /**
     * Generate PDF and return download response.
     *
     * @param string $view
     * @param array $data
     * @param string $filename
     * @return Response
     */
    public function export($view, $data = [], $filename = 'document.pdf')
    {
        // Ensure required directories exist before generating PDF
        $this->ensureDirectoriesExist();
        
        $pdf = Pdf::loadView($view, $data);
        return $pdf->download($filename);
    }

    /**
     * Alias for export to maintain semantic clarity.
     *
     * @param string $view
     * @param array $data
     * @param string $filename
     * @return Response
     */
    public function download($view, $data = [], $filename = 'document.pdf')
    {
        return $this->export($view, $data, $filename);
    }

    /**
     * Generate PDF and return stream response.
     *
     * @param string $view
     * @param array $data
     * @param string $filename
     * @return Response
     */
    public function stream($view, $data = [], $filename = 'document.pdf')
    {
        // Ensure required directories exist before generating PDF
        $this->ensureDirectoriesExist();
        
        $pdf = Pdf::loadView($view, $data);
        return $pdf->stream($filename);
    }

    /**
     * Generate PDF and return raw binary data.
     *
     * @param string $view
     * @param array $data
     * @return string
     */
    public function raw($view, $data = [])
    {
        // Ensure required directories exist before generating PDF
        $this->ensureDirectoriesExist();
        
        $pdf = Pdf::loadView($view, $data);
        return $pdf->output();
    }
}

