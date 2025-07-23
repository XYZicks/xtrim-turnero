FROM python:3.12-slim

WORKDIR /app

# (Opcional) Dependencias de sistema para compilación de módulos nativos
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential \
    && rm -rf /var/lib/apt/lists/*

# 1. Actualiza pip
RUN pip install --upgrade pip

# 2. Instala todas las librerías de requirements.txt
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 3. Crear directorio para logs
RUN mkdir -p /app/logs

# 4. Copia el resto de la aplicación
COPY . .

ENV PYTHONUNBUFFERED=1
ENV PORT=5001
ENV LOG_LEVEL=INFO
ENV LOG_FILE=/app/logs/agents.log

EXPOSE 5001

CMD ["gunicorn", "--bind", "0.0.0.0:5001", "app:app", "--preload", "--log-level", "info", "--access-logfile", "/app/logs/gunicorn-access.log", "--error-logfile", "/app/logs/gunicorn-error.log"]
