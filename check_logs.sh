#!/bin/bash

# Script para verificar los logs del servicio de reportes

echo "Verificando logs del servicio de reportes..."

# Verificar si el contenedor está en ejecución
if docker ps | grep -q reporting-service; then
    echo "El servicio de reportes está en ejecución."
    
    # Ver los últimos 50 logs del contenedor
    echo "Últimos logs del contenedor:"
    docker logs --tail 50 xtrim-turnero_reporting-service_1
    
    # Ver los logs del archivo
    echo -e "\nLogs del archivo de logs:"
    docker exec xtrim-turnero_reporting-service_1 cat /app/logs/reporting.log | tail -n 50
    
    # Ver los logs de Gunicorn
    echo -e "\nLogs de acceso de Gunicorn:"
    docker exec xtrim-turnero_reporting-service_1 cat /app/logs/gunicorn-access.log | tail -n 20
    
    echo -e "\nLogs de error de Gunicorn:"
    docker exec xtrim-turnero_reporting-service_1 cat /app/logs/gunicorn-error.log | tail -n 20
else
    echo "El servicio de reportes no está en ejecución."
fi