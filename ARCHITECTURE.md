# Arquitectura del Sistema Xtrim Turnero

## Resumen Ejecutivo

Xtrim Turnero es un sistema de gestión de turnos para agencias Xtrim que permite a los clientes tomar turnos, a los agentes atenderlos y a los supervisores monitorear las operaciones. El sistema está construido con una arquitectura de microservicios usando Angular para el frontend y Python/Flask para el backend.

## Diagrama C4 - Nivel 1: Contexto del Sistema

```mermaid
C4Context
    title Sistema de Gestión de Turnos Xtrim

    Person(cliente, "Cliente", "Usuario que solicita servicios en la agencia")
    Person(agente, "Agente", "Empleado que atiende a los clientes")
    Person(supervisor, "Supervisor", "Gerente que monitorea operaciones")

    System(turnero, "Xtrim Turnero", "Sistema de gestión de turnos y colas")

    System_Ext(email, "Sistema de Email", "Envío de notificaciones")
    System_Ext(sms, "Sistema SMS", "Notificaciones por mensaje")

    Rel(cliente, turnero, "Solicita turno, consulta estado")
    Rel(agente, turnero, "Atiende turnos, actualiza estado")
    Rel(supervisor, turnero, "Monitorea colas, asigna módulos")
    
    Rel(turnero, email, "Envía notificaciones")
    Rel(turnero, sms, "Envía alertas")
```

## Diagrama C4 - Nivel 2: Contenedores

```mermaid
C4Container
    title Contenedores del Sistema Xtrim Turnero

    Person(cliente, "Cliente")
    Person(agente, "Agente") 
    Person(supervisor, "Supervisor")

    Container(webapp, "Aplicación Web", "Angular 17", "SPA que proporciona interfaz de usuario")
    
    Container(turns_api, "API Turnos", "Python/Flask", "Gestiona turnos y colas")
    Container(agents_api, "API Agentes", "Python/Flask", "Gestiona agentes y módulos")
    Container(reports_api, "API Reportes", "Python/Flask", "Genera métricas y reportes")
    
    ContainerDb(db_turns, "BD Turnos", "PostgreSQL", "Almacena turnos y colas")
    ContainerDb(db_agents, "BD Agentes", "PostgreSQL", "Almacena agentes y asignaciones")
    ContainerDb(db_reports, "BD Reportes", "PostgreSQL", "Almacena métricas históricas")

    Rel(cliente, webapp, "Usa", "HTTPS")
    Rel(agente, webapp, "Usa", "HTTPS")
    Rel(supervisor, webapp, "Usa", "HTTPS")

    Rel(webapp, turns_api, "Llama", "HTTP/REST")
    Rel(webapp, agents_api, "Llama", "HTTP/REST")
    Rel(webapp, reports_api, "Llama", "HTTP/REST")

    Rel(turns_api, db_turns, "Lee/Escribe", "SQL")
    Rel(agents_api, db_agents, "Lee/Escribe", "SQL")
    Rel(reports_api, db_reports, "Lee/Escribe", "SQL")
```

## Diagrama C4 - Nivel 3: Componentes (API Turnos)

```mermaid
C4Component
    title Componentes de la API de Turnos

    Container(webapp, "Aplicación Web", "Angular")

    Container_Boundary(api, "API Turnos") {
        Component(turns_controller, "Controlador Turnos", "Flask-RESTX", "Maneja operaciones CRUD de turnos")
        Component(queue_controller, "Controlador Cola", "Flask-RESTX", "Gestiona la cola de espera")
        Component(turn_service, "Servicio Turnos", "Python", "Lógica de negocio de turnos")
        Component(queue_service, "Servicio Cola", "Python", "Lógica de cola y prioridades")
        Component(turn_model, "Modelo Turn", "SQLAlchemy", "Entidad de turno")
        Component(notification_service, "Servicio Notificaciones", "Python", "Envío de notificaciones")
    }

    ContainerDb(db, "Base de Datos", "PostgreSQL")

    Rel(webapp, turns_controller, "POST /turns, GET /turns/{id}")
    Rel(webapp, queue_controller, "GET /queue/{branch_id}")
    
    Rel(turns_controller, turn_service, "Usa")
    Rel(queue_controller, queue_service, "Usa")
    
    Rel(turn_service, turn_model, "Usa")
    Rel(queue_service, turn_model, "Usa")
    Rel(turn_service, notification_service, "Usa")
    
    Rel(turn_model, db, "SQL")
```

