FROM php:8.2-fpm

# Set working directory
WORKDIR /var/www

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    libfreetype6-dev \
    libjpeg62-turbo-dev \
    libicu-dev \
    zip \
    unzip \
    nodejs \
    npm \
    default-mysql-client

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Configure GD extension
RUN docker-php-ext-configure gd --with-freetype --with-jpeg

# Install PHP extensions (without Redis first)
RUN docker-php-ext-install \
    pdo_mysql \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd \
    zip \
    intl \
    opcache

# Install Redis extension using a different approach
RUN apt-get update && apt-get install -y \
    libhiredis-dev \
    && rm -rf /var/lib/apt/lists/* \
    && pecl install --configureoptions 'enable-redis-igbinary="no" enable-redis-msgpack="no" enable-redis-lzf="no" enable-redis-zstd="no"' redis \
    && docker-php-ext-enable redis

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Create system user to run Composer and Artisan Commands
RUN useradd -G www-data,root -u 1000 -d /home/laravel laravel
RUN mkdir -p /home/laravel/.composer && \
    chown -R laravel:laravel /home/laravel

# Copy composer files first for better Docker layer caching
COPY composer.json composer.lock* ./

# Set proper ownership before composer install
RUN chown -R laravel:laravel /var/www

# Switch to laravel user for composer install
USER laravel

# Install composer dependencies
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

# Switch back to root for system operations
USER root

# Copy package.json files
COPY package*.json ./

# Install ALL npm dependencies (including devDependencies for build process)
RUN npm ci

# Copy application code
COPY --chown=laravel:laravel . /var/www

# Switch to laravel user for final steps
USER laravel

# Complete composer installation
RUN composer dump-autoload --optimize

# Build assets (now tsc and vite are available)
RUN npm run build

# Switch back to root for cleanup and final permissions
USER root

# Clean up devDependencies to reduce image size
RUN npm prune --production

# Set permissions
RUN chown -R laravel:laravel /var/www && \
    chmod -R 755 /var/www/storage && \
    chmod -R 755 /var/www/bootstrap/cache

# Switch to laravel user
USER laravel

# Expose port 9000 and start php-fpm server
EXPOSE 9000
CMD ["php-fpm"]
