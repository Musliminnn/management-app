# Queue Worker Setup untuk Laravel dengan Docker

## Overview

Queue worker diperlukan untuk memproses job import Excel secara background, terutama untuk `ImportTransaksiBelanja` job yang memproses file Excel berukuran besar.

## Konfigurasi Queue

### 1. Environment Configuration

Pastikan konfigurasi berikut di file `.env`:

```env
QUEUE_CONNECTION=redis
REDIS_CLIENT=phpredis
REDIS_HOST=redis
```

### 2. Docker Services

Queue worker berjalan sebagai container terpisah dengan konfigurasi:

```yaml
# docker-compose.yml
queue:
    build:
        context: .
        dockerfile: Dockerfile
    container_name: laravel_queue
    restart: unless-stopped
    working_dir: /var/www
    command: php artisan queue:work --sleep=3 --tries=3 --max-time=3600
    volumes:
        - ./:/var/www
        - ./docker/php/local.ini:/usr/local/etc/php/conf.d/local.ini
    networks:
        - laravel
    depends_on:
        - mysql
        - redis
    environment:
        - CONTAINER_ROLE=queue
```

## Cara Penggunaan

### Menggunakan Makefile Commands

#### Queue Management

```bash
# Start queue worker (interactive)
make queue-work

# Show queue worker logs
make queue-logs

# Restart queue worker
make queue-restart

# Show failed jobs
make queue-failed

# Retry all failed jobs
make queue-retry

# Clear all jobs from queue
make queue-clear
```

#### Queue Container Management

```bash
# Start queue worker container
make queue-up

# Show queue worker logs (real-time)
make queue-logs

# Restart queue worker container
make queue-restart-container

# Stop queue worker container
make queue-stop
```

### Menggunakan Docker Compose Langsung

#### Start semua services

```bash
docker-compose up -d
```

#### Monitor queue worker

```bash
docker-compose logs -f queue
```

#### Restart queue worker

```bash
docker-compose restart queue
```

## Job Import yang Didukung

### 1. ImportTransaksiBelanja

- **Lokasi**: `app/Jobs/ImportTransaksiBelanja.php`
- **Fungsi**: Import data transaksi belanja dari file Excel
- **Queue**: Default queue
- **Timeout**: 3600 seconds (1 hour)

### 2. Excel Import Jobs (Laravel Excel)

- **QueueImport**: Mengelola proses import
- **ReadChunk**: Membaca chunk data Excel
- **AfterImportJob**: Job yang dijalankan setelah import selesai

## Monitoring Queue

### 1. Real-time Logs

```bash
make queue-logs
# atau
docker-compose logs -f queue
```

### 2. Queue Status

```bash
make queue-status
# atau
docker-compose exec app php artisan queue:monitor
```

### 3. Failed Jobs

```bash
make queue-failed
# atau
docker-compose exec app php artisan queue:failed
```

## Troubleshooting

### Queue Worker Tidak Berjalan

1. Cek status container:

    ```bash
    make ps
    ```

2. Restart queue worker:

    ```bash
    make queue-restart-container
    ```

3. Cek logs untuk error:
    ```bash
    make queue-logs
    ```

### Job Gagal Diproses

1. Lihat failed jobs:

    ```bash
    make queue-failed
    ```

2. Retry failed jobs:

    ```bash
    make queue-retry
    ```

3. Clear queue jika diperlukan:
    ```bash
    make queue-clear
    ```

### Performance Issues

1. Monitor memory usage:

    ```bash
    docker stats laravel_queue
    ```

2. Adjust queue worker parameters di `docker-compose.yml`:
    - `--sleep=3`: Waktu tunggu antar job (detik)
    - `--tries=3`: Jumlah percobaan jika job gagal
    - `--max-time=3600`: Maksimal waktu eksekusi (detik)

## Best Practices

### 1. Resource Management

- Queue worker menggunakan memory yang sama dengan app container
- Monitor penggunaan memory saat import file besar
- Restart queue worker secara berkala jika diperlukan

### 2. Error Handling

- Job akan dicoba ulang 3 kali jika gagal
- Failed jobs disimpan dan dapat diretry manual
- Log error tersimpan di Laravel logs

### 3. Development vs Production

- Development: Gunakan single queue worker
- Production: Pertimbangkan multiple queue workers
- Production: Tambahkan supervisor atau monitoring tools

## Log Files

- Queue worker logs: `docker-compose logs queue`
- Laravel logs: `storage/logs/laravel.log`
- Import logs: Database table `import_logs`

## Commands Cheat Sheet

```bash
# Start all services
make up

# Check status
make ps

# View queue logs
make queue-logs

# Monitor queue
make queue-status

# Restart queue
make queue-restart-container

# Stop all services
make down
```
