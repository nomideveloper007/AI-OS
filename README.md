## AI OS

Local control plane for agents, workflows, memory, and the AI Playground.

### Prerequisites

- Node.js 22+
- OmniRoute running locally on port **20128** (`cd OmniRoute && npm run dev`)

### Connect to OmniRoute

1. Install deps: `npm install`
2. Copy env: `cp .env.example .env.local` (already defaults to the Vite proxy)
3. Start AI-OS: `npm run dev` → http://localhost:3000
4. Open **Settings → AI Providers** and click **Test Connection**

Default wiring:

| Setting | Value |
|--------|--------|
| Base URL | `/omniroute/v1` (proxied to `http://localhost:20128/v1`) |
| Model | `auto/best-chat` |
| API Key | optional while OmniRoute `REQUIRE_API_KEY=false` |

Add at least one provider connection in the OmniRoute dashboard so auto models have something to route to.

### Notes

- Browser calls stay same-origin via the Vite `/omniroute` proxy (no CORS setup needed).
- Settings are saved to `localStorage` under `aios.omniroute.config`.
