from loguru import logger
import functools
import time
import sys
import os
from typing import Callable


def configure_logger(service_name: str) -> None:
    """Configure loguru logger for a given service name.

    Parameters
    ----------
    service_name: str
        Name of the service to determine default log file.
    """
    logger.remove()

    log_file = os.getenv("LOG_FILE", f"/app/logs/{service_name}.log")
    log_level = os.getenv("LOG_LEVEL", "INFO")

    log_dir = os.path.dirname(log_file)
    os.makedirs(log_dir, exist_ok=True)

    logger.add(
        sink=sys.stderr,
        level="ERROR",
        format="<red>{time:YYYY-MM-DD HH:mm:ss.SSS}</red> | <level>{level}</level> | {module}:{line} | {message}\n{exception}",
    )

    logger.add(
        sink=sys.stdout,
        level="INFO",
        format="<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | <level>{level}</level> | <cyan>START</cyan> | {extra[process]} | {message}",
        filter=lambda record: record["extra"].get("event") == "start",
    )

    logger.add(
        sink=sys.stdout,
        level="INFO",
        format="<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | <level>{level}</level> | <cyan>END</cyan> | {extra[process]} | {message}",
        filter=lambda record: record["extra"].get("event") == "end",
    )

    logger.add(
        sink=sys.stdout,
        level="INFO",
        format="<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | <level>{level}</level> | <cyan>RESPONSE</cyan> | {extra[process]} | {message}",
        filter=lambda record: record["extra"].get("event") == "response",
    )

    logger.add(
        sink=log_file,
        level=log_level,
        format="{time:YYYY-MM-DD HH:mm:ss.SSS} | {level} | {module}:{line} | {message}\n{exception}",
        rotation="10 MB",
        retention="1 week",
        compression="zip",
    )


def log_process(func: Callable) -> Callable:
    """Decorator to log the start, end and errors of a process."""

    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        name = func.__name__
        start_time = time.time()

        logger.bind(event="start", process=name).info(f"Iniciando con args={args}, kwargs={kwargs}")

        try:
            result = func(*args, **kwargs)
            logger.bind(event="response", process=name).info(f"Resultado={result}")
            return result
        except Exception as e:
            logger.bind(process=name).error(f"Error en ejecución: {e}", exception=e)
            raise
        finally:
            elapsed = (time.time() - start_time) * 1000
            logger.bind(event="end", process=name).info(f"Finalizado en {elapsed:.2f} ms")

    return wrapper
