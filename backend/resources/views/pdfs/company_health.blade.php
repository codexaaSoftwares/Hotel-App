<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Company Health Report</title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            margin: 18px 18px 12px 18px;
            font-size: 12px;
            color: #000;
            line-height: 1.4;
        }
        .top-bar {
            width: 100%;
            margin-bottom: 12px;
        }
        .top-bar table {
            width: 100%;
            border-collapse: collapse;
        }
        .top-bar .left {
            font-size: 20px;
            font-weight: bold;
            letter-spacing: 0.5px;
            vertical-align: middle;
            color: #0d6efd;
        }
        .logo-img {
            max-width: 120px;
            max-height: 80px;
            object-fit: contain;
            vertical-align: middle;
        }
        .top-bar .logo-right {
            text-align: right;
            vertical-align: middle;
        }
        .company-name {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 4px;
            letter-spacing: 0.5px;
        }
        .company-meta {
            font-size: 12px;
            color: #000;
            margin-bottom: 3px;
            line-height: 1.4;
        }
        .section-title {
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 10px;
            margin-top: 18px;
            letter-spacing: 0.5px;
            color: #0d6efd;
            text-transform: uppercase;
            background-color: #e7f1ff;
            border: 1px solid #0d6efd;
            padding: 8px 12px;
            border-radius: 4px;
        }
        .section-title-green {
            background-color: #d1f2eb;
            border: 1px solid #198754;
            color: #198754;
        }
        .section-title-yellow {
            background-color: #fff3cd;
            border: 1px solid #ffc107;
            color: #856404;
        }
        .summary-cards {
            margin-bottom: 12px;
        }
        .summary-cards table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 8px;
            margin-bottom: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .summary-cards td {
            padding: 12px 8px;
            border: 1px solid #ddd;
            text-align: center;
            width: 25%;
            background: #fff;
        }
        .summary-cards .label {
            font-size: 11px;
            color: #666 !important;
            margin-bottom: 6px;
            font-weight: 600;
        }
        .summary-cards .value {
            font-size: 16px;
            font-weight: bold;
            color: #000 !important;
        }
        .card-blue {
            background: linear-gradient(135deg, #e7f1ff 0%, #ffffff 100%);
            border-left: 4px solid #0d6efd;
        }
        .card-green {
            background: linear-gradient(135deg, #d1f2eb 0%, #ffffff 100%);
            border-left: 4px solid #198754;
        }
        .card-yellow {
            background: linear-gradient(135deg, #fff3cd 0%, #ffffff 100%);
            border-left: 4px solid #ffc107;
        }
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
        }
        .data-table th {
            background-color: #f8f9fa;
            color: #000 !important;
            font-weight: bold;
            font-size: 11px;
            padding: 8px 6px;
            border: 1px solid #6c757d;
            text-align: left;
        }
        .data-table td {
            font-size: 11px;
            padding: 6px;
            border: 1px solid #dee2e6;
            background: #fff;
            color: #000 !important;
        }
        .data-table tr:nth-child(even) td {
            background: #f8f9fa;
            color: #000 !important;
        }
        .data-table .text-right {
            text-align: right;
        }
        .data-table .text-center {
            text-align: center;
        }
        .footer {
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #000;
            font-size: 10px;
            color: #666;
            text-align: center;
        }
        .page-break {
            page-break-before: always;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="top-bar">
        <table>
            <tr>
                <td class="left">COMPANY HEALTH REPORT</td>
                <td class="logo-right">
                    @php
                        $logoPath = $settings['business_logo'] ?? null;
                        $logoBase64 = null;
                        if ($logoPath) {
                            $fullPath = public_path('storage/' . $logoPath);
                            if (file_exists($fullPath)) {
                                try {
                                    $imageData = file_get_contents($fullPath);
                                    $imageInfo = getimagesize($fullPath);
                                    if ($imageInfo !== false) {
                                        $mimeType = $imageInfo['mime'];
                                        $logoBase64 = 'data:' . $mimeType . ';base64,' . base64_encode($imageData);
                                    }
                                } catch (\Exception $e) {
                                    \Log::warning('Failed to load business logo for PDF', ['path' => $fullPath, 'error' => $e->getMessage()]);
                                }
                            }
                        }
                    @endphp
                    @if($logoBase64)
                        <img src="{{ $logoBase64 }}" class="logo-img" alt="Logo">
                    @endif
                    <div class="company-name">{{ $settings['invoice_business_name'] ?? 'Company Name' }}</div>
                    @if(isset($settings['invoice_business_address']) && $settings['invoice_business_address'])
                        <div class="company-meta">{{ $settings['invoice_business_address'] }}</div>
                    @endif
                    @if(isset($settings['invoice_contact_phone']) && $settings['invoice_contact_phone'])
                        <div class="company-meta">Phone: {{ $settings['invoice_contact_phone'] }}</div>
                    @endif
                    @if(isset($settings['invoice_contact_email']) && $settings['invoice_contact_email'])
                        <div class="company-meta">Email: {{ $settings['invoice_contact_email'] }}</div>
                    @endif
                </td>
            </tr>
        </table>
    </div>

    <!-- Report Info -->
    <table style="width: 100%; margin-bottom: 12px;">
        <tr>
            <td style="color: #000 !important;"><strong>Date Range:</strong> {{ $dateRange['start'] }} to {{ $dateRange['end'] }}</td>
            <td style="text-align: right; color: #000 !important;"><strong>Generated:</strong> {{ $exportDate }}</td>
        </tr>
        @if($branchName)
        <tr>
            <td colspan="2" style="color: #000 !important;"><strong>Branch:</strong> {{ $branchName }}</td>
        </tr>
        @endif
    </table>

    <!-- Section 1: Order Summary -->
    <div class="section-title">Order Summary</div>
    <div class="summary-cards">
        <table>
            <tr>
                <td style="background-color: #e7f1ff; border: 1px solid #0d6efd;">
                    <div class="label" style="color: #0d6efd;">Total Orders</div>
                    <div class="value" style="color: #0d6efd;">{{ number_format($financialSummary['totalOrders'], 0) }}</div>
                </td>
                <td style="background-color: #e7f1ff; border: 1px solid #0d6efd;">
                    <div class="label" style="color: #0d6efd;">Order Amount</div>
                    <div class="value" style="color: #0d6efd;">₹{{ number_format($financialSummary['totalRevenue'], 0) }}</div>
                </td>
                <td style="background-color: #d1f2eb; border: 1px solid #198754;">
                    <div class="label" style="color: #198754;">Paid Amounts</div>
                    <div class="value" style="color: #198754;">₹{{ number_format($financialSummary['netPayments'], 0) }}</div>
                </td>
                <td style="background-color: #fff3cd; border: 1px solid #ffc107;">
                    <div class="label" style="color: #856404;">Remaining Amounts</div>
                    <div class="value" style="color: #856404;">₹{{ number_format($financialSummary['outstandingAmount'], 0) }}</div>
                </td>
            </tr>
        </table>
    </div>

    @if(count($allCustomers) > 0)
    <div style="margin-bottom: 8px; margin-top: 12px;">
        <strong style="color: #0d6efd; font-size: 12px;">All Customers ({{ count($allCustomers) }})</strong>
    </div>
    <table class="data-table">
        <thead>
            <tr>
                <th style="background-color: #e7f1ff; border: 1px solid #0d6efd; color: #0d6efd !important;">Code</th>
                <th style="background-color: #e7f1ff; border: 1px solid #0d6efd; color: #0d6efd !important;">Job Code</th>
                <th style="background-color: #e7f1ff; border: 1px solid #0d6efd; color: #0d6efd !important;">Name</th>
                <th style="background-color: #e7f1ff; border: 1px solid #0d6efd; color: #0d6efd !important;">Email</th>
                <th style="background-color: #e7f1ff; border: 1px solid #0d6efd; color: #0d6efd !important;">Phone</th>
                <th style="background-color: #e7f1ff; border: 1px solid #0d6efd; color: #0d6efd !important;">Branch</th>
                <th class="text-right" style="background-color: #e7f1ff; border: 1px solid #0d6efd; color: #0d6efd !important;">Order Amount</th>
                <th class="text-right" style="background-color: #e7f1ff; border: 1px solid #0d6efd; color: #0d6efd !important;">Paid</th>
                <th class="text-right" style="background-color: #e7f1ff; border: 1px solid #0d6efd; color: #0d6efd !important;">Remaining</th>
            </tr>
        </thead>
        <tbody>
            @foreach($allCustomers as $customer)
            <tr>
                <td style="color: #000 !important; border: 1px solid #0d6efd;"><strong>{{ $customer['customerCode'] }}</strong></td>
                <td style="color: #0d6efd !important; font-weight: bold; border: 1px solid #0d6efd;">{{ $customer['jobCode'] ?? $customer['job_code'] ?? '-' }}</td>
                <td style="color: #000 !important; border: 1px solid #0d6efd;">{{ $customer['name'] }}</td>
                <td style="color: #000 !important; border: 1px solid #0d6efd;">{{ $customer['email'] ?: '-' }}</td>
                <td style="color: #000 !important; border: 1px solid #0d6efd;">{{ $customer['phone'] ?: '-' }}</td>
                <td style="color: #000 !important; border: 1px solid #0d6efd;">{{ $customer['branchName'] ?: '-' }}</td>
                <td class="text-right" style="font-weight: bold; color: #000 !important; border: 1px solid #0d6efd;">₹{{ number_format($customer['totalOrderAmount'], 0) }}</td>
                <td class="text-right" style="color: #198754 !important; font-weight: bold; border: 1px solid #0d6efd;">₹{{ number_format($customer['paidAmount'], 0) }}</td>
                <td class="text-right" style="color: {{ $customer['remainingAmount'] > 0 ? '#dc3545' : '#198754' }} !important; font-weight: bold; border: 1px solid #0d6efd;">₹{{ number_format($customer['remainingAmount'], 0) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @endif

    <!-- Section 2: Income & Expense Summary -->
    <div class="page-break"></div>
    <div class="section-title section-title-green">Income & Expense Summary</div>
    <div class="summary-cards">
        <table>
            <tr>
                <td style="background-color: #e7f1ff; border: 1px solid #0d6efd;">
                    <div class="label" style="color: #0d6efd;">Total Records</div>
                    <div class="value" style="color: #0d6efd;">{{ number_format($incomeExpenses['totalRecords'], 0) }}</div>
                </td>
                <td style="background-color: #d1f2eb; border: 1px solid #198754;">
                    <div class="label" style="color: #198754;">Total Income</div>
                    <div class="value" style="color: #198754;">₹{{ number_format($incomeExpenses['totalIncome'], 0) }}</div>
                </td>
                <td style="background-color: #f8d7da; border: 1px solid #dc3545;">
                    <div class="label" style="color: #dc3545;">Total Expenses</div>
                    <div class="value" style="color: #dc3545;">₹{{ number_format($incomeExpenses['totalExpenses'], 0) }}</div>
                </td>
                <td style="background-color: #d1ecf1; border: 1px solid #0dcaf0;">
                    <div class="label" style="color: #0dcaf0;">Net Profit</div>
                    <div class="value" style="color: #0dcaf0;">₹{{ number_format($incomeExpenses['netProfit'], 0) }}</div>
                </td>
            </tr>
        </table>
    </div>

    @if(count($incomeExpenses['incomeByCategory']) > 0)
    <div style="margin-bottom: 8px; margin-top: 12px;">
        <strong style="color: #198754; font-size: 12px;">Income by Category</strong>
    </div>
    <table class="data-table">
        <thead>
            <tr>
                <th style="background-color: #d1f2eb; border: 1px solid #198754; color: #198754 !important;">Category</th>
                <th class="text-right" style="background-color: #d1f2eb; border: 1px solid #198754; color: #198754 !important;">Amount</th>
            </tr>
        </thead>
        <tbody>
            @foreach($incomeExpenses['incomeByCategory'] as $item)
            <tr>
                <td style="color: #000 !important; border: 1px solid #198754;"><strong>{{ $item['category'] }}</strong></td>
                <td class="text-right" style="color: #198754 !important; font-weight: bold; border: 1px solid #198754;">₹{{ number_format($item['amount'], 0) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @endif

    @if(count($incomeRecords) > 0)
    <div style="margin-top: 12px; margin-bottom: 8px;">
        <strong style="color: #198754; font-size: 12px;">Income Records ({{ count($incomeRecords) }})</strong>
    </div>
    <table class="data-table">
        <thead>
            <tr>
                <th style="background-color: #d1f2eb; border: 1px solid #198754; color: #198754 !important;">Date</th>
                <th style="background-color: #d1f2eb; border: 1px solid #198754; color: #198754 !important;">Category</th>
                <th style="background-color: #d1f2eb; border: 1px solid #198754; color: #198754 !important;">Description</th>
                <th class="text-right" style="background-color: #d1f2eb; border: 1px solid #198754; color: #198754 !important;">Amount</th>
            </tr>
        </thead>
        <tbody>
            @foreach($incomeRecords as $record)
            <tr>
                <td style="color: #000 !important; border: 1px solid #198754;">{{ \Carbon\Carbon::parse($record['date'])->format('Y-m-d') }}</td>
                <td style="color: #000 !important; border: 1px solid #198754;"><strong>{{ $record['category'] }}</strong></td>
                <td style="color: #000 !important; border: 1px solid #198754;">{{ $record['description'] ?: '-' }}</td>
                <td class="text-right" style="color: #198754 !important; font-weight: bold; border: 1px solid #198754;">₹{{ number_format($record['amount'], 0) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @endif

    @if(count($incomeExpenses['expensesByCategory']) > 0)
    <div style="margin-top: 12px; margin-bottom: 8px;">
        <strong style="color: #dc3545; font-size: 12px;">Expenses by Category</strong>
    </div>
    <table class="data-table">
        <thead>
            <tr>
                <th style="background-color: #f8d7da; border: 1px solid #dc3545; color: #dc3545 !important;">Category</th>
                <th class="text-right" style="background-color: #f8d7da; border: 1px solid #dc3545; color: #dc3545 !important;">Amount</th>
            </tr>
        </thead>
        <tbody>
            @foreach($incomeExpenses['expensesByCategory'] as $item)
            <tr>
                <td style="color: #000 !important; border: 1px solid #dc3545;"><strong>{{ $item['category'] }}</strong></td>
                <td class="text-right" style="color: #dc3545 !important; font-weight: bold; border: 1px solid #dc3545;">₹{{ number_format($item['amount'], 0) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @endif

    @if(count($expenseRecords) > 0)
    <div style="margin-top: 12px; margin-bottom: 8px;">
        <strong style="color: #dc3545; font-size: 12px;">Expense Records ({{ count($expenseRecords) }})</strong>
    </div>
    <table class="data-table">
        <thead>
            <tr>
                <th style="background-color: #f8d7da; border: 1px solid #dc3545; color: #dc3545 !important;">Date</th>
                <th style="background-color: #f8d7da; border: 1px solid #dc3545; color: #dc3545 !important;">Category</th>
                <th style="background-color: #f8d7da; border: 1px solid #dc3545; color: #dc3545 !important;">Description</th>
                <th class="text-right" style="background-color: #f8d7da; border: 1px solid #dc3545; color: #dc3545 !important;">Amount</th>
            </tr>
        </thead>
        <tbody>
            @foreach($expenseRecords as $record)
            <tr>
                <td style="color: #000 !important; border: 1px solid #dc3545;">{{ \Carbon\Carbon::parse($record['date'])->format('Y-m-d') }}</td>
                <td style="color: #000 !important; border: 1px solid #dc3545;"><strong>{{ $record['category'] }}</strong></td>
                <td style="color: #000 !important; border: 1px solid #dc3545;">{{ $record['description'] ?: '-' }}</td>
                <td class="text-right" style="color: #dc3545 !important; font-weight: bold; border: 1px solid #dc3545;">₹{{ number_format($record['amount'], 0) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @endif

    <!-- Section 3: Financial Overview -->
    <div class="page-break"></div>
    <div class="section-title section-title-yellow">Financial Overview</div>
    <div class="summary-cards">
        <table>
            <tr>
                <td style="background-color: #d1f2eb; border: 1px solid #198754;">
                    <div class="label" style="color: #198754;">Incoming Flow</div>
                    <div class="value" style="color: #198754; font-size: 18px;">₹{{ number_format($financialOverview['incomingFlow'], 0) }}</div>
                </td>
                <td style="background-color: #f8d7da; border: 1px solid #dc3545;">
                    <div class="label" style="color: #dc3545;">Expense Flow</div>
                    <div class="value" style="color: #dc3545; font-size: 18px;">₹{{ number_format($financialOverview['expenseFlow'], 0) }}</div>
                </td>
                <td style="background-color: #d1ecf1; border: 1px solid #0dcaf0;">
                    <div class="label" style="color: #0dcaf0;">Company Profit</div>
                    <div class="value" style="color: #0dcaf0; font-size: 18px;">₹{{ number_format($financialOverview['companyProfit'], 0) }}</div>
                </td>
                <td style="background-color: #fff3cd; border: 1px solid #ffc107;">
                    <div class="label" style="color: #856404;">Outstanding</div>
                    <div class="value" style="color: #856404; font-size: 18px;">₹{{ number_format($financialOverview['outstanding'], 0) }}</div>
                </td>
            </tr>
        </table>
    </div>

    <!-- Footer -->
    @if(isset($settings['invoice_footer_text']) && $settings['invoice_footer_text'])
    <div class="footer">
        {{ $settings['invoice_footer_text'] }}
    </div>
    @endif
</body>
</html>
