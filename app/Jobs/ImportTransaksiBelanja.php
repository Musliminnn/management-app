<?php

namespace App\Jobs;

use App\Imports\TransaksiBelanjaImport;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Foundation\Bus\Dispatchable;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Log;

class ImportTransaksiBelanja implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public string $path;
    public string $importId;

    public function __construct(string $path, string $importId = null)
    {
        $this->path = $path;
        $this->importId = $importId ?? uniqid('import_');
    }

    public function handle(): void
    {
        Log::info('Menjalankan ImportTransaksiBelanja', [
            'path' => $this->path,
            'import_id' => $this->importId
        ]);

        Excel::queueImport(new TransaksiBelanjaImport($this->importId), $this->path);
    }
}
