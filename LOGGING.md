# Logging en Xtrim Turnero

Este documento describe la implementación de logs en el sistema Xtrim Turnero.

## Configuración de Logs

El sistema utiliza [Loguru](https://github.com/Delgan/loguru) para la gestión de logs, con las siguientes características:

- **Logs en consola**: Todos los servicios muestran logs en la consola (stdout/stderr)
- **Logs en archivos**: Cada servicio guarda logs en archivos dentro del directorio `/app/logs/`
- **Rotación de logs**: Los archivos de log rotan cuando alcanzan 10MB
- **Retención**: Los logs se mantienen por 1 semana
- **Compresión**: Los logs rotados se comprimen en formato ZIP

## Estructura de Logs

Los logs tienen el siguiente formato:

- **Logs de consola (error)**: `<red>{time:YYYY-MM-DD HH:mm:ss.SSS}</red> | <level>{level}</level> | {module}:{line} | {message}\n{exception}`
- **Logs de consola (info)**: `<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | <level>{level}</level> | <cyan>{event}</cyan> | {extra[process]} | {message}`
- **Logs de archivo**: `{time:YYYY-MM-DD HH:mm:ss.SSS} | {level} | {module}:{line} | {message}\n{exception}`

## Archivos de Log

Cada servicio genera los siguientes archivos de log:

- **Servicio de Turnos**:
  - `/app/logs/turns.log` - Logs de la aplicación
  - `/app/logs/gunicorn-access.log` - Logs de acceso de Gunicorn
  - `/app/logs/gunicorn-error.log` - Logs de error de Gunicorn

- **Servicio de Agentes**:
  - `/app/logs/agents.log` - Logs de la aplicación
  - `/app/logs/gunicorn-access.log` - Logs de acceso de Gunicorn
  - `/app/logs/gunicorn-error.log` - Logs de error de Gunicorn

- **Servicio de Reportes**:
  - `/app/logs/reporting.log` - Logs de la aplicación
  - `/app/logs/gunicorn-access.log` - Logs de acceso de Gunicorn
  - `/app/logs/gunicorn-error.log` - Logs de error de Gunicorn

## Volúmenes de Docker

Los logs se almacenan en volúmenes de Docker para persistencia:

- `turns_logs`: Logs del servicio de turnos
- `agents_logs`: Logs del servicio de agentes
- `reporting_logs`: Logs del servicio de reportes

## Variables de Entorno

La configuración de logs se puede ajustar mediante variables de entorno:

- `LOG_LEVEL`: Nivel de log (DEBUG, INFO, WARNING, ERROR, CRITICAL)
- `LOG_FILE`: Ruta del archivo de log

## Verificación de Logs

Para verificar los logs, puede usar el script `check_logs.sh` incluido en el proyecto:

```bash
bash check_logs.sh
```

## Decorador de Logging

Se proporciona un decorador `@log_process` para registrar automáticamente el inicio, fin y resultado de funciones:

```python
@log_process
def mi_funcion():
    # código
    return resultado
```

Este decorador registra:
- Inicio de la función con argumentos
- Resultado de la función
- Tiempo de ejecución
- Errores (si ocurren)