# fragments-ui

A React + Vite frontend web application for the Fragments microservice project. This application allows authenticated users to sign in with Amazon Cognito and interact with the Fragments API.

---

## Features

- User authentication with Amazon Cognito
- Login/logout using OIDC OAuth flow
- Protected API requests using JWT bearer tokens
- Fetch authenticated user fragments from the Fragments API
- Built with React and Vite

---

## Technologies Used

- React
- Vite
- Amazon Cognito
- react-oidc-context
- oidc-client-ts
- Fetch API

---

## Project Structure

```bash
src/
├── components/
├── styles/
├── App.jsx
├── api.js
├── main.jsx
```

## Installation

Clone the repository:

```bash
git clone <your-repo-url>
cd fragments-ui
```

Install dependencies:

```bash
npm install
```

---

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=your_api_url
VITE_AWS_COGNITO_POOL_ID=your_pool_id
VITE_AWS_COGNITO_CLIENT_ID=your_client_id
VITE_OAUTH_SIGN_IN_REDIRECT_URL=your_web_app_url
VITE_OAUTH_SIGN_OUT_REDIRECT_URL=your_web_app_url
```

---

## Running the Application

Start the Vite development server:

```bash
npm run dev
```

---

## Authentication

This project uses Amazon Cognito Hosted UI with the Authorization Code Flow.

Users can:

- Sign in through Cognito
- Receive JWT tokens
- Make authenticated requests to the Fragments API
- Sign out securely

---

## API Requests

Authenticated requests are sent to:

```bash
GET /v1/fragments
```

The JWT ID token is included in the Authorization header as a Bearer token.

---

## Development Notes

- Ensure the Fragments backend server is running on port 8080
- Ensure Cognito callback and logout URLs are configured correctly
- Restart the Vite server after modifying `.env`
