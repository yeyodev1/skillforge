# MongoDB Atlas por MCP

Todo se hace con las tools `mcp__mongodb-atlas__atlas-*`. Si sus esquemas no están cargados, tráelos primero con
ToolSearch (`select:mcp__mongodb-atlas__atlas-list-orgs,...`) en lugar de adivinar parámetros.

## Requisito: el MCP de Atlas configurado

Comprueba primero que las tools `mcp__mongodb-atlas__*` existan. Si no existen, el usuario debe configurarlo una vez
(tú le das los pasos; las credenciales las crea y las pega él en su terminal, no en el chat):

1. En Atlas → Organization → Access Manager → **Service Accounts** → crear una con el rol
   **Organization Project Creator** (o Owner). Copiar Client ID y Client Secret.
2. En esa misma service account, **API Access List** → agregar la IP pública de la máquina (`curl -s ifconfig.me`).
3. Registrar el MCP a nivel de usuario y reiniciar Claude Code:

   ```bash
   claude mcp add --scope user mongodb-atlas \
     -e MDB_MCP_API_CLIENT_ID=<client-id> -e MDB_MCP_API_CLIENT_SECRET=<client-secret> \
     -- npx -y mongodb-mcp-server@2.1.1
   ```

Si el usuario no quiere o no puede configurar el MCP, hay plan B: que cree el cluster a mano en cloud.mongodb.com
(cluster gratuito → Database Access: usuario y contraseña → Network Access: `0.0.0.0/0` → Connect → Drivers) y pegue
la connection string. Con eso saltas al paso 6 y armas el `DB_URI` igual.

## Pasos

1. **Organización:** `atlas-list-orgs` y toma el `orgId`.
2. **Proyecto:** `atlas-list-projects` para confirmar que no existe uno con el nombre del cliente; si no existe,
   `atlas-create-project` con el slug (`mariana-ortiz`). Un proyecto por cliente: Atlas permite un solo cluster
   gratuito por proyecto y así la facturación y los accesos quedan separados.
3. **Cluster:** `atlas-create-free-cluster` dentro del proyecto. Nombre `<cliente>-cluster`, región la más cercana
   disponible en el tier gratuito (normalmente `US_EAST_1` en AWS). Tarda unos minutos: consulta con
   `atlas-inspect-cluster` hasta que el estado sea `IDLE`.
4. **Usuario de base de datos:** `atlas-create-db-user` con usuario `<cliente>-app`, rol `readWriteAnyDatabase` y una
   contraseña generada (`openssl rand -hex 24`). Solo hexadecimal, así no hay que escapar caracteres en la URI.
5. **Access list:** `atlas-create-access-list` con `0.0.0.0/0` y comentario "Vercel serverless, sin IP fija".
   Vercel sale por IPs que cambian, así que restringir por IP rompe producción. La protección real es la contraseña
   larga del paso 4.
6. **Connection string:** `atlas-inspect-cluster` devuelve el host `mongodb+srv://...`. Arma:

   ```
   DB_URI=mongodb+srv://<usuario>:<password>@<host>/<slug-cliente>?retryWrites=true&w=majority&appName=<cliente>
   ```

   El nombre de la base va en la ruta (`/<slug-cliente>`); sin él Mongoose escribe en `test`.
7. **Escribir el `.env`** del backapp reemplazando la línea `DB_URI=` que dejó el CLI. No la pongas en `.env.example`.
8. **Verificar:** `pnpm dev` en el backapp y `curl http://localhost:8100/api/health`. También puedes usar
   `atlas-connect-cluster` + `list-databases` para confirmar desde el MCP.

## Errores conocidos

- **403 "requires access through an access list of ip ranges":** la organización exige lista de IPs para la *API de
  administración* (no confundir con la access list del cluster). Hay que agregar la IP pública actual en
  Atlas → Organization → Access Manager → service account → API Access List. Eso lo hace el usuario: avísale con la
  IP (`curl -s ifconfig.me`) y sigue con las fases que no dependen de Atlas.
- **`TypeError: Invalid URL` en todas las tools `atlas-*`:** regresión de `mongodb-mcp-server` 3.0.x. Funciona la 2.1.1.
- **Límite de clusters gratuitos:** si el proyecto ya tiene un M0, reutilízalo con otra base en vez de crear otro.
- **El usuario recién creado no autentica:** Atlas tarda hasta un minuto en propagarlo. Espera y reintenta antes de
  tocar nada.
