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

### Limitaciones actuales
| Área | Limitación | Solución planeada |
|------|------------|-------------------|
| Activación IA | No existe formulario lead | Agregar modal + `enableAI()` |
| Duplicados posibles | Si backend devuelve mismo texto varias veces se repite | Filtro de mensajes consecutivos iguales |
| Accesibilidad | Falta navegación teclado completa | Añadir focus trap y aria-live |
| Resiliencia red | Sin retry/backoff | Implementar wrapper con reintentos |
| Internacionalización | Sólo español | Añadir diccionario / prop idioma |

## 🔧 Gap vs Flujo Definido
| Requisito | Estado | Acción requerida |
|-----------|--------|------------------|
| Contador de pasos guidedCount backend | Parcial (solo local count) | Consumir `POST /api/chat/guide` con sessionId persistente. |
| Disponibilidad IA al >=5 | No implementado | Mostrar botón "Hablar con IA" si respuesta incluye `aiAvailable:true`. |
| Captura de lead (modal formulario) | No implementado | Crear formulario y enviar `POST /api/chat/enable-ai`. |
| Envío mensajes IA | No implementado | Consumir `POST /api/chat/ia`. |
| Persistencia sessionId | No implementado | Guardar en `localStorage` (uuid). |
| Paleta corporativa | Parcial (usa rosa/purpura tailwind) | Sustituir por variables definidas arriba. |

## 📦 Próximos pasos recomendados (Frontend)
1. Crear servicio `lib/chatApi.ts` con funciones: `guide(nextStepId?)`, `enableAi(lead)`, `askAi(message)`.
2. Hook `useChatSession` que maneje sessionId, estado de opciones, mensajes, aiAvailable.
3. Reemplazar lógica local de opciones por respuesta de backend (`text`, `options[]`).
4. Agregar formulario modal (nombre, email, teléfono, checkbox consentimiento) y validación.
5. Implementar progresivamente un fallback offline si backend no responde.
6. Añadir analytics (conteo de abandono, duración). Opcional.
7. Adaptar estilos a tokens de color y soportar dark mode con `next-themes`.

## 🧪 Ejemplo de llamada (futuro)
```ts
const res = await fetch('/api/chat/guide', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ sessionId, nextStepId })});
```

## 🔐 Consideraciones
- Sanitizar HTML en respuestas del backend si se permite formateo.
- Limitar tamaño de mensaje usuario antes de enviar a OpenAI.
- Manejar reintentos exponenciales en fallos de red.

---
