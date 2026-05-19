<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Rooms Report</title>
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
        .status-available { color: #28a745; font-weight: bold; }
        .status-occupied { color: #dc3545; font-weight: bold; }
        .status-reserved { color: #ffc107; font-weight: bold; }
        .status-cleaning { color: #17a2b8; font-weight: bold; }
        .status-maintenance { color: #6c757d; font-weight: bold; }
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
                    <p><strong>Report:</strong> Rooms Report</p>
                    <p><strong>Generated:</strong> {{ $generatedDate ?? date('d M Y H:i:s') }}</p>
                </div>
            </div>
            <div class="report-title">ROOMS REPORT</div>
        </div>

        @if(isset($summary))
        <table class="summary-table">
            <tbody>
                <tr>
                    <td class="summary-label">Total Rooms:</td>
                    <td class="summary-value">{{ $summary['total'] ?? 0 }}</td>
                </tr>
                <tr>
                    <td class="summary-label">Available:</td>
                    <td class="summary-value">{{ $summary['available'] ?? 0 }}</td>
                </tr>
                <tr>
                    <td class="summary-label">Occupied:</td>
                    <td class="summary-value">{{ $summary['occupied'] ?? 0 }}</td>
                </tr>
                <tr>
                    <td class="summary-label">Reserved:</td>
                    <td class="summary-value">{{ $summary['reserved'] ?? 0 }}</td>
                </tr>
                <tr>
                    <td class="summary-label">Cleaning:</td>
                    <td class="summary-value">{{ $summary['cleaning'] ?? 0 }}</td>
                </tr>
                <tr>
                    <td class="summary-label">Maintenance:</td>
                    <td class="summary-value">{{ $summary['maintenance'] ?? 0 }}</td>
                </tr>
                <tr>
                    <td class="summary-label">Active:</td>
                    <td class="summary-value">{{ $summary['active'] ?? 0 }}</td>
                </tr>
                <tr>
                    <td class="summary-label">Inactive:</td>
                    <td class="summary-value">{{ $summary['inactive'] ?? 0 }}</td>
                </tr>
            </tbody>
        </table>
        @endif

        @if(isset($rooms) && count($rooms) > 0)
        <table class="table">
            <thead>
                <tr>
                    <th style="width: 8%;">Room #</th>
                    <th style="width: 15%;">Category</th>
                    <th style="width: 6%;" class="text-center">Floor</th>
                    <th style="width: 10%;" class="text-center">Bed Type</th>
                    <th style="width: 8%;" class="text-center">Capacity</th>
                    <th style="width: 12%;" class="text-right">Price/Night</th>
                    <th style="width: 12%;" class="text-center">Status</th>
                    <th style="width: 10%;" class="text-center">Active</th>
                    <th style="width: 19%;">Created Date</th>
                </tr>
            </thead>
            <tbody>
                @foreach($rooms as $room)
                <tr>
                    <td><strong>{{ $room->room_number }}</strong></td>
                    <td>{{ $room->roomCategory->name ?? '—' }}</td>
                    <td class="text-center">{{ $room->floor_number }}</td>
                    <td class="text-center">{{ ucfirst($room->bed_type) }}</td>
                    <td class="text-center">{{ $room->max_occupancy }} {{ $room->max_occupancy == 1 ? 'Person' : 'People' }}</td>
                    <td class="text-right">
                        ₹{{ number_format($room->room_price ?? $room->roomCategory->base_price ?? 0, 2) }}
                    </td>
                    <td class="text-center">
                        <span class="status-{{ $room->status ?? 'available' }}">
                            {{ ucfirst($room->status ?? 'available') }}
                        </span>
                    </td>
                    <td class="text-center">
                        {{ $room->is_active ? 'Yes' : 'No' }}
                    </td>
                    <td>{{ $room->created_at ? \Carbon\Carbon::parse($room->created_at)->format('d/m/Y') : '—' }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @else
        <p>No rooms found.</p>
        @endif

        <div class="footer">
            <p>{{ $businessInfo['company_name'] ?? $businessInfo['business_name'] ?? 'Company Name' }} | {{ $businessInfo['businessAddress'] ?? $businessInfo['business_address'] ?? 'Company Address' }}</p>
            <p>This is a computer-generated report.</p>
        </div>
    </div>
</body>
</html>

