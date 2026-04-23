# First App API (NestJS)

API REST con autenticacion JWT y gestion de tareas por usuario.

Cada usuario solo puede crear, ver, actualizar y eliminar sus propias tareas.

**Repo hecho con fines de aprendizaje de NestJS**

## Tecnologias

- NestJS
- TypeORM
- SQLite
- Passport + JWT
- class-validator

## Requisitos

- Node.js 20+
- Yarn 1.22+

## Primeros pasos (al clonar el repo)

1. Clonar el repositorio.
2. Instalar dependencias.
3. Crear archivo .env.
4. Ejecutar la API.

Comandos (copiar y pegar):

```bash
git clone <URL_DEL_REPO>
cd first-app
yarn install
```

## Variables de entorno

Crear un archivo .env en la raiz del proyecto (copiar y pegar):

```bash
cat > .env << 'EOF'
JWT_SECRET=tu_clave_super_secreta
JWT_REFRESH_SECRET=tu_clave_super_secreta_refresh
PORT=3000
EOF
```

Notas:

- JWT_SECRET es obligatorio para firmar y validar tokens.
- JWT_REFRESH_SECRET es recomendado para refresh tokens. Si no existe, se reutiliza JWT_SECRET.
- PORT es opcional. Si no se define, se usa 3000.

## Ejecutar en desarrollo

```bash
yarn start:dev
```

Tambien puedes usar:

```bash
yarn start
```

## Flujo rapido para probar la API con Bruno

Coleccion Bruno incluida en el repo:

- bruno/first-app-api

Como usarla en Bruno:

1. Abrir Bruno.
2. Open Collection.
3. Seleccionar la carpeta bruno/first-app-api.
4. Elegir el environment Local.

Base URL:

```text
http://localhost:3000
```

Variables del environment Local en Bruno:

- baseUrl = http://localhost:3000
- token = (vacio al inicio, se llena despues del login)
- refreshToken = (vacio al inicio, se llena despues del login)
- taskId = 1

### 1) Registrar usuario

POST /auth/register

Configuracion en Bruno:

- Method: POST
- URL: {{baseUrl}}/auth/register
- Headers:
  - Content-Type: application/json
- Body (raw, JSON):

```json
{
  "email": "test1@mail.com",
  "password": "Test1234",
  "fullName": "Test User"
}
```

Respuesta esperada:

- usuario creado
- token
- refreshToken

### 2) Login

POST /auth/login

Configuracion en Bruno:

- Method: POST
- URL: {{baseUrl}}/auth/login
- Headers:
  - Content-Type: application/json
- Body (raw, JSON):

```json
{
  "email": "test1@mail.com",
  "password": "Test1234"
}
```

Guarda el token de la respuesta en la variable token.
Guarda tambien refreshToken en la variable refreshToken.

### 3) Verificar sesion

GET /auth/check-status

Configuracion en Bruno:

- Method: GET
- URL: {{baseUrl}}/auth/check-status
- Auth: Bearer Token
- Token: {{token}}

### 4) Renovar tokens con refresh token

POST /auth/refresh-token

Configuracion en Bruno:

- Method: POST
- URL: {{baseUrl}}/auth/refresh-token
- Headers:
  - Content-Type: application/json
- Body (raw, JSON):

```json
{
  "refreshToken": "{{refreshToken}}"
}
```

Guarda los nuevos valores token y refreshToken en token y refreshToken.

### 5) Probar tareas privadas

Todos estos endpoints requieren token:

- POST /tasks
- GET /tasks
- GET /tasks/:id
- PATCH /tasks/:id
- PATCH /tasks/:id/restore
- DELETE /tasks/:id

En Bruno, para todos estos requests:

- Auth: Bearer Token
- Token: {{token}}

Crear tarea:

- Method: POST
- URL: {{baseUrl}}/tasks
- Headers:
  - Content-Type: application/json
- Body (raw, JSON):

```json
{
  "title": "Aprender Nest",
  "description": "Practicar JWT y ownership",
  "status": "OPEN"
}
```

Listar tareas del usuario autenticado:

- Method: GET
- URL: {{baseUrl}}/tasks?limit=10&offset=0

Ver una tarea por id:

- Method: GET
- URL: {{baseUrl}}/tasks/{{taskId}}

Actualizar una tarea:

- Method: PATCH
- URL: {{baseUrl}}/tasks/{{taskId}}
- Headers:
  - Content-Type: application/json
- Body (raw, JSON):

```json
{
  "status": "IN_PROGRESS"
}
```

Eliminar una tarea:

- Method: DELETE
- URL: {{baseUrl}}/tasks/{{taskId}}

Restaurar una tarea eliminada (soft delete):

- Method: PATCH
- URL: {{baseUrl}}/tasks/{{taskId}}/restore

### 6) Ejecutar seed de desarrollo

El seed borra usuarios y tareas existentes, y crea datos de prueba nuevos.

Configuracion en Bruno:

- Method: POST
- URL: {{baseUrl}}/seed

Respuesta esperada:

- resumen de usuarios y tareas insertadas
- credenciales de prueba para login

## Filtros de listado de tareas

GET /tasks permite query params opcionales:

- limit (number)
- offset (number)
- status (OPEN | IN_PROGRESS | DONE)

Ejemplo:

```text
GET /tasks?limit=10&offset=0&status=OPEN
```

## Reglas de seguridad implementadas

- Endpoints de tareas protegidos con JWT.
- Cada tarea queda asociada al usuario autenticado.
- Un usuario no puede acceder ni modificar tareas de otro usuario.
- Validaciones globales activas con whitelist y forbidNonWhitelisted.

## Scripts utiles

```bash
yarn build
yarn start
yarn start:dev
yarn test
yarn test:e2e
```


## Troubleshooting

### Error: Configuration key JWT_SECRET does not exist

Verifica que exista el archivo .env con JWT_SECRET en la raiz.

### Error: listen EADDRINUSE: address already in use :::3000

El puerto 3000 ya esta en uso.

Opciones:

- cerrar el proceso que ya usa ese puerto
- cambiar PORT en el archivo .env

### Error de esquema en SQLite tras cambios de entidad

Si hiciste cambios grandes de entidades durante desarrollo local, puedes eliminar db.sqlite para recrear esquema limpio con synchronize.

