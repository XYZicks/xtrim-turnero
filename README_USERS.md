# Usuarios de Prueba para Xtrim Turnero

Este documento contiene información sobre los usuarios de prueba para el sistema Xtrim Turnero.

## Credenciales de Acceso

### Usuario con rol AGENTE:
- **Email**: agente@xtrim.com
- **Contraseña**: agente123
- **Rol**: AGENTE
- **Acceso a**: Página de Agente

### Usuario con rol SUPERVISOR:
- **Email**: supervisor@xtrim.com
- **Contraseña**: supervisor123
- **Rol**: SUPERVISOR
- **Acceso a**: Página de Agente, Página de Supervisor, Reportes

## Cómo crear los usuarios

Para crear estos usuarios, ejecuta el script `create_users.py` una vez que los microservicios estén funcionando:

```bash
python create_users.py
```

Este script registrará los usuarios a través de la API de autenticación.

## Solución de problemas con los microservicios

Si los microservicios no inician correctamente, puede haber un problema con la configuración de flask_restx. El error común está relacionado con la forma en que se está intentando corregir la importación de werkzeug.

Para solucionar este problema, puedes editar el archivo `api.py` en el paquete flask_restx dentro de los contenedores Docker:

```python
# Cambiar esto:
try:\n    from werkzeug.__version__ import version as werkzeug_version\nexcept ImportError:\n    import werkzeug\n    werkzeug_version = getattr(werkzeug, "__version__", "0.0.0")

# Por esto:
try:
    from werkzeug.__version__ import version as werkzeug_version
except ImportError:
    import werkzeug
    werkzeug_version = getattr(werkzeug, "__version__", "0.0.0")
```

Alternativamente, puedes modificar los Dockerfiles para usar una versión específica de flask_restx que sea compatible con Python 3.12.