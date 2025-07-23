#!/usr/bin/env python3
import os
import sys

# Buscar el archivo api.py de flask_restx
def find_flask_restx_api():
    for path in sys.path:
        api_path = os.path.join(path, 'flask_restx', 'api.py')
        if os.path.exists(api_path):
            return api_path
    return None

api_file = find_flask_restx_api()

if not api_file:
    print("No se pudo encontrar el archivo flask_restx/api.py")
    sys.exit(1)

print(f"Encontrado flask_restx/api.py en: {api_file}")

# Leer el contenido del archivo
with open(api_file, 'r') as f:
    content = f.read()

# Corregir la línea problemática de werkzeug version
if 'try:' in content and 'from werkzeug.__version__ import version as werkzeug_version' in content:
    # Corregir el bloque try-except
    content = content.replace(
        'try:\nfrom werkzeug.__version__ import version as werkzeug_version\nexcept ImportError:\nimport werkzeug\nwerkzeug_version = getattr(werkzeug, "__version__", "0.0.0")',
        'try:\n    from werkzeug import __version__ as werkzeug_version\nexcept ImportError:\n    import werkzeug\n    werkzeug_version = getattr(werkzeug, "__version__", "0.0.0")'
    )
    print("Corregido bloque try-except para werkzeug_version")

# Corregir la línea problemática de BaseResponse
if 'try:' in content and 'from werkzeug.wrappers import BaseResponse' in content:
    # Corregir el bloque try-except
    content = content.replace(
        'try:\nfrom werkzeug.wrappers import BaseResponse\nexcept ImportError:\nfrom werkzeug.wrappers.response import Response as BaseResponse',
        'try:\n    from werkzeug.wrappers import BaseResponse\nexcept ImportError:\n    from werkzeug.wrappers.response import Response as BaseResponse'
    )
    print("Corregido bloque try-except para BaseResponse")

# Escribir el contenido modificado
with open(api_file, 'w') as f:
    f.write(content)

print("Archivo flask_restx/api.py corregido correctamente.")