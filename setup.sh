#!/bin/bash

echo "🚀 Laravel Docker Setup"
echo "======================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Copy environment file if not exists
if [ ! -f .env ]; then
    echo "📋 Copying .env.docker to .env..."
    cp .env.docker .env
else
    echo "✅ .env file already exists"
fi

# Build and start containers
echo "🏗️  Building and starting containers..."
docker-compose up -d --build

# Wait for MySQL to be ready
echo "⏳ Waiting for MySQL to be ready..."
attempt=1
max_attempts=30

while [ $attempt -le $max_attempts ]; do
    if docker-compose exec -T mysql mysqladmin ping -h "localhost" --silent 2>/dev/null; then
        echo "✅ MySQL is ready!"
        break
    fi
    if [ $attempt -eq $max_attempts ]; then
        echo "❌ MySQL failed to start after $max_attempts attempts"
        echo "Check logs with: docker-compose logs mysql"
        exit 1
    fi
    echo "Attempt $attempt/$max_attempts: MySQL not ready yet..."
    sleep 2
    attempt=$((attempt + 1))
done

# Setup Laravel
echo "🔧 Setting up Laravel application..."

# Generate application key
echo "🔑 Generating application key..."
docker-compose exec -T app php artisan key:generate --force

# Run migrations
echo "🗄️  Running database migrations..."
docker-compose exec -T app php artisan migrate --force

# Clear caches
echo "🧹 Clearing caches..."
docker-compose exec -T app php artisan config:clear
docker-compose exec -T app php artisan cache:clear

# Start Laravel development server
echo "🌐 Starting Laravel development server..."
docker-compose exec -d app php artisan serve --host=0.0.0.0 --port=8000

echo ""
echo "✅ Setup completed successfully!"
echo ""
echo "🌐 Access your application at: http://localhost:8000"
echo "🗄️  Database: MySQL on localhost:3306 (root/root)"
echo "🔴 Redis: localhost:6379"
echo ""
echo "🔧 Useful commands:"
echo "  docker-compose logs app          # View application logs"
echo "  docker-compose exec app bash     # Access application container"
echo "  docker-compose down              # Stop all containers"
echo "  docker-compose ps                # Check container status"
