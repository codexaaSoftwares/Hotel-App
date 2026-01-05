<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>CUSTOMER REPORT #{{ $customer->customer_code ?? $customer->id }}</title>
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
        .top-bar .meta-row {
            margin-bottom: 3px;
            line-height: 1.5;
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
        .header-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0 0;
            margin-bottom: 14px;
        }
        .header-table td {
            vertical-align: top;
            padding: 0 6px 0 0;
        }
        .header-table .company-cell {
            width: 50%;
        }
        .header-table .info-cell {
            width: 50%;
            text-align: right;
        }
        .info-table {
            width: 100%;
            margin-bottom: 6px;
        }
        .info-table td {
            padding: 1px 4px 1px 0;
            font-size: 12px;
        }
        .section-title {
            font-weight: bold;
            font-size: 12px;
            margin-bottom: 8px;
            margin-top: 14px;
            letter-spacing: 0.5px;
            color: #000;
            text-transform: uppercase;
        }
        .products-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 8px;
        }
        .products-table th {
            background: transparent;
            font-weight: bold;
            font-size: 12px;
            padding: 6px 4px;
            border: 1px solid #000;
        }
        .products-table th.text-center {
            text-align: center;
        }
        .products-table th.text-start {
            text-align: left;
        }
        .products-table th.text-end {
            text-align: right;
        }
        .products-table td {
            border: 1px solid #000;
            padding: 6px 4px;
            font-size: 12px;
        }
        .products-table td.text-center {
            text-align: center;
        }
        .products-table td.text-start {
            text-align: left;
        }
        .products-table td.text-end {
            text-align: right;
        }
        .products-table tr:last-child td {
            border: 1px solid #000;
        }
        .totals-row {
            font-size: 12px;
            margin-bottom: 12px;
            margin-top: 6px;
            padding: 6px 0;
        }
        .totals-row strong {
            font-weight: 600;
        }
        .bottom-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0 0;
            margin-top: 14px;
        }
        .bottom-table td {
            vertical-align: top;
            padding: 0 6px 0 0;
        }
        .payment-list {
            font-size: 12px;
            margin: 6px 0 0 0;
            padding-left: 14px;
        }
        .payment-list li {
            margin-bottom: 4px;
            line-height: 1.5;
        }
        .summary-table {
            width: 100%;
            margin-top: 6px;
            border-spacing: 0;
        }
        .summary-table td {
            padding: 5px 4px;
            font-size: 12px;
        }
        .summary-table .label {
            text-align: right;
            color: #000;
        }
        .summary-table .value {
            text-align: right;
            font-weight: bold;
            color: #000;
        }
        .summary-table .final {
            font-size: 13px;
            border-top: 1px solid #000;
            padding-top: 6px;
            margin-top: 3px;
            color: #000;
        }
        .stats-grid {
            display: table;
            width: 100%;
            margin-top: 6px;
            border-spacing: 4px;
        }
        .stats-grid .stat-item {
            display: table-cell;
            padding: 8px;
            background: transparent;
            border: 1px solid #000;
            text-align: center;
            vertical-align: top;
        }
        .stats-grid .stat-label {
            font-size: 10px;
            color: #000;
            margin-bottom: 4px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .stats-grid .stat-value {
            font-size: 14px;
            font-weight: bold;
            color: #000;
        }
        .footer {
            margin-top: 20px;
            padding-top: 12px;
            text-align: center;
            font-size: 11px;
            color: #000;
            letter-spacing: 0.3px;
            line-height: 1.6;
        }
        .footer div {
            margin-bottom: 3px;
        }
        .footer .footer-name {
            font-weight: 600;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
        }
        .footer .footer-contact {
            margin: 4px 0;
        }
        .footer .footer-text {
            margin-top: 8px;
            font-style: italic;
        }
    </style>
</head>
<body>
    @php
        $exportedAt = \Carbon\Carbon::parse($exportDate ?? now());
        
        // Report Generated date & time
        $reportGeneratedDate = $exportedAt->format('d M Y');
        $reportGeneratedTime = $exportedAt->format('h:i A');
        
        // Customer created on
        $customerCreatedOn = optional($customer->created_at)->format('d M Y, h:i A') ?? 'N/A';
        
        // Customer last updated on
        $customerUpdatedOn = optional($customer->updated_at)->format('d M Y, h:i A') ?? 'N/A';

        $businessName = $settings['invoice_business_name']
            ?? $settings['business_name']
            ?? 'Photo Studio Management';
        $businessAddress = $settings['invoice_business_address']
            ?? $settings['business_address']
            ?? null;
        $businessPhone = $settings['invoice_contact_phone']
            ?? $settings['business_phone']
            ?? null;
        $businessEmail = $settings['invoice_contact_email']
            ?? $settings['business_email']
            ?? null;
        $businessWebsite = $settings['invoice_business_website']
            ?? $settings['business_website']
            ?? null;
        $footerText = $settings['invoice_footer_text']
            ?? 'Thank you for your business!';
        
        // Get logo path and convert to base64 for PDF
        // IMPORTANT: dompdf requires GD extension to process images (even base64)
        // If GD is not available, logo will be skipped completely
        $logoPath = $settings['business_logo'] ?? null;
        $logoBase64 = null;
        
        // Only process logo if GD extension is available
        if (extension_loaded('gd')) {
            // Try to load uploaded business logo first
            if ($logoPath) {
                $fullPath = storage_path('app/public/' . $logoPath);
                if (file_exists($fullPath) && is_readable($fullPath)) {
                    try {
                        $imageData = file_get_contents($fullPath);
                        $extension = strtolower(pathinfo($fullPath, PATHINFO_EXTENSION));
                        $mimeTypes = [
                            'jpg' => 'image/jpeg',
                            'jpeg' => 'image/jpeg',
                            'png' => 'image/png',
                            'gif' => 'image/gif',
                            'webp' => 'image/webp',
                        ];
                        $mimeType = $mimeTypes[$extension] ?? 'image/png';
                        $logoBase64 = 'data:' . $mimeType . ';base64,' . base64_encode($imageData);
                    } catch (\Exception $e) {
                        \Log::warning('Failed to load business logo for PDF', ['path' => $fullPath, 'error' => $e->getMessage()]);
                    }
                }
            }
            
            // If no business logo, use default logo
            if (!$logoBase64) {
                $defaultLogoPath = public_path('images/logo-transprant.png');
                if (file_exists($defaultLogoPath) && is_readable($defaultLogoPath)) {
                    try {
                        $imageData = file_get_contents($defaultLogoPath);
                        $logoBase64 = 'data:image/png;base64,' . base64_encode($imageData);
                    } catch (\Exception $e) {
                        \Log::warning('Failed to load default logo for PDF', ['path' => $defaultLogoPath, 'error' => $e->getMessage()]);
                    }
                }
            }
        }

        $customerName = trim(implode(' ', array_filter([
            $customer->first_name ?? null,
            $customer->last_name ?? null,
        ]))) ?: 'Walk-in';
        $customerCode = $customer->customer_code ?? 'N/A';
        $customerPhone = $customer->phone ?? $customer->mobile ?? 'N/A';
        $customerEmail = $customer->email ?? null;
        $customerAddress = implode(', ', array_filter([
            $customer->address ?? null,
            $customer->city ?? null,
            $customer->state ?? null,
            $customer->postal_code ?? null,
            $customer->country ?? null,
        ]));
        if(blank($customerAddress)) {
            $customerAddress = '-';
        }

        $branch = $customer->branch;
        $branchName = $branch->branch_name ?? 'N/A';
        $branchCode = $branch->branch_code ?? null;

        // Statistics
        $totalOrders = $customer->total_orders ?? 0;
        $totalAmount = $customer->total_amount ?? 0;
        $paidAmount = $customer->paid_amount ?? 0;
        $remainingAmount = $customer->remaining_amount ?? 0;
        $walletBalance = $customer->wallet_balance ?? 0;
        
        // Additional info
        $dob = optional($customer->dob)->format('d M Y') ?? null;
        $anniversaryDate = optional($customer->anniversary_date)->format('d M Y') ?? null;
        $status = \Illuminate\Support\Str::title($customer->status ?? 'N/A');
    @endphp

    <!-- Top Bar: Business Name (left) and Logo (right) -->
    <div class="top-bar">
        <table>
            <tr>
                <td class="left" style="width: 60%;">{{ $businessName }}</td>
                <td class="logo-right" style="width: 40%; text-align: right;">
                    @if($logoBase64)
                        <img src="{{ $logoBase64 }}" alt="{{ $businessName }}" class="logo-img" />
                    @endif
                </td>
            </tr>
        </table>
    </div>
    <hr style="border:0;border-top:1px solid #000;margin:0 0 12px 0;">

    <!-- Second Section: Report Details (left) and Customer Info (right) -->
    <table class="header-table">
        <tr>
            <td class="company-cell">
                <div class="company-name" style="font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">CUSTOMER REPORT</div>
                <div class="company-meta" style="margin-top: 4px;">
                    <div><strong>Customer Code:</strong> {{ $customerCode }}</div>
                    <div><strong>Report Generated:</strong> {{ $reportGeneratedDate }}, {{ $reportGeneratedTime }}</div>
                    <div><strong>Customer Since:</strong> {{ $customerCreatedOn }}</div>
                </div>
            </td>
            <td class="info-cell">
                <div class="company-name">{{ $customerName }}</div>
                <div class="company-meta">Phone: {{ $customerPhone }}</div>
                @if($customerEmail)
                    <div class="company-meta">Email: {{ $customerEmail }}</div>
                @endif
                @if($customerAddress && $customerAddress !== '-')
                    <div class="company-meta">Address: {{ $customerAddress }}</div>
                @endif
                @if($dob)
                    <div class="company-meta">DOB: {{ $dob }}</div>
                @endif
                @if($anniversaryDate)
                    <div class="company-meta">Anniversary: {{ $anniversaryDate }}</div>
                @endif
                <div class="company-meta">Status: {{ $status }}</div>
                @if($branchName)
                    <div class="company-meta">Branch: {{ $branchName }}@if($branchCode) ({{ $branchCode }})@endif</div>
                @endif
            </td>
        </tr>
    </table>

    <!-- Statistics Summary -->
    <div class="section-title">Statistics Summary</div>
    <div class="stats-grid">
        <div class="stat-item">
            <div class="stat-label">Total Orders</div>
            <div class="stat-value">{{ $totalOrders }}</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">Total Amount</div>
            <div class="stat-value">₹{{ number_format($totalAmount, 2) }}</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">Paid Amount</div>
            <div class="stat-value">₹{{ number_format($paidAmount, 2) }}</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">Remaining</div>
            <div class="stat-value">₹{{ number_format($remainingAmount, 2) }}</div>
        </div>
        @if($walletBalance > 0)
        <div class="stat-item">
            <div class="stat-label">Wallet Balance</div>
            <div class="stat-value">₹{{ number_format($walletBalance, 2) }}</div>
        </div>
        @endif
    </div>

    <!-- Order History -->
    <div class="section-title">Order History</div>
    @if($customer->orders && $customer->orders->count() > 0)
        <table class="products-table">
            <thead>
                <tr>
                    <th class="text-center">#</th>
                    <th class="text-start">Order Number</th>
                    <th class="text-center">Date</th>
                    <th class="text-center">Status</th>
                    <th class="text-end">Total</th>
                    <th class="text-end">Paid</th>
                    <th class="text-end">Due</th>
                </tr>
            </thead>
            <tbody>
                @foreach($customer->orders as $idx => $order)
                    @php
                        $orderDate = optional($order->order_date)->format('d M Y') ?? 'N/A';
                        $orderStatus = \Illuminate\Support\Str::title($order->status ?? 'N/A');
                        $orderTotal = $order->total_amount ?? 0;
                        $orderPaid = $order->paid_amount ?? 0;
                        $orderDue = $order->remaining_amount ?? 0;
                    @endphp
                    <tr>
                        <td class="text-center">{{ $idx + 1 }}</td>
                        <td class="text-start">{{ $order->order_number ?? 'N/A' }}</td>
                        <td class="text-center">{{ $orderDate }}</td>
                        <td class="text-center">{{ $orderStatus }}</td>
                        <td class="text-end">₹{{ number_format($orderTotal, 2) }}</td>
                        <td class="text-end">₹{{ number_format($orderPaid, 2) }}</td>
                        <td class="text-end">₹{{ number_format($orderDue, 2) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
        <div class="totals-row">
            <strong>Total Orders:</strong> {{ $customer->orders->count() }}
        </div>
    @else
        <div style="color:#000; padding: 12px 0;">No orders found.</div>
    @endif

    <!-- Payment History -->
    <div class="section-title">Payment History</div>
    @if($customer->payments && $customer->payments->count() > 0)
        <table class="products-table">
            <thead>
                <tr>
                    <th class="text-center">#</th>
                    <th class="text-start">Payment Number</th>
                    <th class="text-center">Date</th>
                    <th class="text-center">Type</th>
                    <th class="text-center">Method</th>
                    <th class="text-end">Amount</th>
                    <th class="text-start">Order</th>
                </tr>
            </thead>
            <tbody>
                @foreach($customer->payments as $idx => $payment)
                    @php
                        $paymentDate = optional($payment->payment_date)->format('d M Y') ?? 'N/A';
                        $paymentType = \Illuminate\Support\Str::title($payment->payment_type ?? 'N/A');
                        $paymentMethod = \Illuminate\Support\Str::title(str_replace('_', ' ', $payment->payment_method ?? 'N/A'));
                        $paymentAmount = $payment->amount ?? 0;
                        $orderNumber = $payment->order->order_number ?? 'N/A';
                    @endphp
                    <tr>
                        <td class="text-center">{{ $idx + 1 }}</td>
                        <td class="text-start">{{ $payment->payment_number ?? 'N/A' }}</td>
                        <td class="text-center">{{ $paymentDate }}</td>
                        <td class="text-center">{{ $paymentType }}</td>
                        <td class="text-center">{{ $paymentMethod }}</td>
                        <td class="text-end">₹{{ number_format($paymentAmount, 2) }}</td>
                        <td class="text-start">{{ $orderNumber }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
        <div class="totals-row">
            <strong>Total Payments:</strong> {{ $customer->payments->count() }}
        </div>
    @else
        <div style="color:#000; padding: 12px 0;">No payments found.</div>
    @endif

    <div class="footer">
        <div class="footer-name">{{ $businessName }}</div>
        <div class="footer-contact">
            @php
                $footerParts = [];
                if($businessAddress) {
                    $footerParts[] = $businessAddress;
                }
                if($businessPhone) {
                    $footerParts[] = $businessPhone;
                }
                if($businessWebsite) {
                    $footerParts[] = $businessWebsite;
                }
            @endphp
            {{ implode(' | ', $footerParts) }}
        </div>
        <div class="footer-text">{{ $footerText }}</div>
    </div>
</body>
</html>

