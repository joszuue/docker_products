# Dockerfile mínimo para el servicio de base de datos MySQL 8.0
# La imagen oficial de MySQL ya contiene todos los binarios y scripts de inicialización necesarios,
# por lo que no requiere una etapa de compilación propia (multi-stage no aplicable para MySQL estándar).
FROM mysql:8.0.41

# Documentación de puertos y variables
EXPOSE 3306

# Configuración de codificación de caracteres predeterminada (UTF-8mb4)
CMD ["mysqld", "--character-set-server=utf8mb4", "--collation-server=utf8mb4_unicode_ci"]

