import { useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import Header from './components/Header';
import AuthButton from './components/AuthButton';
import UserSection from './components/UserSection';
import { getUserFragments, createFragment } from './api';
import './styles/app.css';

const SUPPORTED_TYPES = [
  'text/plain',
  'text/markdown',
  'text/html',
  'text/csv',
  'application/json',
];

export default function App() {
  const auth = useAuth();
  const [fragments, setFragments] = useState([]);
  const [text, setText] = useState('');
  const [contentType, setContentType] = useState('text/plain');
  const [status, setStatus] = useState('');

  useEffect(() => {
    async function loadFragments() {
      if (auth.isAuthenticated && auth.user) {
        const data = await getUserFragments(auth.user, true);
        if (data?.fragments) {
          setFragments(data.fragments);
        }
      }
    }
    loadFragments();
  }, [auth.isAuthenticated, auth.user]);

  const signOutRedirect = () => {
    const clientId = import.meta.env.VITE_AWS_COGNITO_CLIENT_ID;
    const logoutUri = import.meta.env.VITE_OAUTH_SIGN_OUT_REDIRECT_URL;
    const cognitoDomain = import.meta.env.VITE_AWS_COGNITO_DOMAIN;
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  const handleCreateFragment = async () => {
    if (!text.trim()) {
      setStatus('Please enter some content before saving.');
      return;
    }
    const result = await createFragment(auth.user, text, contentType);
    if (result) {
      setStatus(`Fragment created: ${result.fragment.id}`);
      setText('');
      const data = await getUserFragments(auth.user, true);
      if (data?.fragments) {
        setFragments(data.fragments);
      }
    }
  };

  if (auth.isLoading) return <div>Loading...</div>;
  if (auth.error) return <div>Encountering error... {auth.error.message}</div>;

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
          <AuthButton label="Login" onClick={() => auth.signinRedirect()} />
        )}
      </div>

      <UserSection
        username={auth.user?.profile['cognito:username']}
        isLoggedIn={auth.isAuthenticated}
      />

      {auth.isAuthenticated && (
        <div className="fragments-section">
          <h2>Create Fragment</h2>

          <div className="type-selector">
            <label htmlFor="content-type">Type</label>
            <select
              id="content-type"
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
            >
              {SUPPORTED_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Enter ${contentType} content...`}
            rows={4}
          />
          <button className="primary" onClick={handleCreateFragment}>
            Save Fragment
          </button>
          {status && <p className="fragment-status">{status}</p>}

          <h2>Your Fragments</h2>
          {fragments.length === 0 ? (
            <p className="empty-state">No fragments yet.</p>
          ) : (
            <div className="fragments-list">
              {fragments.map((fragment) => (
                <div className="fragment-item" key={fragment.id}>
                  <div className="fragment-id">{fragment.id}</div>
                  <div className="fragment-meta">
                    <span>{fragment.type}</span>
                    <span>{fragment.size} bytes</span>
                    <span>{new Date(fragment.created).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
