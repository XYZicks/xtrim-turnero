FROM python:3.12-slim

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --upgrade pip

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Crear directorio para logs
RUN mkdir -p /app/logs

COPY . .

ENV PYTHONUNBUFFERED=1
ENV PORT=5000
ENV LOG_LEVEL=INFO
ENV LOG_FILE=/app/logs/turns.log

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app", "--preload", "--log-level", "info", "--access-logfile", "/app/logs/gunicorn-access.log", "--error-logfile", "/app/logs/gunicorn-error.log"]
