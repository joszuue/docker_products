# ==========================================
# Etapa 1: Instalación de dependencias (Composer)
# ==========================================
FROM composer:2.8.5 AS vendor

WORKDIR /app

# Copiar manifiestos y lockfile para aprovechar la caché de Docker
COPY composer.json composer.lock ./

# Instalar dependencias de producción optimizadas sin scripts de desarrollo ni --ignore-platform-reqs
RUN composer install \
    --no-dev \
    --no-interaction \
    --prefer-dist \
    --optimize-autoloader \
    --no-scripts

# ==========================================
# Etapa 2: Entorno de ejecución (Runtime)
# ==========================================
FROM php:8.3.18-fpm-alpine3.21 AS runner

# Metadatos del contenedor
LABEL maintainer="Full Stack & DevOps Team"
LABEL description="Backend Laravel para gestión de productos con Nginx y PHP-FPM supervisados"

# Extensiones de PHP requeridas por Laravel:
# - Incorporadas de forma nativa en PHP 8.3 CLI/FPM: mbstring, openssl, tokenizer, ctype, json
# - Instaladas explícitamente: pdo_mysql, xml, bcmath, opcache
RUN apk add --no-cache \
    nginx \
    supervisor \
    curl \
    libxml2 \
    tzdata \
    && apk add --no-cache --virtual .build-deps \
    libxml2-dev \
    $PHPIZE_DEPS \
    && docker-php-ext-install -j$(nproc) \
    pdo_mysql \
    xml \
    bcmath \
    opcache \
    && apk del .build-deps \
    && rm -rf /tmp/* /var/cache/apk/*

# Configuración del directorio de trabajo
WORKDIR /var/www/html

# Copiar configuraciones personalizadas de Nginx, PHP y Supervisor
COPY docker/nginx.conf /etc/nginx/http.d/default.conf
COPY docker/php.ini $PHP_INI_DIR/conf.d/99-custom.ini
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh

RUN chmod +x /usr/local/bin/entrypoint.sh

# Copiar dependencias de Composer desde la etapa 1
COPY --from=vendor /app/vendor /var/www/html/vendor

# Copiar el código fuente de la aplicación excluyendo lo indicado en .dockerignore
COPY . /var/www/html

# Crear directorios necesarios y establecer permisos estrictos de producción (sin chmod 777)
RUN mkdir -p \
    /var/www/html/storage/app/public/products \
    /var/www/html/storage/framework/cache/data \
    /var/www/html/storage/framework/sessions \
    /var/www/html/storage/framework/views \
    /var/www/html/bootstrap/cache \
    /var/log/supervisor \
    && chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Variables de entorno predeterminadas de producción
ENV APP_ENV=production
ENV APP_DEBUG=false
ENV PORT=8000

# Exponer el puerto 8000 (Nginx) hacia el exterior del contenedor
EXPOSE 8000

# Healthcheck interno para verificar que Nginx responde correctamente
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://127.0.0.1:8000/up || exit 1

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
