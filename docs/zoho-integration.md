Integración de Stellabot en páginas externas (Zoho)
=================================================

Este documento explica tres formas de integrar el chatbot en una página web externa (por ejemplo, una página construida con Zoho Sites):

- Opción rápida — Snippet inline (pegar directamente en el editor HTML de Zoho)
- Opción hospedada — Script `widget.js` en modo popup o modal (iframe)
- Opción hospedada — Script `widget.js` en modo inline (panel fijo dentro de la misma página)

Requisitos previos
------------------

- Debes tener desplegado el frontend de Stellabot (Next.js) en una URL pública, por ejemplo: https://stellabot.example.com
- El backend debe estar accesible desde la web y el entorno frontend debe apuntar a su URL mediante `NEXT_PUBLIC_API_URL`.
- Asegúrate de permitir CORS en tu backend para el origen del sitio Zoho o usa la URL pública del frontend como origen. Si tu backend usa `server.js`, configura `frontendURL` o `process.env.FRONTEND_URL` apropiadamente.

Opción A — Snippet inline (rápido)
---------------------------------

Pega este fragmento HTML/JS en el editor HTML de la página Zoho donde quieres que aparezca el chat. Cambia `YOUR_FRONTEND_URL` por la URL pública donde se sirve tu frontend (ej. `https://stellabot.example.com`).

```html
<!-- Stellabot quick embed: floating button that opens the chat in a popup -->
<script>
  (function(){
    var DEPLOY_URL = 'https://YOUR_FRONTEND_URL'; // <-- cambia esto
    var WIN_OPTS = 'width=420,height=620,menubar=no,toolbar=no,location=no,status=no';

    // create button
    var btn = document.createElement('button');
    btn.innerText = 'Chat';
    btn.setAttribute('aria-label','Open Stellabot chat');
    Object.assign(btn.style, {
      position: 'fixed',
      right: '20px',
      bottom: '20px',
      zIndex: 999999,
      background: '#ca2ca3',
      color: 'white',
      border: 'none',
      borderRadius: '999px',
      width: '56px',
      height: '56px',
      boxShadow: '0 6px 18px rgba(0,0,0,0.18)',
      cursor: 'pointer',
      fontWeight: '600',
    });

    var popup;
    btn.addEventListener('click', function(){
      // If popup already open, focus it
      if (popup && !popup.closed) { popup.focus(); return; }
      popup = window.open(DEPLOY_URL, 'stellabot_chat', WIN_OPTS);
      if (!popup) { // popup blocked: fallback to redirect
        window.location.href = DEPLOY_URL;
      }
    });

    document.addEventListener('DOMContentLoaded', function(){ document.body.appendChild(btn); });
  })();
</script>
```

Notas:
- Esta opción abre el frontend como una ventana emergente (popup). Si el navegador bloquea popups, el código redirige la página al frontend.
- Es la forma más simple si no quieres tocar archivos del proyecto: pega y listo.

Opción B — Script hospedado (popup o modal iframe)
--------------------------------------------------

1. Sube `Stellabot_Frontend/embed/widget.js` (archivo incluido en este repo) a tu hosting público (por ejemplo: https://assets.example.com/stellabot/widget.js).
2. En Zoho añade esta línea en el HTML de la página:

```html
<script src="https://assets.example.com/stellabot/widget.js" data-stellabot-url="https://YOUR_FRONTEND_URL" data-mode="iframe"></script>
```

El script inyecta un botón flotante y, según el atributo `data-mode`, **abre el chat en un popup** (modo por defecto) o lo **muestra dentro de un modal iframe** (modo `iframe`). Puedes usar los atributos adicionales:

- `data-label` — Texto del botón (por defecto: `Chat`)
- `data-bg` — Color de fondo del botón (por defecto: `#ca2ca3`)
- `data-size` — Tamaño en px del botón (por defecto: `56`)
- `data-mode` — `popup` o `iframe` (por defecto: `popup`)

Ejemplo modal iframe:

```html
<script src="https://assets.example.com/stellabot/widget.js" data-stellabot-url="https://YOUR_FRONTEND_URL" data-mode="iframe" data-label="Ayuda" data-bg="#6a7445"></script>

Opción C — Script hospedado (inline: dentro de la misma página)
----------------------------------------------------------------

Si deseas que el chat se abra en la misma página (sin popup ni modal de pantalla completa), usa el modo `inline`. Este modo dibuja un panel fijo con un iframe del frontend, anclado a una esquina y con dimensiones configurables. El botón flotante actúa como toggle para mostrar/ocultar el panel.

Ejemplo básico inline:

```html
<script
  src="https://assets.example.com/stellabot/widget.js"
  data-stellabot-url="https://YOUR_FRONTEND_URL"
  data-mode="inline"
></script>
```

Atributos disponibles en modo inline:

- `data-inline-width` — Ancho del panel en px (por defecto: `420`).
- `data-inline-height` — Alto del panel en px (por defecto: `620`).
- `data-position` — Posición del panel y botón: `br` (abajo-derecha, por defecto), `bl` (abajo-izquierda), `tr` (arriba-derecha), `tl` (arriba-izquierda).
- `data-offset-x` — Separación horizontal desde el borde en px (por defecto: `20`).
- `data-offset-y` — Separación vertical desde el borde en px (por defecto: `20`).
- `data-start-open` — `true` para abrir el panel automáticamente al cargar la página (por defecto: `false`).

Ejemplo inline avanzado:

```html
<script
  src="https://assets.example.com/stellabot/widget.js"
  data-stellabot-url="https://YOUR_FRONTEND_URL"
  data-mode="inline"
  data-inline-width="480"
  data-inline-height="640"
  data-position="bl"
  data-offset-x="24"
  data-offset-y="24"
  data-start-open="true"
  data-label="Chat"
  data-bg="#ca2ca3"
  data-size="56"
></script>
```
```

Configuración de CORS y seguridad
--------------------------------

- Si el frontend y backend están desplegados en dominios distintos al de Zoho, asegúrate de añadir el dominio de Zoho (o `*` temporalmente) en la configuración de CORS del backend. En `Stellabot_Backend/server.js` hay una variable que controla el origen permitido; actualízala o usa una lista de orígenes.
- Ajusta `NEXT_PUBLIC_API_URL` en tu despliegue del frontend para que apunte al backend.
 - Para el modo inline y modal iframe, el contenido se carga en un `<iframe>` con la URL del frontend. Asegúrate de que tu sitio permita cargar esa URL (evita restricciones CSP que bloqueen iframes externos).

Siguientes pasos y ayuda
-----------------------

- Si quieres, puedo:
  - Subir y adaptar el pequeño widget para que cargue dentro de un iframe en lugar de popup.
  - Añadir instrucciones concretas para Zoho Sites (si me pasas el tipo de página Zoho que estás usando o un ejemplo de dónde pegar el código).
  - Modificar el backend para permitir dinámicamente el origen de Zoho (si me confirmas la URL de Zoho).

***

Archivos incluidos en este repo para la integración:

- `Stellabot_Frontend/embed/widget.js` — script que puedes hospedar y referenciar desde Zoho.

***
