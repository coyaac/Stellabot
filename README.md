# Stellabot
Proyecto Asistente virtual con inteligencia artificial para la pagina thestellaway.com

first commit

# 🛠️ One Page – Backend Chatbot para **The Stella Way**

## 🎯 Objetivo

Desarrollar un **backend en Node.js** que gestione la lógica de negocio de un chatbot integrado en **[www.thestellaway.com](http://www.thestellaway.com)**, con funcionalidades de atención guiada, integración con **Zoho Desk**, y captura de leads (usuarios potenciales).

---

## ⚙️ Arquitectura Técnica

* **Servidor Backend:**

  * Construido con **Node.js + Express**.
  * Maneja las rutas del chatbot, la lógica de interacción y la comunicación con servicios externos.

* **Chatbot**

  * Dos modos de interacción:

    1. **Recorridos guiados por la web** (navegación asistida).
    2. **Conversación con IA (OpenAI API)** limitada a **5 interacciones gratuitas**.

* **Gestión de Leads**

  * Tras 5 interacciones con la IA, se solicita al usuario:

    * **Correo electrónico**
    * **Teléfono**
    * **Nombre**
  * Los datos se almacenan en la **base de datos** y se envían a **Zoho Desk API** para gestión comercial.
  * Se ofrece el **Starter Pack** vía correo electrónico como incentivo.

* **Integraciones**

  * **Zoho Desk API** → Crear tickets/contactos automáticamente.
  * **OpenAI API** → Procesar preguntas abiertas del usuario.
  * **Base de Datos (MongoDB o PostgreSQL)** → Guardar leads y logs de conversación.

---

## 🔄 Flujo de Interacción del Usuario

1. Usuario abre el **chatbot en la web**.
2. Selecciona **Recorrido Guiado** o **Hablar con IA**.
3. Si elige **IA** → Puede tener hasta **5 interacciones gratuitas**.
4. Al llegar al límite → Se le pide ingresar sus datos (nombre, correo, teléfono).
5. Los datos se guardan en la **base de datos** y se envían a **Zoho Desk**.
6. El usuario recibe un **Starter Pack en su correo**.
7. El flujo continúa con atención guiada o derivación a soporte.


---

## 🗂️ Endpoints Clave (ejemplo)

* `POST /chat/ia` → Procesa preguntas vía OpenAI.
* `POST /chat/guide` → Devuelve pasos del recorrido guiado.
* `POST /user/lead` → Guarda los datos del usuario y los envía a Zoho Desk.
* `GET /starter-pack/:userId` → Envía Starter Pack al correo.

---

## 🚀 Beneficios

* Captura automática de leads desde la web.
* Interacciones personalizadas con IA y recorridos guiados.
* Integración fluida con **Zoho Desk** para gestión de clientes.
* Incentivo de conversión con envío de **Starter Pack**.

---
## Flujo real
1.Usuario inicia chat → se crea sessionId y registro ChatSession (guidedCount = 0).

2.Usuario realiza interacciones — cada opción / paso del recorrido se registra como una interacción.

3.En cada POST /chat/guided el backend incrementa guidedCount.

4.Cuando guidedCount >= 5 → backend responde aiAvailable: true y el frontend muestra botón Hablar con IA.

5.Si el usuario pulsa Hablar con IA → frontend abre modal de captura de lead (nombre, email, teléfono, consentimiento).

6.Envío POST /chat/enable-ai con datos → backend: valida, guarda lead, crea contacto/ticket en Zoho, envía Starter Pack por email, marca aiEnabled = true en ChatSession.

7.Usuario ya puede usar POST /chat/ai para conversar con OpenAI (historico del recorrido incluido como contexto opcional).

---

## 🎨 Paleta de Colores (Chatbot)
Basado en la referencia proporcionada:

| Uso | Hex | Descripción |
|-----|-----|-------------|
| Primario (gradiente inicio) | #ca2ca3 | Magenta corporativo |
| Primario (gradiente fin) | #74456a | Morado profundo |
| Acento suave fondo burbujas bot | #bbd1d9 | Azul grisáceo claro |
| Énfasis / Acento alterno | #a3ca2c | Verde lima |
| Fondo neutro claro | #d9c5bb | Beige suave |
| Fondo tono medio (panel contenedor) | #6a7445 | Verde oliva grisáceo |

Variables sugeridas (CSS):
```
:root {
  --color-primary-a: #ca2ca3;
  --color-primary-b: #74456a;
  --color-accent: #a3ca2c;
  --color-bot-bg: #bbd1d9;
  --color-user-bg: linear-gradient(135deg,#ca2ca3,#74456a);
  --color-panel-bg: #ffffff; /* o #d9c5bb con transparencia */
  --color-surface-alt: #d9c5bb;
  --color-border: #e3d9d3;
  --color-text-dark: #2b2330;
}
```

## 📗 Funcionalidades del Frontend (implementadas tras refactor)
Esta sección describe lo que ya está funcional en el código actual tras integrar la capa de API y el hook.

### Arquitectura UI
- Componente principal: `components/chatbot.tsx` (widget flotante auto-contenido).
- Abstracción de estado / lógica: `hooks/useChatSession.ts`.
- Capa de integración backend: `lib/chatApi.ts`.
- Persistencia de sesión: `localStorage` (`stellabot_session`).

### Flujo Guiado
- Al abrir el chat, se realiza automáticamente `POST /api/chat/guide` sin `nextStepId` para obtener el paso inicial (`start`).
- Cada selección de opción envía `sessionId` y `nextStepId` al backend; la respuesta agrega:
  - `text`: contenido del paso.
  - `options[]`: opciones siguientes (cada una con `text` y `nextStepId`).
  - `guidedCount`: contador acumulado en servidor.
  - `aiAvailable`: bandera calculada en el servidor (`guidedCount >= 5` o IA activada manualmente).
- El componente muestra los mensajes en orden cronológico sin sobrescribir el historial.

### Manejo de Mensajes
- Estructura interna de mensaje: `{ id, text, sender, type }`.
- Tipos posibles: `guided` (paso guiado) e `ai` (mensajes de IA simulados / futuros).
- Auto-scroll al último mensaje mediante `ref`.

### Estado y Errores
- Flags: `loading`, `error` expuestos por el hook.
- Errores de red o HTTP no exitosos generan un `<div>` con texto de error en rojo.
- No se bloquea el historial existente frente a errores (solo se evita añadir nuevos mensajes fallidos).

### Lógica IA (placeholder)
- Campo de entrada libre se habilita actualmente tras `guidedCount >= 3` (config temporal).
- Cuando se envía texto libre se llama al endpoint `POST /api/chat/ia` (si IA estuviera habilitada) — por ahora se simula respuesta si backend responde mensaje de placeholder. *Siguiente fase: requerir activación previa.*

### Estilos y Theming
- Uso de variables CSS de paleta: `--color-primary-a`, `--color-primary-b`, `--color-bot-bg`, etc.
- Gradientes aplicados mediante clases utilitarias con fallback hex si las variables no existen.
- Contenedor con fondo semitransparente y `backdrop-blur` para integración con páginas host.

### Accesibilidad (nivel inicial)
- Botón flotante con tamaño táctil adecuado (56px+).
- Colores contrastantes (magenta/morado sobre texto blanco) — se recomienda verificación adicional WCAG.
- Pendiente: roles ARIA (`role="log"`, `aria-live="polite"`) y focus trap dentro del panel cuando está abierto.

### Seguridad / Resiliencia
- SessionId generado con UUID v4 (cliente) y persistido en `localStorage`.
- Manejo de errores centralizado en `postJson` con mensajes descriptivos.
- Falta aún: reintentos exponenciales, timeout por petición, sanitización de HTML (no se acepta HTML todavía).

### Extensibilidad Planificada
- Modal Lead (captura de datos) antes de IA real.
- Botón explícito "Hablar con IA" cuando `aiAvailable` sea true.
- Integración de tracking (eventos: open, close, option_select, ai_message_send, error).
- Exportación como widget independiente (`mount/unmount`).

### Actualización Fase B (Lead + IA Gemini)
- Se añadió modal de captura de lead (nombre, email, teléfono opcional) antes de habilitar IA.
- Endpoint `POST /api/chat/enable-ai` ahora establece `aiEnabled=true` y el frontend muestra el input de IA.
- `useChatSession` gestiona `aiEnabled` además de `aiAvailable`.
- Envío de mensajes IA bloqueado si `aiEnabled` es false (aunque `aiAvailable` sea true) para asegurar captura previa.
- Backend integra llamada a la API de Gemini (`gemini-1.5-flash`) usando `GEMINI_API_KEY`; si falta la clave, responde con texto simulado.
- Historial básico (últimas ~6 entradas) se manda como contexto en el prompt para mantener continuidad.

### Limitaciones actuales
| Área | Limitación | Estado tras Fase B | Próxima mejora |
|------|------------|--------------------|----------------|
| Activación IA | Requiere formulario lead | Implementado | Añadir validación más robusta y consentimiento explícito |
| Duplicados | Bot puede repetir paso si backend envía mismo texto | Persistente | Filtrar consecutivos iguales |
| Accesibilidad | Sin aria-live / focus trap | Pendiente | Implementar roles y navegación teclado |
| Resiliencia red | Sin retries | Pendiente | Reintentos exponenciales en `postJson` |
| Internacionalización | Solo ES | Igual | Diccionario + prop idioma |
| Persistencia historial | Solo en memoria | Igual | Guardar en sessionStorage/localStorage con tamaño acotado |
| Sanitización | No aplica (texto plano) | OK | Si se añade formato/HTML aplicar sanitización |

## 🔧 Gap vs Flujo Definido (Actualizado)
| Requisito | Estado | Acción siguiente |
|-----------|--------|------------------|
| Contador guidedCount en servidor | Implementado | Añadir métrica de duración de sesión (opcional) |
| Mostrar IA tras >=5 pasos | Implementado (`aiAvailable`) | UI para botón “Hablar con IA” opcional antes de abrir modal (estético) |
| Captura lead | Implementado (modal) | Validar formato teléfono / email avanzado |
| Activar IA (`enable-ai`) | Implementado | Integrar Zoho y envío real Starter Pack |
| Conversación IA | Implementado con Gemini / fallback | Añadir límite de tokens, trimming historial inteligente |
| Persistencia sessionId | Implementado (localStorage) | Soporte “reset chat” manual |
| Paleta corporativa | Parcial (aplicada en componente) | Extraer a hoja global + dark mode |

## 📦 Próximos pasos recomendados (Frontend / Backend)
1. Zoho Desk integración real en `enableAiChat` (crear ticket/contacto) + envío Starter Pack.
2. Filtro de mensajes duplicados consecutivos en hook.
3. Reintentos y timeout configurable (AbortController) en `postJson`.
4. Registrar eventos (open, close, step_select, lead_capture, ai_message) para analytics.
5. Añadir botón “Reiniciar conversación” que borre sessionId y estado local.
6. Implementar `aria-live="polite"` y focus trap dentro del panel.
7. Mecanismo de truncado de historial (e.g. máximo 20 mensajes, sumar resumen). 
8. Exportar build tipo widget (IIFE) para incrustación en Zoho.

## 🧪 Ejemplo de llamada (actual IA)
```ts
const r = await fetch('/api/chat/ia', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ sessionId, message: '¿Cuál es el plan premium?' }) });
const data = await r.json();
```

## 🔐 Consideraciones
- Limitar longitud de `message` (p.ej. 800 caracteres) antes de enviarla a Gemini.
- Añadir rate limiting por IP y sessionId.
- Cifrar en tránsito siempre (HTTPS) al desplegar.

---

## 🧰 Cómo ejecutar el proyecto (Backend + Frontend)

### 1. Requisitos previos
- Node.js 18+ (recomendado LTS). Verifica con: `node -v`.
- npm 9+ (incluido con Node LTS).
- (Opcional) Clave de API de Google Gemini para respuestas reales de IA.

### 2. Clonar / Obtener el código
Si aún no lo tienes localmente:
```
git clone <repo-url>
cd Stellabot
```

### 3. Configurar el Backend
Ubicación: `Stellabot_Backend/`

1. Copia el archivo de ejemplo de variables de entorno:
```
cd Stellabot_Backend
copy .env.example .env   # Windows PowerShell / CMD
```
2. Edita `.env` y (opcional) añade tu clave:
```
GEMINI_API_KEY=tu_clave_gemini_aqui
PORT=3001
```
3. Instala dependencias (solo primera vez):
```
npm install
```
4. Inicia el servidor backend:
```
node server.js
```
Deberías ver: `Servidor escuchando en http://localhost:3001`.

### 4. Probar endpoints backend rápidamente (opcional)
Ejemplo (PowerShell):
```
curl -Method Post -Uri http://localhost:3001/api/chat/guide -Headers @{"Content-Type"="application/json"} -Body '{"sessionId":"test-123"}'
```
Respuesta esperada: JSON con `text`, `options`, `guidedCount`, `aiAvailable`.

### 5. Configurar el Frontend
Ubicación: `Stellabot_Frontend/`

1. En una nueva terminal (mantén backend corriendo):
```
cd ../Stellabot_Frontend
```
2. Instala dependencias:
```
npm install
```
3. Inicia el entorno de desarrollo:
```
npm run dev
```
Salida típica: `Local: http://localhost:3000`.

### 6. Flujo de verificación manual
1. Abre `http://localhost:3000` en el navegador.
2. Abre el widget de chat (botón flotante).
3. Responde 5 pasos guiados → debe aparecer opción para activar IA / formulario lead.
4. Completa formulario (nombre + email obligatorio) → se habilita input libre.
5. Envía mensaje libre → si tienes `GEMINI_API_KEY` verás respuesta generada; si no, mensaje fallback.

### 7. Estructura de scripts
Backend (actual): no tiene script `start`; se ejecuta directamente con `node server.js`.
Frontend (Next.js):
```
npm run dev     # Desarrollo con HMR
npm run build   # Construye producción (.next)
npm start       # Sirve build de producción (requiere haber ejecutado build antes)
```

### 8. Variables de entorno soportadas (Backend)
| Variable | Obligatoria | Descripción |
|----------|-------------|-------------|
| PORT | No (default 3001) | Puerto del servidor Express |
| GEMINI_API_KEY | No (recomendado) | Clave para respuestas reales de Gemini |
| ZOHO_* | Futuro | Claves para integración real con Zoho Desk |

### 9. Limpieza / Reinicio de sesión
Para forzar un nuevo flujo, borra la clave `stellabot_session` en `localStorage` desde DevTools o ejecuta en consola:
```
localStorage.removeItem('stellabot_session')
```
Luego recarga la página.

### 10. Troubleshooting rápido
| Problema | Causa probable | Solución |
|----------|----------------|----------|
| 404 en /api/chat/guide | Backend no iniciado o puerto distinto | Asegúrate de correr backend en 3001 o ajusta base URL si cambias puerto |
| CORS error en consola | Backend caído o ruta incorrecta | Verifica que `http://localhost:3001` responde y que usas `/api/chat/...` |
| IA siempre responde fallback | Falta `GEMINI_API_KEY` o clave inválida | Añade clave válida y reinicia backend |
| No aparece opción IA tras 5 pasos | Estado no reiniciado | Abrir DevTools → borrar `stellabot_session` → recargar |
| `npm run dev` falla frontend | Dependencias incompletas | Ejecuta `npm install` y valida versión Node >=18 |

### 11. Próximo paso (embedding externo)
Para incrustar solo el widget en otro sitio / Zoho, se planeará un build independiente tipo IIFE/Web Component en una fase posterior (`/widget/stellabot.js`).

---
