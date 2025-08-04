<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\AsEnumCollection;

class ImportLog extends Model
{
    protected $fillable = [
        'import_id',
        'filename',
        'file_size',
        'status',
        'total_rows',
        'processed_rows',
        'failed_rows',
        'chunk_size',
        'started_at',
        'completed_at',
        'error_message',
        'metadata'
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'metadata' => 'array',
        'file_size' => 'integer',
        'total_rows' => 'integer',
        'processed_rows' => 'integer',
        'failed_rows' => 'integer',
        'chunk_size' => 'integer',
    ];

    /**
     * Update progress
     */
    public function updateProgress(int $processedRows, int $failedRows = 0): void
    {
        $this->update([
            'processed_rows' => $this->processed_rows + $processedRows,
            'failed_rows' => $this->failed_rows + $failedRows,
            'status' => $this->processed_rows >= $this->total_rows ? 'completed' : 'processing'
        ]);
    }

    /**
     * Mark as completed
     */
    public function markCompleted(): void
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now()
        ]);
    }

    /**
     * Mark as failed
     */
    public function markFailed(string $errorMessage): void
    {
        $this->update([
            'status' => 'failed',
            'error_message' => $errorMessage,
            'completed_at' => now()
        ]);
    }

    /**
     * Get progress percentage
     */
    public function getProgressPercentageAttribute(): float
    {
        if (!$this->total_rows || $this->total_rows == 0) {
            return 0;
        }

        return min(100, ($this->processed_rows / $this->total_rows) * 100);
    }

    /**
     * Get formatted file size
     */
    public function getFormattedFileSizeAttribute(): string
    {
        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB'];
        $factor = floor((strlen($bytes) - 1) / 3);

        return sprintf("%.2f %s", $bytes / pow(1024, $factor), $units[$factor]);
    }

    /**
     * Get duration
     */
    public function getDurationAttribute(): ?string
    {
        if (!$this->started_at) {
            return null;
        }

        $end = $this->completed_at ?? now();
        $diff = $this->started_at->diffInSeconds($end);

        if ($diff < 60) {
            return $diff . ' detik';
        } elseif ($diff < 3600) {
            return floor($diff / 60) . ' menit';
        } else {
            return floor($diff / 3600) . ' jam ' . floor(($diff % 3600) / 60) . ' menit';
        }
    }

    /**
     * Scope for active imports
     */
    public function scopeActive($query)
    {
        return $query->whereIn('status', ['queued', 'processing']);
    }

    /**
     * Scope for completed imports
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope for failed imports
     */
    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }
}
