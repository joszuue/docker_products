#!/bin/sh
set -e

# Asegurar directorios de almacenamiento y permisos
mkdir -p /var/www/html/storage/app/public/products
mkdir -p /var/www/html/storage/framework/cache/data
mkdir -p /var/www/html/storage/framework/sessions
mkdir -p /var/www/html/storage/framework/views
mkdir -p /var/www/html/bootstrap/cache

chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Enlace simbólico de storage público si no existe
if [ ! -L /var/www/html/public/storage ]; then
    echo "[Entrypoint] Creando enlace simbolico de storage..."
    php artisan storage:link --force || true
fi

# Esperar opcionalmente a la base de datos y ejecutar migraciones de forma controlada y no destructiva
if [ "$AUTO_MIGRATE" = "true" ]; then
    echo "[Entrypoint] Ejecutando migraciones de forma no destructiva..."
    php artisan migrate --force || echo "[Entrypoint] Advertencia: Las migraciones no pudieron ejecutarse en este momento."
fi

# Cachés de producción únicamente si APP_KEY está definida y no vacía
if [ -n "$APP_KEY" ] && [ "$APP_ENV" = "production" ]; then
    echo "[Entrypoint] Optimizando rutas y configuracion para produccion..."
    php artisan config:cache || true
    php artisan route:cache || true
    php artisan view:cache || true
fi

echo "[Entrypoint] Iniciando supervisor (Nginx + PHP-FPM)..."
exec "$@"

