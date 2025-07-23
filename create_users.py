import requests
import json

# URL base para la API de autenticación
BASE_URL = "http://localhost:5001/auth"

# Datos de los usuarios a crear
users = [
    {
        "name": "Agente Prueba",
        "email": "agente@xtrim.com",
        "password": "agente123",
        "branch_id": 1,
        "role": "AGENTE"
    },
    {
        "name": "Supervisor Prueba",
        "email": "supervisor@xtrim.com",
        "password": "supervisor123",
        "branch_id": 1,
        "role": "SUPERVISOR"
    }
]

def create_user(user_data):
    """Crea un usuario a través de la API de registro"""
    try:
        response = requests.post(f"{BASE_URL}/register", json=user_data)
        if response.status_code == 200:
            print(f"Usuario {user_data['email']} creado exitosamente")
            return response.json()
        else:
            print(f"Error al crear usuario {user_data['email']}: {response.status_code}")
            print(response.text)
            return None
    except Exception as e:
        print(f"Error de conexión: {str(e)}")
        return None

def main():
    """Función principal para crear los usuarios"""
    print("Creando usuarios para el sistema Xtrim Turnero...")
    
    for user in users:
        result = create_user(user)
        if result:
            print(f"Token JWT para {user['email']}: {result['token'][:20]}...")
            print(f"ID de usuario: {result['user']['id']}")
            print("-" * 50)
    
    print("Proceso completado.")

if __name__ == "__main__":
    main()