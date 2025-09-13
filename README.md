# Stellabot
Proyecto Asistente virtual con inteligencia artificial para la pagina thestellaway.com

first commit

Aquí tienes un **One Page** para tu backend del proyecto del chatbot:

---

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
