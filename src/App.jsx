import Header from './components/Header';
import AuthButton from './components/AuthButton';
import UserSection from './components/UserSection';
import { getUserFragments } from './api';
import { useEffect } from 'react';

import './styles/app.css';

import { useAuth } from 'react-oidc-context';

export default function App() {
  const auth = useAuth();
  useEffect(() => {
  async function loadFragments() {
    if (auth.isAuthenticated && auth.user) {
      const fragments =
        await getUserFragments(auth.user);

      console.log(fragments);
    }
  }

  loadFragments();
}, [auth.isAuthenticated]);

  const signOutRedirect = () => {
    const clientId =
      import.meta.env.VITE_AWS_COGNITO_CLIENT_ID;

    const logoutUri =
      import.meta.env.VITE_OAUTH_SIGN_OUT_REDIRECT_URL;

    const cognitoDomain =
      'https://us-east-278iu5xwvp.auth.us-east-2.amazoncognito.com';

    window.location.href =
      `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    return (
      <div>
        Encountering error...
        {auth.error.message}
      </div>
    );
  }

  return (
    <div className="app-container">
      <Header />

      <div className="login-section">
        {auth.isAuthenticated ? (
          <AuthButton
            label="Logout"
            onClick={() => {
              auth.removeUser();
              signOutRedirect();
            }}
          />
        ) : (
          <AuthButton
            label="Login"
            onClick={() =>
              auth.signinRedirect()
            }
          />
        )}
      </div>

      <UserSection
        username={auth.user?.profile['cognito:username']}
        isLoggedIn={auth.isAuthenticated}
      />
    </div>
  );
}