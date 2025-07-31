# Laravel Docker Setup

## Quick Start

1. **Clone repository dan masuk ke direktori project:**

    ```bash
    git clone <repository-url>
    cd management-app
    ```

2. **Jalankan setup script:**

    ```bash
    ./setup.sh
    ```

3. **Akses aplikasi:**
    - Laravel App: http://localhost:8000
    - phpMyAdmin: http://localhost:8080

## Manual Setup

Jika ingin setup manual, ikuti langkah berikut:

1. **Copy file environment:**

    ```bash
    cp .env.docker .env
    ```

2. **Build dan jalankan containers:**

    ```bash
    docker-compose up -d --build
    ```

3. **Install dependencies dan setup aplikasi:**

    ```bash
    # Install Composer dependencies
    docker-compose exec app composer install

    # Generate application key
    docker-compose exec app php artisan key:generate

    # Run migrations
    docker-compose exec app php artisan migrate

    # Seed database (opsional)
    docker-compose exec app php artisan db:seed
    ```

## Services yang Tersedia

- **Laravel App** (Port: Internal)
- **Nginx** (Port: 8000)
- **MySQL 8.0** (Port: 3306)
- **Redis** (Port: 6379)
- **phpMyAdmin** (Port: 8080)

## Perintah yang Berguna

```bash
# Melihat logs
docker-compose logs -f app

# Masuk ke container aplikasi
docker-compose exec app bash

# Menjalankan Artisan commands
docker-compose exec app php artisan [command]

# Restart services
docker-compose restart

# Stop semua containers
docker-compose down

# Stop dan hapus volumes
docker-compose down -v

# Rebuild containers
docker-compose up -d --build --force-recreate
```

## Troubleshooting

### Permission Issues

```bash
# Fix permissions
sudo chown -R $USER:$USER .
sudo chmod -R 755 storage bootstrap/cache
```

### Database Connection Issues

Pastikan konfigurasi database di `.env` sesuai:

```
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=laravel
DB_USERNAME=root
DB_PASSWORD=root
```

### Cache Issues

```bash
# Clear all caches
docker-compose exec app php artisan config:clear
docker-compose exec app php artisan cache:clear
docker-compose exec app php artisan route:clear
docker-compose exec app php artisan view:clear
```

## Development Workflow

1. **Membuat migration baru:**

    ```bash
    docker-compose exec app php artisan make:migration create_table_name
    docker-compose exec app php artisan migrate
    ```

2. **Install package baru:**

    ```bash
    docker-compose exec app composer require package/name
    ```

3. **Install npm packages:**
    ```bash
    docker-compose exec app npm install package-name
    docker-compose exec app npm run build
    ```

## Environment Configuration

File `.env.docker` sudah dikonfigurasi untuk Docker environment. Jika perlu modifikasi:

- Database: Service `mysql`
- Redis: Service `redis`
- App URL: `http://localhost:8000`

## Production Notes

Untuk production, pertimbangkan:

- Gunakan `APP_ENV=production`
- Set `APP_DEBUG=false`
- Konfigurasi SSL/HTTPS
- Gunakan Redis untuk session dan cache
- Setup backup database otomatis
- Monitoring dan logging
