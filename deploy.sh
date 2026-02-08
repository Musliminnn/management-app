#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Laravel Docker Deployment Script ===${NC}"

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file from .env.example...${NC}"
    cp .env.example .env
    echo -e "${RED}Please edit .env file with your production settings before continuing.${NC}"
    exit 1
fi

# Stop existing containers
echo -e "${YELLOW}Stopping existing containers...${NC}"
docker compose -f docker-compose.prod.yml down

# Build and start containers
echo -e "${YELLOW}Building and starting containers...${NC}"
docker compose -f docker-compose.prod.yml up -d --build

# Wait for MySQL to be ready
echo -e "${YELLOW}Waiting for MySQL to be ready...${NC}"
sleep 15

# Run migrations and seeders
echo -e "${YELLOW}Running database migrations...${NC}"
docker compose -f docker-compose.prod.yml exec -T app php artisan migrate --force

# Generate app key if not exists
echo -e "${YELLOW}Generating application key...${NC}"
docker compose -f docker-compose.prod.yml exec -T app php artisan key:generate --force

# Clear and cache configurations
echo -e "${YELLOW}Optimizing application...${NC}"
docker compose -f docker-compose.prod.yml exec -T app php artisan config:cache
docker compose -f docker-compose.prod.yml exec -T app php artisan route:cache
docker compose -f docker-compose.prod.yml exec -T app php artisan view:cache

# Set storage permissions
echo -e "${YELLOW}Setting storage permissions...${NC}"
docker compose -f docker-compose.prod.yml exec -T app chmod -R 775 storage bootstrap/cache

# Create storage link
echo -e "${YELLOW}Creating storage link...${NC}"
docker compose -f docker-compose.prod.yml exec -T app php artisan storage:link --force

echo -e "${GREEN}=== Deployment Complete! ===${NC}"
echo -e "${GREEN}Your application is now running at http://your-server-ip${NC}"

# Show container status
echo -e "${YELLOW}Container status:${NC}"
docker compose -f docker-compose.prod.yml ps
