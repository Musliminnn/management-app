<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\ImportOptimizationService;

class ImportCacheCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:cache {action : Action to perform (preload|clear|status)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Manage import cache for better performance';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $action = $this->argument('action');

        switch ($action) {
            case 'preload':
                $this->preloadCache();
                break;
            case 'clear':
                $this->clearCache();
                break;
            case 'status':
                $this->showStatus();
                break;
            default:
                $this->error('Invalid action. Use: preload, clear, or status');
                return 1;
        }

        return 0;
    }

    private function preloadCache()
    {
        $this->info('Preloading reference data cache...');

        try {
            ImportOptimizationService::preloadReferenceData();
            $this->info('✅ Cache preloaded successfully!');
        } catch (\Exception $e) {
            $this->error('❌ Failed to preload cache: ' . $e->getMessage());
        }
    }

    private function clearCache()
    {
        $this->info('Clearing import validation cache...');

        try {
            ImportOptimizationService::clearValidationCache();
            $this->info('✅ Cache cleared successfully!');
        } catch (\Exception $e) {
            $this->error('❌ Failed to clear cache: ' . $e->getMessage());
        }
    }

    private function showStatus()
    {
        $this->info('Import System Status:');
        $this->line('');

        // Queue status
        $queueStatus = ImportOptimizationService::getQueueStatus();

        $this->table(
            ['Metric', 'Value'],
            [
                ['Queue Status', $queueStatus['status']],
                ['Pending Jobs', $queueStatus['pending_jobs']],
                ['Failed Jobs', $queueStatus['failed_jobs']],
            ]
        );

        // Memory status
        $memoryUsage = memory_get_usage(true);
        $memoryLimit = ImportOptimizationService::getDynamicChunkSize();

        $this->line('');
        $this->info('Performance Metrics:');
        $this->table(
            ['Metric', 'Value'],
            [
                ['Memory Usage', $this->formatBytes($memoryUsage)],
                ['Current Chunk Size', $memoryLimit . ' rows'],
                ['Cache Status', cache()->has('ref_urusan_codes') ? '✅ Active' : '❌ Not loaded'],
            ]
        );
    }

    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision) . ' ' . $units[$i];
    }
}
