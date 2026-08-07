# fragments-ui

React + Vite frontend for the [Fragments](https://github.com/lamritha/fragments) microservice. Authenticated users sign in with Amazon Cognito and interact with the Fragments API to create, view, update, delete, and convert text and image fragments.

---

## Prerequisites

- Node.js 20+
- npm
- Git
- Docker (for containerized builds)
- A running [Fragments API](https://github.com/lamritha/fragments) server configured with the same Amazon Cognito User Pool
- An Amazon Cognito app client with OAuth callback and sign-out URLs configured for this app

---

## Features

- Sign in and sign out via Amazon Cognito Hosted UI (OIDC Authorization Code flow)
- Display the authenticated user's Cognito username
- List the user's existing fragments with full metadata (ID, type, size, created date) from `GET /v1/fragments?expand=1`
- Create new fragments via `POST /v1/fragments` with a content-type dropdown supporting:

  **Text / structured**
  - `text/plain`
  - `text/markdown`
  - `text/html`
  - `text/csv`
  - `application/json`

  **Images** (file upload)
  - `image/png`
  - `image/jpeg`
  - `image/webp`
  - `image/avif`
  - `image/gif`

- View fragment data inline (text in a `<pre>` block; images rendered from a blob URL)
- Update non-image fragments via `PUT /v1/fragments/:id` (Content-Type must match the original)
- Delete fragments via `DELETE /v1/fragments/:id` (with confirmation)
- Convert a viewed fragment to another format via `GET /v1/fragments/:id.ext` (extension dropdown based on the fragment's type)
- Send authenticated API requests using the Cognito **ID token** as a Bearer token

---

## Technologies

| Tool               | Purpose                                           |
| ------------------ | ------------------------------------------------- |
| React 19           | UI framework                                      |
| Vite 8             | Dev server and production build                   |
| react-oidc-context | React bindings for OIDC authentication            |
| oidc-client-ts     | OIDC client (Authorization Code flow)             |
| Fetch API          | HTTP client for the Fragments API                 |
| nginx              | Static file server in the production Docker image |

---

## Project Structure

```
src/
  main.jsx              # Entry point — AuthProvider + Cognito OIDC config
  App.jsx               # Main view — auth, create/view/update/delete/convert, fragment list
  api.js                # Fragments API client (list, get, convert, create, update, delete)
  components/
    Header.jsx          # App title
    AuthButton.jsx      # Login / logout button
    UserSection.jsx     # Welcome banner for authenticated users
  styles/
    app.css             # Application styles
index.html              # HTML shell
vite.config.js          # Vite config (dev server on port 5174)
Dockerfile              # Multi-stage build: Node (build) + nginx (serve)
.dockerignore           # Files excluded from the Docker build context
```

---

## Installation

Clone the repository:

```bash
git clone https://github.com/lamritha/fragments-ui.git
cd fragments-ui
```

Install dependencies:

```bash
npm install
```

---

## Environment Variables

Create a `.env` file in the project root (this file is gitignored):

```env
# Fragments API base URL
# Local API: http://localhost:8080
# Production API:
VITE_API_URL=https://fragments.alingeswaran1.mystudentproject.ca

# Amazon Cognito User Pool ID
VITE_AWS_COGNITO_POOL_ID=your_pool_id

# Cognito app client ID
VITE_AWS_COGNITO_CLIENT_ID=your_client_id

# OAuth redirect URL — must match a callback URL in your Cognito app client
VITE_OAUTH_SIGN_IN_REDIRECT_URL=http://localhost:5174

# Sign-out redirect URL — must match a sign-out URL in your Cognito app client
VITE_OAUTH_SIGN_OUT_REDIRECT_URL=http://localhost:5174

# Cognito Hosted UI domain (used for server-side logout)
VITE_AWS_COGNITO_DOMAIN=https://your-domain.auth.us-east-2.amazoncognito.com
```

All variables are exposed to the client via Vite's `import.meta.env`. The `VITE_API_URL` value is **baked into the static build at build time** — rebuild the app (or Docker image) when changing the API URL.

In production, `VITE_API_URL` should point at:

```
https://fragments.alingeswaran1.mystudentproject.ca
```

For local UI development against a local API, set `VITE_API_URL=http://localhost:8080` instead.

### Environment variable reference

| Variable                           | Required | Description                                                          |
| ---------------------------------- | -------- | -------------------------------------------------------------------- |
| `VITE_API_URL`                     | No       | Base URL of the Fragments API (default `http://localhost:8080`). Production: `https://fragments.alingeswaran1.mystudentproject.ca` |
| `VITE_AWS_COGNITO_POOL_ID`         | Yes      | Amazon Cognito User Pool ID                                          |
| `VITE_AWS_COGNITO_CLIENT_ID`       | Yes      | Cognito app client ID                                                |
| `VITE_OAUTH_SIGN_IN_REDIRECT_URL`  | Yes      | OAuth callback URL after sign-in (must match Cognito config exactly) |
| `VITE_OAUTH_SIGN_OUT_REDIRECT_URL` | Yes      | Redirect URL after sign-out (must match Cognito config exactly)      |
| `VITE_AWS_COGNITO_DOMAIN`          | Yes      | Cognito Hosted UI domain for the logout endpoint                     |

Restart the Vite dev server after changing `.env`.

> **Docker note:** `.dockerignore` excludes `.env`. For image builds, pass `VITE_*` values into the build context another way (for example build args) or temporarily adjust the ignore file so the production API URL is baked in.

---

## Running the Application

Start the development server:

```bash
npm run dev
```

The app runs at **http://localhost:5174** (port 5174 is configured in `vite.config.js` to avoid clashing with Vite's default port).

Ensure the Fragments backend is running and configured with the same Cognito User Pool before signing in. The UI can target either a local API or the production API at `https://fragments.alingeswaran1.mystudentproject.ca` depending on `VITE_API_URL`.

---

## Scripts

| Script            | Description                                      |
| ----------------- | ------------------------------------------------ |
| `npm run dev`     | Start the Vite development server on port 5174   |
| `npm run build`   | Build the app for production (output in `dist/`) |
| `npm run preview` | Serve the production build locally               |
| `npm run lint`    | Run ESLint on the project                        |

---

## Docker

The app uses a **multi-stage Docker build**:

1. **Builder** (`node:22.12.0-alpine`) — `npm ci` and `npm run build` to produce static assets in `dist/`
2. **Production** (`nginx:1.27-alpine`) — serves `dist/` from `/usr/share/nginx/html` on port **80**, with an HTTP healthcheck

### Build the image

Set the correct `VITE_*` values (especially `VITE_API_URL`) so they are available at build time — they are baked into the static output.

```bash
docker build -t fragments-ui:latest .
```

### Run the container

```bash
docker run --rm -p 8080:80 fragments-ui:latest
```

The app will be available at `http://localhost:8080`.

### Docker Hub

The image is published to Docker Hub as **`lamritha/fragments-ui`**:

```bash
docker pull lamritha/fragments-ui:latest
```

---

## Authentication

Authentication is configured in `src/main.jsx` using `react-oidc-context`'s `AuthProvider`.

- **Flow:** OIDC Authorization Code (`response_type: 'code'`)
- **Authority:** `https://cognito-idp.us-east-2.amazonaws.com/<pool-id>`
- **Scopes:** `email`, `openid`, `phone`

### Sign in

Clicking **Login** calls `auth.signinRedirect()`, which redirects the browser to the Cognito Hosted UI. After successful authentication, Cognito redirects back to `VITE_OAUTH_SIGN_IN_REDIRECT_URL` with an authorization code that is exchanged for tokens.

### Sign out

Clicking **Logout** clears the local OIDC session and redirects to the Cognito Hosted UI logout endpoint (using `VITE_AWS_COGNITO_DOMAIN`):

```
{VITE_AWS_COGNITO_DOMAIN}/logout?client_id={client_id}&logout_uri={sign_out_redirect_url}
```

This clears the server-side Cognito session in addition to the browser-side tokens.

### Cognito configuration checklist

In the AWS Cognito console, ensure your app client has:

- **Allowed callback URLs:** `http://localhost:5174` (and your deployed URL, if any)
- **Allowed sign-out URLs:** `http://localhost:5174` (and your deployed URL, if any)
- **OAuth 2.0 grant types:** Authorization code grant enabled
- **OpenID Connect scopes:** `openid`, `email`, `phone`

Callback and sign-out URLs must match the `.env` values exactly — including `http` vs `https` and trailing slashes.

---

## API Integration

API calls are defined in `src/api.js`. All requests include the Cognito **ID token** in the `Authorization` header:

```http
Authorization: Bearer <id-token>
```

The base URL comes from `VITE_API_URL` (default `http://localhost:8080`).

| Function                                         | Method   | Endpoint                                    | Description                                                                 |
| ------------------------------------------------ | -------- | ------------------------------------------- | --------------------------------------------------------------------------- |
| `getUserFragments(user, expand)`                 | `GET`    | `/v1/fragments` or `/v1/fragments?expand=1` | Fetch the authenticated user's fragments (use `expand=true` for metadata).  |
| `getFragmentData(user, id)`                      | `GET`    | `/v1/fragments/:id`                         | Fetch raw fragment data (text or image blob URL for inline viewing).        |
| `getFragmentConverted(user, id, ext)`            | `GET`    | `/v1/fragments/:id.ext`                     | Fetch fragment data converted to the format indicated by `ext`.             |
| `createFragment(user, body, contentType)`        | `POST`   | `/v1/fragments`                             | Create a fragment (text string or image `File`/`Blob` body).                |
| `updateFragment(user, id, body, contentType)`    | `PUT`    | `/v1/fragments/:id`                         | Replace fragment data; Content-Type must match the existing fragment type.  |
| `deleteFragment(user, id)`                       | `DELETE` | `/v1/fragments/:id`                         | Delete a fragment and its data.                                             |

On login, `App.jsx` automatically loads the user's fragments with full metadata. After create, update, or delete, the list is refreshed and a status message is shown.

API errors are logged to the browser console.

---

## Production Build

Build static assets for deployment:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

When deploying, set the `VITE_*` environment variables **before running the build**, including:

- `VITE_API_URL=https://fragments.alingeswaran1.mystudentproject.ca`
- Matching Cognito pool, client, domain, and callback/sign-out URLs for your deployed UI origin

---

## Development Notes

- The Fragments backend must be running and configured with matching `AWS_COGNITO_POOL_ID` and `AWS_COGNITO_CLIENT_ID` values.
- CORS is enabled on the Fragments API, so browser requests from this app are allowed cross-origin.
- `VITE_API_URL` is baked into the static build — rebuilding is required when changing the target API server.
- Production API URL: `https://fragments.alingeswaran1.mystudentproject.ca`
- All styles live in `src/styles/app.css`.
- Image fragments can be created, viewed, converted, and deleted in the UI; update (PUT) is offered for non-image types only.
