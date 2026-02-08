<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laporan Realisasi Belanja</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: Arial, sans-serif;
            font-size: 10px;
            line-height: 1.4;
            color: #333;
        }

        .container {
            padding: 20px;
        }

        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #333;
            padding-bottom: 15px;
        }

        .header h1 {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .header h2 {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 10px;
        }

        .info-section {
            margin-bottom: 15px;
            background-color: #f8f9fa;
            padding: 10px;
            border: 1px solid #dee2e6;
        }

        .info-row {
            display: table;
            width: 100%;
            margin-bottom: 5px;
        }

        .info-label {
            display: table-cell;
            width: 120px;
            font-weight: bold;
        }

        .info-value {
            display: table-cell;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }

        th, td {
            border: 1px solid #333;
            padding: 6px 8px;
            text-align: left;
        }

        th {
            background-color: #4a5568;
            color: white;
            font-weight: bold;
            text-align: center;
        }

        td.text-center {
            text-align: center;
        }

        td.text-right {
            text-align: right;
        }

        tr:nth-child(even) {
            background-color: #f8f9fa;
        }

        .footer-row {
            background-color: #e2e8f0 !important;
            font-weight: bold;
        }

        .footer-row td {
            border-top: 2px solid #333;
        }

        .positive {
            color: #22863a;
        }

        .negative {
            color: #cb2431;
        }

        .summary {
            margin-top: 20px;
            page-break-inside: avoid;
        }

        .summary-table {
            width: 50%;
            margin-left: auto;
        }

        .summary-table td {
            padding: 8px;
        }

        .summary-label {
            font-weight: bold;
            background-color: #f8f9fa;
        }

        .print-date {
            text-align: right;
            font-size: 9px;
            color: #666;
            margin-top: 20px;
        }

        .page-break {
            page-break-after: always;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>DINAS KESEHATAN</h1>
            <h2>LAPORAN REALISASI BELANJA</h2>
        </div>

        @if($headerInfo)
        <div class="info-section">
            <div class="info-row">
                <span class="info-label">Program</span>
                <span class="info-value">: {{ $headerInfo['program'] }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Kegiatan</span>
                <span class="info-value">: {{ $headerInfo['kegiatan'] }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Sub Kegiatan</span>
                <span class="info-value">: {{ $headerInfo['sub_kegiatan'] }}</span>
            </div>
        </div>
        @endif

        <table>
            <thead>
                <tr>
                    <th style="width: 30px;">No</th>
                    <th style="width: 80px;">Kode Akun</th>
                    <th style="width: 150px;">Nama Akun</th>
                    <th style="width: 120px;">Nama Standar</th>
                    <th style="width: 150px;">Spesifikasi</th>
                    <th style="width: 100px;">Anggaran</th>
                    <th style="width: 100px;">Realisasi</th>
                    <th style="width: 100px;">Sisa Anggaran</th>
                </tr>
            </thead>
            <tbody>
                @forelse($reportData as $index => $row)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td class="text-center">{{ $row['kode_akun'] }}</td>
                    <td>{{ $row['nama_akun'] }}</td>
                    <td>{{ $row['nama_standar'] ?: '-' }}</td>
                    <td>{{ $row['spesifikasi'] ?: '-' }}</td>
                    <td class="text-right">Rp {{ number_format($row['anggaran'], 0, ',', '.') }}</td>
                    <td class="text-right">Rp {{ number_format($row['realisasi'], 0, ',', '.') }}</td>
                    <td class="text-right {{ $row['sisa_anggaran'] < 0 ? 'negative' : 'positive' }}">
                        Rp {{ number_format($row['sisa_anggaran'], 0, ',', '.') }}
                    </td>
                </tr>
                @empty
                <tr>
                    <td colspan="8" class="text-center">Tidak ada data</td>
                </tr>
                @endforelse
            </tbody>
            @if($totals)
            <tfoot>
                <tr class="footer-row">
                    <td colspan="5" class="text-right"><strong>TOTAL</strong></td>
                    <td class="text-right"><strong>Rp {{ number_format($totals['anggaran'], 0, ',', '.') }}</strong></td>
                    <td class="text-right"><strong>Rp {{ number_format($totals['realisasi'], 0, ',', '.') }}</strong></td>
                    <td class="text-right {{ $totals['sisa_anggaran'] < 0 ? 'negative' : 'positive' }}">
                        <strong>Rp {{ number_format($totals['sisa_anggaran'], 0, ',', '.') }}</strong>
                    </td>
                </tr>
            </tfoot>
            @endif
        </table>

        @if($totals)
        <div class="summary">
            <table class="summary-table">
                <tr>
                    <td class="summary-label">Total Anggaran</td>
                    <td class="text-right">Rp {{ number_format($totals['anggaran'], 0, ',', '.') }}</td>
                </tr>
                <tr>
                    <td class="summary-label">Total Realisasi</td>
                    <td class="text-right">Rp {{ number_format($totals['realisasi'], 0, ',', '.') }}</td>
                </tr>
                <tr>
                    <td class="summary-label">Sisa Anggaran</td>
                    <td class="text-right {{ $totals['sisa_anggaran'] < 0 ? 'negative' : 'positive' }}">
                        Rp {{ number_format($totals['sisa_anggaran'], 0, ',', '.') }}
                    </td>
                </tr>
                @if($totals['anggaran'] > 0)
                <tr>
                    <td class="summary-label">Persentase Realisasi</td>
                    <td class="text-right">
                        {{ number_format(($totals['realisasi'] / $totals['anggaran']) * 100, 2, ',', '.') }}%
                    </td>
                </tr>
                @endif
            </table>
        </div>
        @endif

        <div class="print-date">
            Dicetak pada: {{ now()->format('d F Y H:i:s') }}
        </div>
    </div>
</body>
</html>
