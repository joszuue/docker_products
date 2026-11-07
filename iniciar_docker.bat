@echo off
title Iniciar Gestor de Productos con Docker
echo ===================================================
echo   Iniciando Gestor de Productos con Docker Compose
echo ===================================================
echo.

if not exist .env (
    echo [Info] Copiando .env.example a .env ...
    copy .env.example .env
)

echo [1/2] Verificando Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [Error] Docker no esta instalado o no se encuentra abierto.
    echo Asegurate de abrir Docker Desktop antes de continuar.
    echo.
    pause
    exit /b 1
)

echo [2/2] Construyendo y levantando los 3 contenedores...
docker compose up --build -d

echo.
echo ===================================================
echo   Contenedores iniciados correctamente:
echo   - Frontend: http://localhost:3000
echo   - Backend:  http://localhost:8000/api
echo ===================================================
echo.
pause

