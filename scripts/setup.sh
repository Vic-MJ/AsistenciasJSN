#!/bin/bash

# ASISTENCIAS_JSN - Setup Script

echo "🚀 Iniciando configuración de ASISTENCIAS_JSN..."

# 1. Install dependencies
echo "📦 Instalando dependencias..."
npm install

# 2. Check for .env file
if [ ! -f .env ]; then
    echo "📄 Creando archivo .env desde el ejemplo..."
    echo "DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=12345
DB_NAME=asistencias
DB_PORT=5432" > .env
else
    echo "✅ Archivo .env ya existe."
fi

# 3. Database setup (optional check)
echo "🗄️  Asegúrate de tener PostgreSQL corriendo y una base de datos llamada 'asistencias'."
echo "Puedes ejecutar 'psql -U postgres -f server/schema.sql' para inicializar la base de datos."

# 4. Success message
echo "✨ ¡Configuración completada con éxito!"
echo "Para iniciar el proyecto, ejecuta: npm run dev"
echo "Para iniciar el servidor por separado: npm run server"
