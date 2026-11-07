@echo off
title Subir proyecto a GitHub (joszuue/docker_products)
echo ========================================================
echo   Subiendo proyecto a:
echo   https://github.com/joszuue/docker_products.git
echo ========================================================
echo.
echo Ejecutando git push en tu sesion de usuario...
echo (Se abrira una ventana de tu navegador para autenticarte)
echo.

cd /d "c:\wamp64\www\productos"
git push -u origin main

echo.
if %errorlevel% equ 0 (
    echo ========================================================
    echo   EXITO: El proyecto se ha subido correctamente.
    echo   Verificalo en: https://github.com/joszuue/docker_products
    echo ========================================================
) else (
    echo ========================================================
    echo   Hubo un detalle en la autenticacion.
    echo ========================================================
)
echo.
pause
