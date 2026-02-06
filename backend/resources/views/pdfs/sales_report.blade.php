<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Sales Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 9px;
            color: #000;
            background: #fff;
            line-height: 1.3;
        }
        .container {
            max-width: 100%;
            margin: 0 auto;
            padding: 10px;
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
            font-size: 8px;
            margin: 2px 0;
            line-height: 1.2;
        }
        .report-info p {
            font-size: 8px;
            margin: 2px 0;
            text-align: right;
        }
        .report-title {
            font-size: 16px;
            font-weight: bold;
            text-align: center;
            margin: 8px 0;
        }
        .report-subtitle {
            font-size: 12px;
            text-align: center;
            margin: 4px 0 8px 0;
            color: #333;
            font-style: italic;
        }
        .section {
            margin-bottom: 15px;
        }
        .section-title {
            font-size: 11px;
            font-weight: bold;
            margin-bottom: 8px;
            border-bottom: 1px solid #000;
            padding-bottom: 3px;
        }
        .summary-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
            font-size: 8px;
        }
        .summary-table td {
            padding: 3px 8px;
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
            margin: 10px 0;
            font-size: 7px;
        }
        .table th,
        .table td {
            border: 1px solid #000;
            padding: 3px 4px;
            text-align: left;
        }
        .table th {
            background: #f5f5f5;
            font-weight: bold;
            font-size: 7px;
            text-align: center;
        }
        .table td {
            background: #fff;
            font-size: 7px;
        }
        .table td.text-right {
            text-align: right;
        }
        .table td.text-center {
            text-align: center;
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
        .footer {
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #000;
            text-align: center;
            font-size: 8px;
            color: #666;
        }
        .compact {
            font-size: 7px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-top">
                <div class="business-info">
                    <h1>{{ $businessName ?? 'Company Name' }}</h1>
                    @if(isset($businessAddress) && $businessAddress)
                    <p>{{ $businessAddress }}</p>
                    @endif
                    @if(isset($businessPhone) && $businessPhone)
                    <p><strong>Phone:</strong> {{ $businessPhone }}</p>
                    @endif
                    @if(isset($businessEmail) && $businessEmail)
                    <p><strong>Email:</strong> {{ $businessEmail }}</p>
                    @endif
                    @if(isset($gstNumber) && $gstNumber)
                    <p><strong>GST No:</strong> {{ $gstNumber }}</p>
                    @endif
                </div>
                <div class="report-info">
                    <p><strong>Report:</strong> Sales Report</p>
                    <p><strong>Generated:</strong> {{ $generatedDate ?? date('d M Y H:i:s') }}</p>
                    @if(isset($reportPeriod))
                    <p><strong>Period:</strong> {{ $reportPeriod }}</p>
                    @endif
                </div>
            </div>
            <div class="report-title">SALES REPORT</div>
            @if(isset($reportSubtitle))
            <div class="report-subtitle">{{ $reportSubtitle }}</div>
            @else
            <div class="report-subtitle">(Restaurant)</div>
            @endif
        </div>

        @if(isset($sections) && count($sections) > 0)
            @foreach($sections as $section)
            <div class="section">
                <div class="section-title">{{ $section['title'] ?? 'Section' }}</div>
                @if(isset($section['content']))
                    {!! $section['content'] !!}
                @endif
                @if(isset($section['summaryRows']))
                    <table class="summary-table">
                        <tbody>
                            @foreach($section['summaryRows'] as $row)
                            <tr>
                                <td class="summary-label">{{ $row[0] }}:</td>
                                <td class="summary-value">{{ $row[1] }}</td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                @endif
                @if(isset($section['data']) && count($section['data']) > 0)
                    <table class="table">
                        <thead>
                            <tr>
                                @foreach($section['columns'] ?? [] as $column)
                                <th>{{ $column }}</th>
                                @endforeach
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($section['data'] as $row)
                            <tr>
                                @foreach($row as $index => $cell)
                                <td class="{{ in_array($index, $section['rightAlignColumns'] ?? []) ? 'text-right' : '' }} {{ in_array($index, $section['centerAlignColumns'] ?? []) ? 'text-center' : '' }}">{{ $cell }}</td>
                                @endforeach
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                @endif
            </div>
            @endforeach
        @else
            <div class="section">
                <p>No data available for this report.</p>
            </div>
        @endif

        <div class="footer">
            <p>{{ $businessName ?? 'Company Name' }} | {{ $businessAddress ?? 'Company Address' }}</p>
            <p>This is a computer-generated report.</p>
        </div>
    </div>
</body>
</html>