## Flujo del Cliente

```mermaid
sequenceDiagram
    participant C as Cliente
    participant W as Web App
    participant TA as API Turnos
    participant AA as API Agentes
    participant DB as Base Datos

    Note over C,DB: 1. Solicitud de Turno
    C->>W: Accede a /booking
    W->>C: Muestra formulario
    C->>W: Completa datos del turno
    W->>TA: POST /turns
    TA->>DB: Crea turno
    TA->>W: Retorna turno con ticket
    W->>C: Muestra ticket con QR

    Note over C,DB: 2. Consulta de Estado
    C->>W: Escanea QR o accede a /ticket/{id}
    W->>TA: GET /turns/{id}
    TA->>DB: Consulta turno
    TA->>W: Estado actual
    W->>C: Muestra estado y tiempo estimado

    Note over C,DB: 3. Atención del Turno
    Note right of AA: Agente atiende
    AA->>TA: PATCH /turns/{id} (status: attending)
    TA->>DB: Actualiza turno
    TA->>DB: Asigna módulo del agente
    
    Note over C,DB: 4. Notificación al Cliente
    C->>W: Polling automático cada 5s
    W->>TA: GET /turns/{id}
    TA->>W: Estado "attending" + módulo
    W->>C: Notifica "Diríjase al módulo X"
```

## Flujo del Agente

```mermaid
sequenceDiagram
    participant A as Agente
    participant W as Web App
    participant AA as API Agentes
    participant TA as API Turnos
    participant DB as Base Datos

    Note over A,DB: 1. Inicio de Sesión
    A->>W: Login
    W->>AA: Autenticación
    AA->>W: Token + datos agente
    W->>A: Dashboard agente

    Note over A,DB: 2. Consulta de Cola
    W->>TA: GET /queue/{branch_id}
    TA->>DB: Consulta turnos en espera
    TA->>W: Lista de turnos
    W->>A: Muestra próximo turno + módulo asignado

    Note over A,DB: 3. Atender Turno
    A->>W: Click "Atender"
    W->>TA: PATCH /turns/{id} (status: attending, agent_id)
    TA->>DB: Actualiza turno + asigna módulo
    TA->>W: Turno actualizado
    W->>A: Confirma atención

    Note over A,DB: 4. Completar/Abandonar
    A->>W: Click "Completar" o "Abandono"
    W->>TA: PATCH /turns/{id} (status: completed/abandoned)
    TA->>DB: Actualiza turno
    TA->>W: Confirmación
    W->>A: Turno finalizado
```

## Flujo del Supervisor

```mermaid
sequenceDiagram
    participant S as Supervisor
    participant W as Web App
    participant AA as API Agentes
    participant TA as API Turnos
    participant DB as Base Datos

    Note over S,DB: 1. Monitoreo de Cola
    S->>W: Accede a dashboard supervisor
    W->>TA: GET /queue/{branch_id}
    W->>AA: GET /agents
    TA->>DB: Consulta turnos
    AA->>DB: Consulta agentes
    W->>S: Dashboard con métricas y agentes

    Note over S,DB: 2. Asignación de Módulos
    S->>W: Click "Asignar módulo" en agente
    W->>S: Prompt para módulo
    S->>W: Ingresa "M01"
    W->>AA: PATCH /agent/{id}/module
    AA->>DB: Actualiza assigned_module
    AA->>W: Agente actualizado
    W->>S: Confirma asignación

    Note over S,DB: 3. Reordenamiento de Cola
    S->>W: Arrastra turno en cola
    W->>S: Confirma nuevo orden
    Note right of W: Funcionalidad futura
```

