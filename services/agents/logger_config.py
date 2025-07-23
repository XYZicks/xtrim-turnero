from loguru import logger
import functools
import time
import sys
import os
from typing import Any, Callable

# 1. Eliminar handlers por defecto
logger.remove()

# 2. Handler para errores en stderr
logger.add(
    sink=sys.stderr,
    level="ERROR",
    format="<red>{time:YYYY-MM-DD HH:mm:ss.SSS}</red> | <level>{level}</level> | {module}:{line} | {message}\n{exception}"
)

# 3-5. Handlers para eventos de proceso en stdout
logger.add(
    sink=sys.stdout,
    level="INFO",
    format="<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | <level>{level}</level> | <cyan>START</cyan> | {extra[process]} | {message}",
    filter=lambda record: record["extra"].get("event") == "start"
)

logger.add(
    sink=sys.stdout,
    level="INFO",
    format="<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | <level>{level}</level> | <cyan>END</cyan> | {extra[process]} | {message}",
    filter=lambda record: record["extra"].get("event") == "end"
)

logger.add(
    sink=sys.stdout,
    level="INFO",
    format="<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | <level>{level}</level> | <cyan>RESPONSE</cyan> | {extra[process]} | {message}",
    filter=lambda record: record["extra"].get("event") == "response"
)

# 6. Handler para archivo de log
log_file = os.getenv("LOG_FILE", "/app/logs/agents.log")
log_level = os.getenv("LOG_LEVEL", "INFO")

# Asegurar que el directorio de logs existe
log_dir = os.path.dirname(log_file)
os.makedirs(log_dir, exist_ok=True)

logger.add(
    sink=log_file,
    level=log_level,
    format="{time:YYYY-MM-DD HH:mm:ss.SSS} | {level} | {module}:{line} | {message}\n{exception}",
    rotation="10 MB",  # Rotar cuando el archivo alcance 10MB
    retention="1 week",  # Mantener logs por 1 semana
    compression="zip"  # Comprimir logs rotados
)

# 7. Decorador para logging de procesos
def log_process(func: Callable) -> Callable:
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        name = func.__name__
        start_time = time.time()
        
        # Log inicio
        logger.bind(event="start", process=name).info(f"Iniciando con args={args}, kwargs={kwargs}")
        
        try:
            # Ejecutar función
            result = func(*args, **kwargs)
            
            # Log resultado
            logger.bind(event="response", process=name).info(f"Resultado={result}")
            
            return result
        except Exception as e:
            # Log error
            logger.bind(process=name).error(f"Error en ejecución: {e}", exception=e)
            raise
        finally:
            # Log finalización
            elapsed = (time.time() - start_time) * 1000
            logger.bind(event="end", process=name).info(f"Finalizado en {elapsed:.2f} ms")
    
    return wrapper