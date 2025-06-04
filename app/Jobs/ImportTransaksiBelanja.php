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

    public function __construct(string $path)
    {
        $this->path = $path;
    }

    public function handle(): void
    {
        Log::info('Menjalankan ImportTransaksiBelanja', ['path' => $this->path]);
        Excel::queueImport(new TransaksiBelanjaImport, $this->path);
    }
}
