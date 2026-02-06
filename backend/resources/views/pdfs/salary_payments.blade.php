<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Salary Payments Report</title>
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
                    <p><strong>Report:</strong> Salary Payments Report</p>
                    <p><strong>Generated:</strong> {{ $generatedDate ?? date('d M Y H:i:s') }}</p>
                </div>
            </div>
            <div class="report-title">SALARY PAYMENTS REPORT</div>
        </div>

        @if(isset($summary))
        <table class="summary-table">
            <tbody>
                <tr>
                    <td class="summary-label">Total Records:</td>
                    <td class="summary-value">{{ $summary['total'] ?? 0 }}</td>
                </tr>
                <tr>
                    <td class="summary-label">Total Paid:</td>
                    <td class="summary-value">₹{{ number_format($summary['totalPaid'] ?? 0, 2) }}</td>
                </tr>
            </tbody>
        </table>
        @endif

        @if(isset($salaryPayments) && count($salaryPayments) > 0)
        <table class="table">
            <thead>
                <tr>
                    <th style="width: 5%;">#</th>
                    <th style="width: 20%;">Staff Name</th>
                    <th style="width: 10%;">Staff Code</th>
                    <th style="width: 12%;" class="text-center">Month</th>
                    <th style="width: 8%;" class="text-center">Year</th>
                    <th style="width: 12%;" class="text-right">Amount</th>
                    <th style="width: 13%;" class="text-center">Payment Method</th>
                    <th style="width: 10%;">Payment Date</th>
                    <th style="width: 10%;">Created By</th>
                </tr>
            </thead>
            <tbody>
                @foreach($salaryPayments as $index => $payment)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td><strong>{{ $payment->staff->name ?? '—' }}</strong></td>
                    <td>{{ $payment->staff->staff_code ?? '—' }}</td>
                    <td class="text-center">
                        @php
                            $months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                            $monthName = isset($months[$payment->month ?? 0]) ? $months[$payment->month] : '—';
                        @endphp
                        {{ $monthName }}
                    </td>
                    <td class="text-center">{{ $payment->year ?? '—' }}</td>
                    <td class="text-right"><strong>₹{{ number_format($payment->paid_amount ?? 0, 2) }}</strong></td>
                    <td class="text-center">{{ strtoupper($payment->payment_method ?? '—') }}</td>
                    <td>{{ $payment->payment_date ? \Carbon\Carbon::parse($payment->payment_date)->format('d/m/Y') : '—' }}</td>
                    <td>
                        @if($payment->creator)
                            {{ $payment->creator->name ?? $payment->creator->email ?? '—' }}
                        @else
                            —
                        @endif
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @else
        <p>No salary payments found.</p>
        @endif

        <div class="footer">
            <p>{{ $businessInfo['company_name'] ?? $businessInfo['business_name'] ?? 'Company Name' }} | {{ $businessInfo['businessAddress'] ?? $businessInfo['business_address'] ?? 'Company Address' }}</p>
            <p>This is a computer-generated report.</p>
        </div>
    </div>
</body>
</html>

