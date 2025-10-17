Stellabot Backend — Deployment Guide
===================================

Prerequisites
-------------
- Node.js 18+
- A public hosting platform (Render, Railway, Fly.io, Heroku, or a VPS)
- Your frontend deployment URL(s)

Environment variables
---------------------
- PORT — optional, defaults to 3001 (your platform may inject this)
- FRONTEND_URL — single allowed origin for CORS (e.g. https://stellabot.example.com)
- FRONTEND_URLS — comma-separated list of allowed origins for CORS (overrides FRONTEND_URL)
- (Optional) GOOGLE_API_KEY or other AI provider keys (if required by controllers)

Run locally
-----------
1. Install dependencies:

   npm install

2. Start server:

   npm start

   The API will listen on http://localhost:3001

3. Health check:

   Visit http://localhost:3001/health

Deploy (Render example)
-----------------------
1. Create new Web Service
   - Build command: npm install
   - Start command: npm start
   - Node version: 18

2. Environment
   - Add FRONTEND_URLS with your allowed origins (comma-separated). E.g.
     https://stellabot.example.com, https://your-zoho-site.zohosites.com
   - Add PORT only if your platform requires a specific port.

3. Expose
   - The service will receive a public URL (e.g. https://stellabot-backend.onrender.com)
   - Verify GET /health responds with {status:"ok"}

CORS tips
---------
- If you see CORS errors in the browser, confirm your site origin matches exactly one of the URLs in FRONTEND_URLS (scheme and domain included).
- For temporary testing you can set FRONTEND_URLS to * (allow all). Do NOT keep this in production.

Security notes
--------------
- Do not commit secrets. Use platform environment variables for API keys.
- Prefer HTTPS for all traffic.

Routes
------
- /api/chat/... — Chat endpoints
- /health — Health check
