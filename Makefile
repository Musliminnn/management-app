.PHONY: help up down build restart shell logs migrate fresh seed install test queue-work queue-restart cache-clear

# Colors for output
GREEN := \033[32m
YELLOW := \033[33m
RED := \033[31m
RESET := \033[0m

help: ## Show this help message
	@echo "$(GREEN)Laravel Docker Commands$(RESET)"
	@echo "$(YELLOW)=====================$(RESET)"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(GREEN)%-15s$(RESET) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Setup Commands
init: ## Initial setup - install dependencies and build assets
	@echo "$(GREEN)Running initial setup...$(RESET)"
	@echo "$(YELLOW)Installing composer dependencies...$(RESET)"
	docker-compose exec app composer install
	@echo "$(YELLOW)Installing npm dependencies...$(RESET)"
	docker-compose exec app npm install
	@echo "$(YELLOW)Building assets...$(RESET)"
	docker-compose exec app npm run build
	@echo "$(YELLOW)Clearing caches...$(RESET)"
	docker-compose exec app php artisan cache:clear
	@echo "$(GREEN)Setup completed!$(RESET)"

serve: ## Start Laravel development server manually
	@echo "$(GREEN)Starting Laravel development server...$(RESET)"
	docker-compose exec app php artisan serve --host=0.0.0.0 --port=8000

dev: ## Start development environment with asset watching
	@echo "$(GREEN)Starting development environment...$(RESET)"
	@echo "$(YELLOW)Building assets first...$(RESET)"
	docker-compose exec app npm run build
	@echo "$(YELLOW)Starting asset watching in background...$(RESET)"
	docker-compose exec -d app npm run dev -- --watch
	@echo "$(GREEN)Development environment ready!$(RESET)"

# Docker Management
up: ## Start all services
	@echo "$(GREEN)Starting Docker services...$(RESET)"
	docker-compose up -d

down: ## Stop all services
	@echo "$(RED)Stopping Docker services...$(RESET)"
	docker-compose down

build: ## Build Docker containers
	@echo "$(YELLOW)Building Docker containers...$(RESET)"
	docker-compose build --no-cache

restart: ## Restart all services
	@echo "$(YELLOW)Restarting Docker services...$(RESET)"
	docker-compose restart

ps: ## Show container status
	@echo "$(GREEN)Container Status:$(RESET)"
	docker-compose ps

logs: ## Show application logs
	docker-compose logs -f app

logs-all: ## Show all container logs
	docker-compose logs -f

# Laravel Commands
shell: ## Access application container
	docker-compose exec app bash

migrate: ## Run database migrations
	@echo "$(GREEN)Running migrations...$(RESET)"
	docker-compose exec app php artisan migrate

migrate-fresh: ## Fresh migration with seeding
	@echo "$(YELLOW)Fresh migration with seeding...$(RESET)"
	docker-compose exec app php artisan migrate:fresh --seed

migrate-rollback: ## Rollback migrations
	@echo "$(RED)Rolling back migrations...$(RESET)"
	docker-compose exec app php artisan migrate:rollback

seed: ## Run database seeders
	@echo "$(GREEN)Running seeders...$(RESET)"
	docker-compose exec app php artisan db:seed

install: ## Install composer dependencies
	@echo "$(GREEN)Installing composer dependencies...$(RESET)"
	docker-compose exec app composer install

install-dev: ## Install composer dependencies including dev
	@echo "$(GREEN)Installing composer dependencies with dev...$(RESET)"
	docker-compose exec app composer install --dev

update: ## Update composer dependencies
	@echo "$(YELLOW)Updating composer dependencies...$(RESET)"
	docker-compose exec app composer update

# Asset Commands
npm-install: ## Install npm dependencies
	@echo "$(GREEN)Installing npm dependencies...$(RESET)"
	docker-compose exec app npm install

npm-dev: ## Run npm dev build
	@echo "$(GREEN)Running npm dev build...$(RESET)"
	docker-compose exec app npm run dev

npm-build: ## Run npm production build
	@echo "$(GREEN)Running npm production build...$(RESET)"
	docker-compose exec app npm run build

npm-watch: ## Run npm watch
	docker-compose exec app npm run dev -- --watch

# Cache Commands
cache-clear: ## Clear all Laravel caches
	@echo "$(GREEN)Clearing caches...$(RESET)"
	docker-compose exec app php artisan cache:clear
	docker-compose exec app php artisan config:clear
	docker-compose exec app php artisan route:clear
	docker-compose exec app php artisan view:clear

cache-config: ## Cache configuration
	docker-compose exec app php artisan config:cache

cache-routes: ## Cache routes
	docker-compose exec app php artisan route:cache

cache-views: ## Cache views
	docker-compose exec app php artisan view:cache

# Queue Commands
queue-work: ## Start queue worker
	@echo "$(GREEN)Starting queue worker...$(RESET)"
	docker-compose exec app php artisan queue:work --sleep=3 --tries=3

queue-work-bg: ## Start queue worker in background
	@echo "$(GREEN)Starting queue worker in background...$(RESET)"
	docker-compose exec -d app php artisan queue:work --sleep=3 --tries=3

queue-restart: ## Restart queue workers
	@echo "$(YELLOW)Restarting queue workers...$(RESET)"
	docker-compose exec app php artisan queue:restart

queue-status: ## Show queue status
	@echo "$(BLUE)Showing queue information...$(RESET)"
	docker-compose exec app php artisan queue:failed --show-output

queue-failed: ## Show failed jobs
	docker-compose exec app php artisan queue:failed

queue-retry: ## Retry failed jobs
	docker-compose exec app php artisan queue:retry all

queue-clear: ## Clear all jobs from queue
	docker-compose exec app php artisan queue:clear

# Queue Container Management
queue-up: ## Start queue worker container
	@echo "$(GREEN)Starting queue worker container...$(RESET)"
	docker-compose up -d queue

queue-logs: ## Show queue worker logs
	@echo "$(BLUE)Showing queue worker logs...$(RESET)"
	docker-compose logs -f queue

queue-restart-container: ## Restart queue worker container
	@echo "$(YELLOW)Restarting queue worker container...$(RESET)"
	docker-compose restart queue

queue-stop: ## Stop queue worker container
	@echo "$(RED)Stopping queue worker container...$(RESET)"
	docker-compose stop queue

# Testing Commands
test: ## Run tests
	@echo "$(GREEN)Running tests...$(RESET)"
	docker-compose exec app php artisan test

test-unit: ## Run unit tests only
	docker-compose exec app php artisan test --testsuite=Unit

test-feature: ## Run feature tests only
	docker-compose exec app php artisan test --testsuite=Feature

# Artisan Commands
artisan: ## Run artisan command (usage: make artisan CMD="command")
	docker-compose exec app php artisan $(CMD)

tinker: ## Start Laravel Tinker
	docker-compose exec app php artisan tinker

key-generate: ## Generate application key
	docker-compose exec app php artisan key:generate --force

# Development Setup
setup: ## Complete setup (up, migrate, npm install, queue start)
	@echo "$(GREEN)Setting up Laravel application...$(RESET)"
	make up
	@echo "$(YELLOW)Waiting for services to start...$(RESET)"
	@sleep 10
	make key-generate
	make migrate
	make npm-install
	make npm-build
	make queue-work-bg
	@echo "$(GREEN)Setup complete! Application available at http://localhost:8000$(RESET)"

fresh-setup: ## Fresh setup with build
	@echo "$(GREEN)Fresh setup with rebuild...$(RESET)"
	make down
	make build
	make setup

# Database Commands
db-reset: ## Reset database (fresh migration + seed)
	@echo "$(YELLOW)Resetting database...$(RESET)"
	make migrate-fresh

db-backup: ## Backup database
	@echo "$(GREEN)Creating database backup...$(RESET)"
	docker-compose exec mysql mysqldump -u root -proot laravel > backup_$(shell date +%Y%m%d_%H%M%S).sql

db-shell: ## Access MySQL shell
	docker-compose exec mysql mysql -u root -proot laravel

redis-shell: ## Access Redis CLI
	docker-compose exec redis redis-cli

# Cleanup Commands
clean: ## Clean up Docker resources
	@echo "$(RED)Cleaning up Docker resources...$(RESET)"
	docker-compose down -v
	docker system prune -f

clean-all: ## Clean everything including images
	@echo "$(RED)Cleaning all Docker resources...$(RESET)"
	docker-compose down -v --remove-orphans
	docker system prune -af

# Import Commands (specific to your application)
import-test: ## Test import functionality
	@echo "$(GREEN)Testing import functionality...$(RESET)"
	docker-compose exec app php artisan tinker --execute="\\App\\Jobs\\ImportTransaksiBelanja::dispatch('test', 'test-import-id');"
