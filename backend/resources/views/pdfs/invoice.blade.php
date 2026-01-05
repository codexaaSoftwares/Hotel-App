<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Invoice</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 12px;
            color: #000;
            background: #fff;
            line-height: 1.5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 1px solid #000;
            padding-bottom: 20px;
        }
        .header h1 {
            font-size: 24px;
            margin-bottom: 10px;
        }
        .header p {
            font-size: 11px;
            color: #333;
        }
        .info-section {
            margin-bottom: 30px;
        }
        .info-row {
            display: table;
            width: 100%;
            margin-bottom: 10px;
        }
        .info-label {
            display: table-cell;
            width: 30%;
            font-weight: bold;
        }
        .info-value {
            display: table-cell;
            width: 70%;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .table th,
        .table td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
        }
        .table th {
            background: #f5f5f5;
            font-weight: bold;
        }
        .table td {
            background: #fff;
        }
        .text-right {
            text-align: right;
        }
        .summary {
            margin-top: 20px;
            margin-left: auto;
            width: 300px;
        }
        .summary-row {
            display: table;
            width: 100%;
            margin-bottom: 8px;
        }
        .summary-label {
            display: table-cell;
            width: 60%;
            text-align: right;
            padding-right: 10px;
        }
        .summary-value {
            display: table-cell;
            width: 40%;
            text-align: right;
            font-weight: bold;
        }
        .total-row {
            border-top: 2px solid #000;
            padding-top: 10px;
            margin-top: 10px;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #000;
            text-align: center;
            font-size: 10px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>INVOICE</h1>
            <p>Invoice #{{ $invoiceNumber ?? 'INV-001' }}</p>
            <p>Date: {{ $date ?? date('d M Y') }}</p>
        </div>

        <div class="info-section">
            <div class="info-row">
                <span class="info-label">Bill To:</span>
                <span class="info-value">{{ $customerName ?? 'Customer Name' }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Address:</span>
                <span class="info-value">{{ $customerAddress ?? 'Customer Address' }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Phone:</span>
                <span class="info-value">{{ $customerPhone ?? 'Phone Number' }}</span>
            </div>
        </div>

        <table class="table">
            <thead>
                <tr>
                    <th>Item</th>
                    <th class="text-right">Quantity</th>
                    <th class="text-right">Price</th>
                    <th class="text-right">Total</th>
                </tr>
            </thead>
            <tbody>
                @if(isset($items) && count($items) > 0)
                    @foreach($items as $item)
                    <tr>
                        <td>{{ $item['name'] ?? 'Item Name' }}</td>
                        <td class="text-right">{{ $item['quantity'] ?? 1 }}</td>
                        <td class="text-right">₹{{ number_format($item['price'] ?? 0, 2) }}</td>
                        <td class="text-right">₹{{ number_format(($item['quantity'] ?? 1) * ($item['price'] ?? 0), 2) }}</td>
                    </tr>
                    @endforeach
                @else
                    <tr>
                        <td colspan="4" class="text-right">No items</td>
                    </tr>
                @endif
            </tbody>
        </table>

        <div class="summary">
            <div class="summary-row">
                <span class="summary-label">Subtotal:</span>
                <span class="summary-value">₹{{ number_format($subtotal ?? 0, 2) }}</span>
            </div>
            @if(isset($tax) && $tax > 0)
            <div class="summary-row">
                <span class="summary-label">Tax ({{ $taxRate ?? 0 }}%):</span>
                <span class="summary-value">₹{{ number_format($tax ?? 0, 2) }}</span>
            </div>
            @endif
            @if(isset($discount) && $discount > 0)
            <div class="summary-row">
                <span class="summary-label">Discount:</span>
                <span class="summary-value">-₹{{ number_format($discount ?? 0, 2) }}</span>
            </div>
            @endif
            <div class="summary-row total-row">
                <span class="summary-label">Total:</span>
                <span class="summary-value">₹{{ number_format($total ?? 0, 2) }}</span>
            </div>
        </div>

        <div class="footer">
            <p>Thank you for your business!</p>
            <p>{{ $companyName ?? 'Company Name' }} | {{ $companyAddress ?? 'Company Address' }}</p>
        </div>
    </div>
</body>
</html>

