<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>PAYMENT RECEIPT #{{ $payment->payment_number ?? $payment->id }}</title>
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
        
        // Receipt Generated date & time
        $receiptGeneratedDate = $exportedAt->format('d M Y');
        $receiptGeneratedTime = $exportedAt->format('h:i A');
        
        // Payment date
        $paymentDate = optional($payment->payment_date)->format('d M Y') ?? 'N/A';
        
        // Payment created on
        $paymentCreatedOn = optional($payment->created_at)->format('d M Y, h:i A') ?? 'N/A';

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

        $customer = $payment->customer;
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

        $order = $payment->order;
        $orderNumber = $order->order_number ?? 'N/A';
        $orderDate = optional($order->order_date)->format('d M Y') ?? 'N/A';
        $orderTotal = $order->total_amount ?? 0;
        $orderPaid = $order->paid_amount ?? 0;
        $orderDue = $order->remaining_amount ?? 0;

        $branch = $payment->branch;
        $branchName = $branch->branch_name ?? 'N/A';
        $branchCode = $branch->branch_code ?? null;

        // Payment details
        $paymentNumber = $payment->payment_number ?? 'N/A';
        $paymentType = \Illuminate\Support\Str::title($payment->payment_type ?? 'N/A');
        $paymentMethod = \Illuminate\Support\Str::title(str_replace('_', ' ', $payment->payment_method ?? 'N/A'));
        $paymentAmount = $payment->amount ?? 0;
        $paymentRemarks = $payment->remarks ?? null;
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

    <!-- Second Section: Receipt Details (left) and Customer Info (right) -->
    <table class="header-table">
        <tr>
            <td class="company-cell">
                <div class="company-name" style="font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">PAYMENT RECEIPT</div>
                <div class="company-meta" style="margin-top: 4px;">
                    <div><strong>Receipt #:</strong> {{ $paymentNumber }}</div>
                    <div><strong>Receipt Generated:</strong> {{ $receiptGeneratedDate }}, {{ $receiptGeneratedTime }}</div>
                    <div><strong>Payment Date:</strong> {{ $paymentDate }}</div>
                </div>
            </td>
            <td class="info-cell">
                <div class="company-name">{{ $customerName }}</div>
                <div class="company-meta">Code: {{ $customerCode }}</div>
                <div class="company-meta">Phone: {{ $customerPhone }}</div>
                @if($customerEmail)
                    <div class="company-meta">Email: {{ $customerEmail }}</div>
                @endif
                @if($customerAddress && $customerAddress !== '-')
                    <div class="company-meta">Address: {{ $customerAddress }}</div>
                @endif
            </td>
        </tr>
    </table>

    <!-- Payment Details -->
    <div class="section-title">Payment Information</div>
    <table class="products-table">
        <thead>
            <tr>
                <th class="text-start">Payment Details</th>
                <th class="text-end">Amount</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class="text-start">
                    <div><strong>Payment Number:</strong> {{ $paymentNumber }}</div>
                    <div><strong>Payment Type:</strong> {{ $paymentType }}</div>
                    <div><strong>Payment Method:</strong> {{ $paymentMethod }}</div>
                    <div><strong>Payment Date:</strong> {{ $paymentDate }}</div>
                    @if($paymentRemarks)
                        <div style="margin-top: 4px;"><strong>Remarks:</strong> {{ $paymentRemarks }}</div>
                    @endif
                </td>
                <td class="text-end" style="vertical-align: top;">
                    <div style="font-size: 16px; font-weight: bold; margin-top: 4px;">₹{{ number_format($paymentAmount, 2) }}</div>
                </td>
            </tr>
        </tbody>
    </table>

    <!-- Order Reference -->
    <div class="section-title">Order Reference</div>
    <table class="products-table">
        <thead>
            <tr>
                <th class="text-start">Order Number</th>
                <th class="text-center">Order Date</th>
                <th class="text-end">Order Total</th>
                <th class="text-end">Paid</th>
                <th class="text-end">Due</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class="text-start">{{ $orderNumber }}</td>
                <td class="text-center">{{ $orderDate }}</td>
                <td class="text-end">₹{{ number_format($orderTotal, 2) }}</td>
                <td class="text-end">₹{{ number_format($orderPaid, 2) }}</td>
                <td class="text-end">₹{{ number_format($orderDue, 2) }}</td>
            </tr>
        </tbody>
    </table>

    @if($order->items && $order->items->count() > 0)
    <!-- Order Items -->
    <div class="section-title">Order Items</div>
    <table class="products-table">
        <thead>
            <tr>
                <th class="text-center">#</th>
                <th class="text-start">Items</th>
                <th class="text-center">Qty</th>
                <th class="text-end">Price</th>
                <th class="text-end">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @foreach($order->items as $idx => $item)
                @php 
                    $productName = $item->package_name ?? 'N/A';
                    if($item->package_type) {
                        $productName .= ' (' . $item->package_type . ')';
                    }
                @endphp
                <tr>
                    <td class="text-center">{{ $idx + 1 }}</td>
                    <td class="text-start">{{ $productName }}</td>
                    <td class="text-center">{{ $item->quantity ?? 1 }}</td>
                    <td class="text-end">₹{{ number_format($item->unit_price ?? 0, 2) }}</td>
                    <td class="text-end">₹{{ number_format($item->total_price ?? 0, 2) }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
    @endif

    <!-- Bottom: Summary -->
    <table class="bottom-table">
        <tr>
            <td style="width:100%;vertical-align:top;">
                <div class="section-title" style="text-align:right;">PAYMENT SUMMARY</div>
                <table class="summary-table">
                    <tr>
                        <td class="label">Payment Amount:</td>
                        <td class="value">₹{{ number_format($paymentAmount, 2) }}</td>
                    </tr>
                    <tr>
                        <td class="label">Payment Type:</td>
                        <td class="value">{{ $paymentType }}</td>
                    </tr>
                    <tr>
                        <td class="label">Payment Method:</td>
                        <td class="value">{{ $paymentMethod }}</td>
                    </tr>
                    <tr class="final">
                        <td class="label">Total Amount:</td>
                        <td class="value">₹{{ number_format($paymentAmount, 2) }}</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

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

