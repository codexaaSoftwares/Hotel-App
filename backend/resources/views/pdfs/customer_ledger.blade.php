<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Customer Ledger</title>
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
            line-height: 1.6;
        }
        .container {
            max-width: 100%;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            margin-bottom: 15px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
        }
        .header-top {
            display: table;
            width: 100%;
            margin-bottom: 10px;
        }
        .business-info {
            display: table-cell;
            width: 60%;
            vertical-align: top;
        }
        .report-info {
            display: table-cell;
            width: 40%;
            vertical-align: top;
            text-align: right;
        }
        .business-info h1 {
            font-size: 18px;
            margin-bottom: 5px;
            font-weight: bold;
        }
        .business-info p {
            font-size: 10px;
            margin: 3px 0;
            line-height: 1.4;
        }
        .report-info p {
            font-size: 10px;
            margin: 3px 0;
            text-align: right;
        }
        .report-title {
            font-size: 20px;
            font-weight: bold;
            text-align: center;
            margin: 12px 0;
        }
        .report-subtitle {
            font-size: 14px;
            text-align: center;
            margin: 6px 0 12px 0;
            color: #333;
            font-style: italic;
        }
        .customer-info {
            background: #f5f5f5;
            padding: 12px 15px;
            margin-bottom: 15px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        .customer-info p {
            font-size: 11px;
            margin: 4px 0;
            line-height: 1.5;
        }
        .summary-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 11px;
        }
        .summary-table td {
            padding: 8px 12px;
            border: 1px solid #ddd;
        }
        .summary-label {
            font-weight: bold;
            width: 50%;
            background: #f5f5f5;
        }
        .summary-value {
            text-align: right;
            width: 50%;
        }
        .summary-value.positive {
            color: #28a745;
        }
        .summary-value.negative {
            color: #dc3545;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            font-size: 11px;
        }
        .table th,
        .table td {
            border: 1px solid #000;
            padding: 8px 10px;
            text-align: left;
        }
        .table th {
            background: #f5f5f5;
            font-weight: bold;
            font-size: 11px;
            text-align: center;
        }
        .table td {
            font-size: 11px;
        }
        .table td.text-right {
            text-align: right;
        }
        .table td.text-center {
            text-align: center;
        }
        .credit { color: #28a745; font-weight: bold; }
        .debit { color: #dc3545; font-weight: bold; }
        .footer {
            margin-top: 30px;
            padding-top: 15px;
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
            <div class="header-top">
                <div class="business-info">
                    <h1>{{ $businessInfo['company_name'] ?? $businessInfo['business_name'] ?? 'Company Name' }}</h1>
                    @if(isset($businessInfo['businessAddress']) && $businessInfo['businessAddress'])
                    <p>{{ $businessInfo['businessAddress'] }}</p>
                    @elseif(isset($businessInfo['business_address']) && $businessInfo['business_address'])
                    <p>{{ $businessInfo['business_address'] }}</p>
                    @endif
                    @if(isset($businessInfo['businessPhone']) && $businessInfo['businessPhone'])
                    <p><strong>Phone:</strong> {{ $businessInfo['businessPhone'] }}</p>
                    @endif
                    @if(isset($businessInfo['businessEmail']) && $businessInfo['businessEmail'])
                    <p><strong>Email:</strong> {{ $businessInfo['businessEmail'] }}</p>
                    @endif
                    @if(isset($businessInfo['gstNumber']) && $businessInfo['gstNumber'])
                    <p><strong>GST No:</strong> {{ $businessInfo['gstNumber'] }}</p>
                    @endif
                </div>
                <div class="report-info">
                    <p><strong>Report:</strong> Customer Ledger</p>
                    <p><strong>Generated:</strong> {{ $generatedDate ?? date('d M Y H:i:s') }}</p>
                </div>
            </div>
            <div class="report-title">CUSTOMER LEDGER</div>
            <div class="report-subtitle">(Restaurant)</div>
        </div>

        @if(isset($customer))
        <div class="customer-info">
            <p><strong>Customer Code:</strong> {{ $customer->customer_code ?? '—' }}</p>
            <p><strong>Customer Name:</strong> {{ $customer->name ?? '—' }}</p>
            @if($customer->address)
            <p><strong>Address:</strong> {{ $customer->address }}</p>
            @endif
            @if($customer->mobile)
            <p><strong>Mobile:</strong> {{ $customer->mobile }}</p>
            @endif
            @if($customer->email)
            <p><strong>Email:</strong> {{ $customer->email }}</p>
            @endif
        </div>
        @endif

        @if(isset($totals))
        <table class="summary-table">
            <tbody>
                <tr>
                    <td class="summary-label">Total Debit:</td>
                    <td class="summary-value">₹{{ number_format($totals['totalDebit'] ?? 0, 2) }}</td>
                </tr>
                <tr>
                    <td class="summary-label">Total Credit:</td>
                    <td class="summary-value">₹{{ number_format($totals['totalCredit'] ?? 0, 2) }}</td>
                </tr>
                <tr>
                    <td class="summary-label">Remaining Amount:</td>
                    <td class="summary-value {{ ($totals['remainingAmount'] ?? 0) >= 0 ? 'negative' : 'positive' }}">
                        ₹{{ number_format(abs($totals['remainingAmount'] ?? 0), 2) }}
                    </td>
                </tr>
            </tbody>
        </table>
        @endif

        @if(isset($transactions) && count($transactions) > 0)
        <table class="table">
            <thead>
                <tr>
                    <th style="width: 10%;">Date</th>
                    <th style="width: 15%;">Ref #</th>
                    <th style="width: 20%;">Type</th>
                    <th style="width: 25%;">Description</th>
                    <th style="width: 15%;" class="text-right">Amount</th>
                    <th style="width: 15%;" class="text-right">Balance</th>
                </tr>
            </thead>
            <tbody>
                @foreach($transactions as $transaction)
                <tr>
                    <td>{{ $transaction->transaction_date ? \Carbon\Carbon::parse($transaction->transaction_date)->format('d/m/Y') : '—' }}</td>
                    <td>{{ $transaction->reference_number ?? '—' }}</td>
                    <td class="text-center">
                        <span class="{{ $transaction->transaction_type === 'credit' ? 'credit' : 'debit' }}">
                            {{ strtoupper($transaction->transaction_type ?? '—') }}
                        </span>
                    </td>
                    <td>{{ $transaction->description ?? '—' }}</td>
                    <td class="text-right">
                        <span class="{{ $transaction->transaction_type === 'credit' ? 'credit' : 'debit' }}">
                            ₹{{ number_format($transaction->amount ?? 0, 2) }}
                        </span>
                    </td>
                    <td class="text-right">
                        <strong>₹{{ number_format($transaction->running_balance ?? 0, 2) }}</strong>
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @else
        <p>No transactions found.</p>
        @endif

        <div class="footer">
            <p>{{ $businessInfo['company_name'] ?? $businessInfo['business_name'] ?? 'Company Name' }} | {{ $businessInfo['businessAddress'] ?? $businessInfo['business_address'] ?? 'Company Address' }}</p>
            <p>This is a computer-generated report.</p>
        </div>
    </div>
</body>
</html>

