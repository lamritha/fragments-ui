# fragments-ui

React + Vite frontend for the [Fragments](https://github.com/lamritha/fragments) microservice. Authenticated users sign in with Amazon Cognito and interact with the Fragments API to create and list text fragments.

---

## Prerequisites

- Node.js 20+
- npm
- Git
- A running [Fragments API](https://github.com/lamritha/fragments) server configured with the same Amazon Cognito User Pool
- An Amazon Cognito app client with OAuth callback and sign-out URLs configured for this app

---

## Features

- Sign in and sign out via Amazon Cognito Hosted UI (OIDC Authorization Code flow)
- Display the authenticated user's Cognito username
- List the user's fragment IDs from `GET /v1/fragments`
- Create new `text/plain` fragments via `POST /v1/fragments`
- Send authenticated API requests using the Cognito **ID token** as a Bearer token

---

## Technologies

| Tool | Purpose |
|------|---------|
| React 19 | UI framework |
| Vite 8 | Dev server and production build |
| react-oidc-context | React bindings for OIDC authentication |
| oidc-client-ts | OIDC client (Authorization Code flow) |
| Fetch API | HTTP client for the Fragments API |

---

## Project Structure

```
src/
  main.jsx              # Entry point — AuthProvider + Cognito OIDC config
  App.jsx               # Main view — auth, fragment creation, fragment list
  api.js                # Fragments API client (GET/POST /v1/fragments)
  components/
    Header.jsx          # App title
    AuthButton.jsx      # Login / logout button
    UserSection.jsx     # Welcome banner for authenticated users
  styles/
    app.css             # Application styles
index.html              # HTML shell
vite.config.js          # Vite config (dev server on port 5174)
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
# Fragments API base URL (defaults to http://localhost:8080 if omitted)
VITE_API_URL=http://localhost:8080

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

All variables are exposed to the client via Vite's `import.meta.env` — do not put secrets in `.env`.

### Environment variable reference

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | No | Base URL of the Fragments API (default `http://localhost:8080`) |
| `VITE_AWS_COGNITO_POOL_ID` | Yes | Amazon Cognito User Pool ID |
| `VITE_AWS_COGNITO_CLIENT_ID` | Yes | Cognito app client ID |
| `VITE_OAUTH_SIGN_IN_REDIRECT_URL` | Yes | OAuth callback URL after sign-in (must match Cognito config exactly) |
| `VITE_OAUTH_SIGN_OUT_REDIRECT_URL` | Yes | Redirect URL after sign-out (must match Cognito config exactly) |
| `VITE_AWS_COGNITO_DOMAIN` | Yes | Cognito Hosted UI domain for the logout endpoint |

Restart the Vite dev server after changing `.env`.

---

## Running the Application

Start the development server:

```bash
npm run dev
```

The app runs at **http://localhost:5174** (port 5174 is configured in `vite.config.js` to avoid clashing with Vite's default port).

Ensure the Fragments backend is running and configured with the same Cognito User Pool before signing in.

---

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the Vite development server on port 5174 |
| `npm run build` | Build the app for production (output in `dist/`) |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint on the project |

---

## Authentication

Authentication is configured in `src/main.jsx` using `react-oidc-context`'s `AuthProvider`.

- **Flow:** OIDC Authorization Code (`response_type: 'code'`)
- **Authority:** `https://cognito-idp.us-east-2.amazonaws.com/<pool-id>`
- **Scopes:** `email`, `openid`, `phone`

### Sign in

Clicking **Login** calls `auth.signinRedirect()`, which redirects the browser to the Cognito Hosted UI. After successful authentication, Cognito redirects back to `VITE_OAUTH_SIGN_IN_REDIRECT_URL` with an authorization code that is exchanged for tokens.

### Sign out

Clicking **Logout** clears the local OIDC session and redirects to the Cognito Hosted UI logout endpoint:

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

| Function | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| `getUserFragments(user)` | `GET` | `/v1/fragments` | Fetch the authenticated user's fragment IDs |
| `createFragment(user, text)` | `POST` | `/v1/fragments` | Create a new `text/plain` fragment from the given text |

On login, `App.jsx` automatically loads the user's fragments. After creating a fragment, the list is refreshed and a status message shows the new fragment ID.

API errors are logged to the browser console; the UI does not currently display API error messages to the user.

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

When deploying, set the `VITE_*` environment variables to your production API URL and Cognito settings, and update Cognito callback/sign-out URLs to match your deployed domain.

---

## Development Notes

- The Fragments backend must be running and configured with matching `AWS_COGNITO_POOL_ID` and `AWS_COGNITO_CLIENT_ID` values.
- CORS is enabled on the Fragments API, so browser requests from this app are allowed cross-origin.
- Only `text/plain` fragment creation is supported in the UI currently; the backend supports additional MIME types.
- `src/index.css` is unused — all styles live in `src/styles/app.css`.
