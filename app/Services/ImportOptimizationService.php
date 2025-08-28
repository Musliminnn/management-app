<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

class ImportOptimizationService
{
    /**
     * Get dynamic chunk size based on available memory and file size
     */
    public static function getDynamicChunkSize(int $fileSize = null): int
    {
        $memoryLimit = self::getMemoryLimitInBytes();
        $availableMemory = $memoryLimit - memory_get_usage(true);

        // Base chunk size
        $baseChunkSize = 250;

        if ($fileSize) {
            // Adjust based on file size
            if ($fileSize > 50 * 1024 * 1024) { // > 50MB
                $baseChunkSize = 150;
            } elseif ($fileSize > 20 * 1024 * 1024) { // > 20MB
                $baseChunkSize = 200;
            } elseif ($fileSize < 5 * 1024 * 1024) { // < 5MB
                $baseChunkSize = 500;
            }
        }

        // Adjust based on available memory
        if ($availableMemory < 128 * 1024 * 1024) { // < 128MB
            $baseChunkSize = max(100, $baseChunkSize * 0.6);
        } elseif ($availableMemory > 512 * 1024 * 1024) { // > 512MB
            $baseChunkSize = min(1000, $baseChunkSize * 1.5);
        }

        return (int) $baseChunkSize;
    }

    /**
     * Get memory limit in bytes
     */
    private static function getMemoryLimitInBytes(): int
    {
        $memoryLimit = ini_get('memory_limit');

        if ($memoryLimit == -1) {
            return PHP_INT_MAX;
        }

        $unit = strtolower(substr($memoryLimit, -1));
        $value = (int) substr($memoryLimit, 0, -1);

        switch ($unit) {
            case 'g':
                return $value * 1024 * 1024 * 1024;
            case 'm':
                return $value * 1024 * 1024;
            case 'k':
                return $value * 1024;
            default:
                return $value;
        }
    }

    /**
     * Cache validation data for better performance
     */
    public static function cacheValidationData(string $type, array $data, int $ttl = 3600): void
    {
        $cacheKey = "validation_cache_{$type}";
        Cache::put($cacheKey, $data, $ttl);
    }

    /**
     * Get cached validation data
     */
    public static function getCachedValidationData(string $type): ?array
    {
        $cacheKey = "validation_cache_{$type}";
        return Cache::get($cacheKey);
    }

    /**
     * Preload reference data into cache
     */
    public static function preloadReferenceData(): void
    {
        $cacheTime = 3600; // 1 hour

        // Cache urusan data
        if (!Cache::has('ref_urusan_codes')) {
            $urusan = DB::table('ref_urusan')->pluck('nama', 'kode')->toArray();
            Cache::put('ref_urusan_codes', $urusan, $cacheTime);
        }

        // Cache bidang data
        if (!Cache::has('ref_bidang_codes')) {
            $bidang = DB::table('ref_bidang')->pluck('nama', 'kode')->toArray();
            Cache::put('ref_bidang_codes', $bidang, $cacheTime);
        }

        // Cache program data
        if (!Cache::has('ref_program_codes')) {
            $program = DB::table('ref_program')->pluck('nama', 'kode')->toArray();
            Cache::put('ref_program_codes', $program, $cacheTime);
        }

        // Cache kegiatan data
        if (!Cache::has('ref_kegiatan_codes')) {
            $kegiatan = DB::table('ref_kegiatan')->pluck('nama', 'kode')->toArray();
            Cache::put('ref_kegiatan_codes', $kegiatan, $cacheTime);
        }

        // Cache sub kegiatan data
        if (!Cache::has('ref_sub_kegiatan_codes')) {
            $subKegiatan = DB::table('ref_sub_kegiatan')->pluck('nama', 'kode')->toArray();
            Cache::put('ref_sub_kegiatan_codes', $subKegiatan, $cacheTime);
        }

        // Cache SKPD data
        if (!Cache::has('ref_skpd_codes')) {
            $skpd = DB::table('ref_skpd')->pluck('nama', 'kode')->toArray();
            Cache::put('ref_skpd_codes', $skpd, $cacheTime);
        }

        // Cache Unit SKPD data
        if (!Cache::has('ref_unit_skpd_codes')) {
            $unitSkpd = DB::table('ref_unit_skpd')->pluck('nama', 'kode')->toArray();
            Cache::put('ref_unit_skpd_codes', $unitSkpd, $cacheTime);
        }

        // Cache Akun data
        if (!Cache::has('ref_akun_codes')) {
            $akun = DB::table('ref_akun')->pluck('nama', 'kode')->toArray();
            Cache::put('ref_akun_codes', $akun, $cacheTime);
        }
    }

    /**
     * Clear all validation cache
     */
    public static function clearValidationCache(): void
    {
        $keys = [
            'ref_urusan_codes',
            'ref_bidang_codes',
            'ref_program_codes',
            'ref_kegiatan_codes',
            'ref_sub_kegiatan_codes',
            'ref_skpd_codes',
            'ref_unit_skpd_codes',
            'ref_akun_codes',
        ];

        foreach ($keys as $key) {
            Cache::forget($key);
        }
    }

    /**
     * Get Redis queue status
     */
    public static function getQueueStatus(): array
    {
        try {
            $redis = Redis::connection();
            $queueLength = $redis->llen('queues:default');
            $failedJobs = $redis->llen('queues:failed');

            return [
                'pending_jobs' => $queueLength,
                'failed_jobs' => $failedJobs,
                'status' => $queueLength > 0 ? 'processing' : 'idle'
            ];
        } catch (\Exception $e) {
            return [
                'pending_jobs' => 0,
                'failed_jobs' => 0,
                'status' => 'unknown',
                'error' => $e->getMessage()
            ];
        }
    }
}
