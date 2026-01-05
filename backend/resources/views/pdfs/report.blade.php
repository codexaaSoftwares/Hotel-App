<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Report</title>
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
        .section {
            margin-bottom: 30px;
        }
        .section-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 15px;
            border-bottom: 1px solid #000;
            padding-bottom: 5px;
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
        .text-center {
            text-align: center;
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
            <h1>{{ $reportTitle ?? 'REPORT' }}</h1>
            <p>Generated on: {{ $generatedDate ?? date('d M Y H:i:s') }}</p>
            @if(isset($reportPeriod))
            <p>Period: {{ $reportPeriod }}</p>
            @endif
        </div>

        @if(isset($sections) && count($sections) > 0)
            @foreach($sections as $section)
            <div class="section">
                <div class="section-title">{{ $section['title'] ?? 'Section' }}</div>
                @if(isset($section['content']))
                    {!! $section['content'] !!}
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
                                @foreach($row as $cell)
                                <td>{{ $cell }}</td>
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
            <p>{{ $companyName ?? 'Company Name' }} | {{ $companyAddress ?? 'Company Address' }}</p>
        </div>
    </div>
</body>
</html>

