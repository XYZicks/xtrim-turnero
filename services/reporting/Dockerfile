FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Parche para flask-restx
RUN sed -i 's/from werkzeug import __version__ as werkzeug_version/try:\\n    from werkzeug.__version__ import version as werkzeug_version\\nexcept ImportError:\\n    import werkzeug\\n    werkzeug_version = getattr(werkzeug, "__version__", "0.0.0")/g' /usr/local/lib/python3.12/site-packages/flask_restx/api.py

COPY . .

ENV PYTHONUNBUFFERED=1
ENV PORT=5002

EXPOSE 5002

CMD ["gunicorn", "--bind", "0.0.0.0:5002", "app:create_app()"]