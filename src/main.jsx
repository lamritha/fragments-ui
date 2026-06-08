// Entry point — wraps the app in Cognito OIDC auth (authorization code flow)
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.jsx';

import { AuthProvider } from 'react-oidc-context';

const cognitoAuthConfig = {
  authority:
    `https://cognito-idp.us-east-2.amazonaws.com/${import.meta.env.VITE_AWS_COGNITO_POOL_ID}`,

  client_id: import.meta.env.VITE_AWS_COGNITO_CLIENT_ID,

  redirect_uri: import.meta.env.VITE_OAUTH_SIGN_IN_REDIRECT_URL,

  response_type: 'code',

  scope: 'email openid phone',
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider {...cognitoAuthConfig}>
    <App />
  </AuthProvider>
);
