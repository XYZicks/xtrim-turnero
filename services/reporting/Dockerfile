FROM python:3.12-slim

WORKDIR /app

# Dependencias del sistema (si las necesitas)
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip
RUN pip install --upgrade pip

# Instalar todas las dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Crear directorio para logs
RUN mkdir -p /app/logs

# Copiar la aplicación
COPY . .

ENV PYTHONUNBUFFERED=1
ENV PORT=5002
ENV LOG_LEVEL=INFO
ENV LOG_FILE=/app/logs/reporting.log

EXPOSE 5002

CMD ["gunicorn", "--bind", "0.0.0.0:5002", "app:app", "--preload", "--log-level", "info", "--access-logfile", "/app/logs/gunicorn-access.log", "--error-logfile", "/app/logs/gunicorn-error.log"]
