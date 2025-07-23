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

# Verificar si necesita parches
if 'from werkzeug import __version__ as werkzeug_version' in content:
    # Reemplazar la línea problemática
    content = content.replace(
        'from werkzeug import __version__ as werkzeug_version',
        'try:\n    from werkzeug import __version__ as werkzeug_version\nexcept ImportError:\n    import werkzeug\n    werkzeug_version = getattr(werkzeug, "__version__", "0.0.0")'
    )
    print("Parche aplicado para werkzeug_version")

if 'from werkzeug.wrappers import BaseResponse' in content:
    # Reemplazar la línea problemática de BaseResponse
    content = content.replace(
        'from werkzeug.wrappers import BaseResponse',
        'try:\n    from werkzeug.wrappers import BaseResponse\nexcept ImportError:\n    from werkzeug.wrappers.response import Response as BaseResponse'
    )
    print("Parche aplicado para BaseResponse")

# Corregir posibles errores de indentación en los bloques try-except
content = content.replace('try:\nfrom werkzeug', 'try:\n    from werkzeug')
content = content.replace('try:\n from werkzeug', 'try:\n    from werkzeug')
content = content.replace('except ImportError:\nimport werkzeug', 'except ImportError:\n    import werkzeug')
content = content.replace('except ImportError:\n import werkzeug', 'except ImportError:\n    import werkzeug')
content = content.replace('except ImportError:\nfrom werkzeug', 'except ImportError:\n    from werkzeug')
content = content.replace('except ImportError:\n from werkzeug', 'except ImportError:\n    from werkzeug')

# Escribir el contenido modificado
with open(api_file, 'w') as f:
    f.write(content)

print("Archivo flask_restx/api.py parcheado correctamente.")