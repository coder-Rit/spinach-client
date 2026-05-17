# Spinach Client

React frontend for [Spinach](https://spinach.ddns.net/) — project management with an AI assistant (Spina).

**Live app:** https://spinach.ddns.net/  
**Backend repo:** https://github.com/coder-Rit/spinach-server

## Stack

- React 18 + TypeScript
- React Router
- Tailwind CSS
- Lucide icons

## Prerequisites

- Node.js 18+
- npm
- Spinach API running (see [spinach-server](https://github.com/coder-Rit/spinach-server))

## Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/coder-Rit/spinach-client.git
   cd spinach-client
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the project root:

   ```env
   REACT_APP_API_BASE_URL=http://localhost:9000
   REACT_APP_SITE_URL=https://spinach.ddns.net
   ```

   - `REACT_APP_API_BASE_URL` — backend API URL (include `/api/v1` only if your client expects it; this project uses the base host and paths like `/api/v1/...` in services).
   - `REACT_APP_SITE_URL` — public site URL for SEO (canonical, Open Graph, sitemap).

4. Start the development server:

   ```bash
   npm start
   ```

   Open http://localhost:3000

## Production build

```bash
npm run build
```

The `prebuild` step generates `sitemap.xml` and `robots.txt` from `REACT_APP_SITE_URL`.

Serve the `build/` folder with any static host (Netlify, nginx, etc.).

## Demo account

On startup the backend seeds a default user (if missing):

- **Email:** `john.doe@spinach.ddns.net`
- **Password:** `johndoe123`

Use **Continue as John Doe** on the home or login page.

## Project structure

- `src/pages/` — routes (Home, Chat, Login, projects)
- `src/components/` — UI including `SpinachLogo` (shared favicon branding)
- `src/config/site.ts` — SEO and GitHub links
- `public/` — favicon, manifest, static SEO assets

## Links

- [Live app](https://spinach.ddns.net/)
- [Frontend (this repo)](https://github.com/coder-Rit/spinach-client)
- [Backend](https://github.com/coder-Rit/spinach-server)
