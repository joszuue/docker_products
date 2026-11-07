@echo off
title Iniciar Gestor de Productos (Modo Local)
echo ===================================================
echo   Iniciando Gestor de Productos (Next.js + Laravel)
echo ===================================================
echo.
echo [1/2] Levantando Backend Laravel en http://localhost:8000 ...
start "Backend Laravel (Puerto 8000)" cmd /k "cd backend && php artisan serve --port=8000"

echo [2/2] Levantando Frontend Next.js en http://localhost:3000 ...
start "Frontend Next.js (Puerto 3000)" cmd /k "cd frontend && npm start"

echo.
echo ===================================================
echo   Servidores iniciados en ventanas independientes.
echo   - Frontend: http://localhost:3000
echo   - Backend:  http://localhost:8000/api
echo ===================================================
echo.
pause

