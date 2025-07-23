#!/usr/bin/env python3
import os
import re

# Ruta al archivo api.py de flask_restx
flask_restx_api_path = "/usr/local/lib/python3.12/site-packages/flask_restx/api.py"

# Leer el contenido del archivo
with open(flask_restx_api_path, 'r') as file:
    content = file.read()

# Reemplazar la línea problemática
old_import = "from werkzeug import __version__ as werkzeug_version"
new_import = "from werkzeug.__version__ import version as werkzeug_version"

# Verificar si werkzeug.__version__ existe, si no, usar otra alternativa
try:
    import werkzeug.__version__
    patched_content = content.replace(old_import, new_import)
except ImportError:
    # Alternativa si werkzeug.__version__ no existe
    new_import = "import werkzeug\ntry:\n    werkzeug_version = werkzeug.__version__\nexcept AttributeError:\n    from werkzeug import __version__ as werkzeug_version\nexcept ImportError:\n    werkzeug_version = '0.0.0'"
    patched_content = content.replace(old_import, new_import)

# Escribir el contenido modificado
with open(flask_restx_api_path, 'w') as file:
    file.write(patched_content)

print("Patch aplicado correctamente.")