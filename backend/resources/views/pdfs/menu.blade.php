<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Menu</title>
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
        .category-section {
            margin-bottom: 20px;
            page-break-inside: avoid;
        }
        .category-title {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 8px;
            background: #f5f5f5;
            padding: 8px 10px;
            border-left: 4px solid #000;
        }
        .category-description {
            font-size: 10px;
            color: #666;
            margin-bottom: 10px;
            font-style: italic;
            padding: 0 10px;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            font-size: 10px;
        }
        .items-table th,
        .items-table td {
            border: 1px solid #ddd;
            padding: 8px 10px;
            text-align: left;
        }
        .items-table th {
            background: #f5f5f5;
            font-weight: bold;
            font-size: 10px;
        }
        .items-table td {
            font-size: 10px;
        }
        .items-table td.text-right {
            text-align: right;
        }
        .items-table td.text-center {
            text-align: center;
        }
        .veg-icon {
            color: #28a745;
        }
        .non-veg-icon {
            color: #dc3545;
        }
        .popular-badge {
            background: #ffc107;
            color: #000;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 8px;
            font-weight: bold;
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
                    <p><strong>Report:</strong> Menu</p>
                    <p><strong>Generated:</strong> {{ $generatedDate ?? date('d M Y H:i:s') }}</p>
                </div>
            </div>
            <div class="report-title">MENU</div>
        </div>

        @if(isset($categories) && count($categories) > 0)
            @foreach($categories as $category)
            <div class="category-section">
                <div class="category-title">{{ $category->name }}</div>
                @if($category->description)
                <div class="category-description">{{ $category->description }}</div>
                @endif
                
                @if($category->foodItems && count($category->foodItems) > 0)
                <table class="items-table">
                    <thead>
                        <tr>
                            <th style="width: 5%;">#</th>
                            <th style="width: 40%;">Item Name</th>
                            <th style="width: 8%;" class="text-center">Type</th>
                            <th style="width: 35%;">Description</th>
                            <th style="width: 12%;" class="text-right">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($category->foodItems as $index => $item)
                        <tr>
                            <td class="text-center">{{ $index + 1 }}</td>
                            <td>
                                <strong>{{ $item->name }}</strong>
                                @if($item->is_popular)
                                <span class="popular-badge">POPULAR</span>
                                @endif
                            </td>
                            <td class="text-center">
                                @if($item->food_type === 'veg')
                                <span class="veg-icon">●</span>
                                @else
                                <span class="non-veg-icon">●</span>
                                @endif
                            </td>
                            <td>{{ $item->description ?? '—' }}</td>
                            <td class="text-right"><strong>₹{{ number_format($item->price, 2) }}</strong></td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
                @else
                <p style="font-size: 10px; color: #999; padding: 10px;">No items in this category.</p>
                @endif
            </div>
            @endforeach
        @else
            <div class="section">
                <p>No menu items available.</p>
            </div>
        @endif

        <div class="footer">
            <p>{{ $businessInfo['company_name'] ?? $businessInfo['business_name'] ?? 'Company Name' }} | {{ $businessInfo['businessAddress'] ?? $businessInfo['business_address'] ?? 'Company Address' }}</p>
            <p>This is a computer-generated menu.</p>
        </div>
    </div>
</body>
</html>