## Arquitectura Técnica

### Frontend (Angular 17)
- **Componentes**: Booking, Ticket, Agent, Supervisor, Monitor
- **Servicios**: TurnsService, AgentsService, AuthService
- **Estado**: NgRx para gestión de estado global
- **UI**: Angular Material + Tailwind CSS
- **Comunicación**: HTTP Client para APIs REST

### Backend (Microservicios Python)

#### Servicio de Turnos (Puerto 5000)
- **Framework**: Flask 2.x + Flask-RESTX
- **Base de Datos**: PostgreSQL (turnos, colas)
- **Endpoints**:
  - `POST /turns` - Crear turno
  - `GET /turns/{id}` - Consultar turno
  - `PATCH /turns/{id}` - Actualizar estado
  - `GET /queue/{branch_id}` - Obtener cola

#### Servicio de Agentes (Puerto 5001)
- **Framework**: Flask 2.x + Flask-RESTX
- **Base de Datos**: PostgreSQL (agentes, módulos)
- **Endpoints**:
  - `GET /agent` - Listar agentes
  - `POST /agent` - Crear agente
  - `PATCH /agent/{id}/status` - Cambiar estado
  - `PATCH /agent/{id}/module` - Asignar módulo

#### Servicio de Reportes (Puerto 5002)
- **Framework**: Flask 2.x + Flask-RESTX
- **Base de Datos**: PostgreSQL (métricas)
- **Funcionalidad**: Exportación CSV, métricas históricas

### Base de Datos

#### Tabla `turns`
```sql
- id (PK)
- ticket_number (UNIQUE)
- branch_id
- turn_type (normal/preferential)
- reason
- status (waiting/attending/completed/abandoned)
- customer_name, customer_cedula, customer_email
- created_at, called_at, completed_at
- agent_id
- assigned_module
```

#### Tabla `agents`
```sql
- id (PK)
- name
- email (UNIQUE)
- password
- role (AGENTE/SUPERVISOR)
- branch_id
- status (disponible/no_disponible)
- unavailability_reason
- assigned_module
- last_status_change
- created_at
```

## Patrones de Diseño Implementados

1. **Microservicios**: Separación por dominio de negocio
2. **Repository Pattern**: Abstracción de acceso a datos
3. **Service Layer**: Lógica de negocio separada
4. **Observer Pattern**: Polling para actualizaciones en tiempo real
5. **Factory Pattern**: Generación de números de ticket
6. **State Pattern**: Estados de turnos y agentes

## Consideraciones de Seguridad

- **CORS**: Configurado para permitir frontend
- **Validación**: Entrada validada en todos los endpoints
- **Logging**: Trazabilidad completa con Loguru
- **Error Handling**: Manejo centralizado de errores

## Escalabilidad y Performance

- **Containerización**: Docker para despliegue
- **Base de Datos**: Índices en campos de consulta frecuente
- **Caching**: Potencial para Redis en consultas de cola
- **Load Balancing**: Preparado para múltiples instancias

## Monitoreo y Observabilidad

- **Logs Estructurados**: JSON con Loguru
- **Health Checks**: Endpoints de salud en cada servicio
- **Métricas**: Tiempo de respuesta y contadores
- **Trazabilidad**: Request ID para seguimiento

## Próximas Mejoras

1. **WebSockets**: Actualizaciones en tiempo real
2. **Notificaciones Push**: PWA con service workers
3. **Métricas Avanzadas**: Dashboard de KPIs
4. **API Gateway**: Punto único de entrada
5. **Autenticación JWT**: Seguridad mejorada
6. **Cache Redis**: Performance optimizada
7. **CI/CD Pipeline**: Despliegue automatizado