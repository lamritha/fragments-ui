import { useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import Header from './components/Header';
import AuthButton from './components/AuthButton';
import UserSection from './components/UserSection';
import {
  getUserFragments,
  getFragmentData,
  getFragmentConverted,
  createFragment,
  updateFragment,
  deleteFragment,
} from './api';
import './styles/app.css';

const TEXT_TYPES = [
  'text/plain',
  'text/markdown',
  'text/html',
  'text/csv',
  'application/json',
];

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'image/gif'];

const SUPPORTED_TYPES = [...TEXT_TYPES, ...IMAGE_TYPES];

const CONVERSION_EXTENSIONS = {
  'text/plain': ['txt'],
  'text/markdown': ['md', 'html', 'txt'],
  'text/html': ['html', 'txt'],
  'text/csv': ['csv', 'txt', 'json'],
  'application/json': ['json', 'yaml', 'txt'],
  'text/yaml': ['yaml', 'txt'],
  'image/png': ['png', 'jpg', 'webp', 'gif', 'avif'],
  'image/jpeg': ['png', 'jpg', 'webp', 'gif', 'avif'],
  'image/webp': ['png', 'jpg', 'webp', 'gif', 'avif'],
  'image/avif': ['png', 'jpg', 'webp', 'gif', 'avif'],
  'image/gif': ['png', 'jpg', 'webp', 'gif', 'avif'],
};

export default function App() {
  const auth = useAuth();
  const [fragments, setFragments] = useState([]);
  const [text, setText] = useState('');
  const [contentType, setContentType] = useState('text/plain');
  const [imageFile, setImageFile] = useState(null);
  const [status, setStatus] = useState('');
  const [viewData, setViewData] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  const [editingFragment, setEditingFragment] = useState(null);
  const [editText, setEditText] = useState('');
  const [convertExt, setConvertExt] = useState('');
  const [convertResult, setConvertResult] = useState(null);

  const isImageType = IMAGE_TYPES.includes(contentType);

  const loadFragments = async () => {
    const data = await getUserFragments(auth.user, true);
    if (data?.fragments) setFragments(data.fragments);
  };

  useEffect(() => {
    if (auth.isAuthenticated && auth.user) loadFragments();
  }, [auth.isAuthenticated, auth.user]);

  const signOutRedirect = () => {
    const clientId = import.meta.env.VITE_AWS_COGNITO_CLIENT_ID;
    const logoutUri = import.meta.env.VITE_OAUTH_SIGN_OUT_REDIRECT_URL;
    const cognitoDomain = import.meta.env.VITE_AWS_COGNITO_DOMAIN;
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  const handleCreateFragment = async () => {
    if (isImageType) {
      if (!imageFile) { setStatus('Please select an image file.'); return; }
      const result = await createFragment(auth.user, imageFile, contentType);
      if (result) {
        setStatus(`Fragment created: ${result.fragment.id}`);
        setImageFile(null);
        await loadFragments();
      }
    } else {
      if (!text.trim()) { setStatus('Please enter some content before saving.'); return; }
      const result = await createFragment(auth.user, text, contentType);
      if (result) {
        setStatus(`Fragment created: ${result.fragment.id}`);
        setText('');
        await loadFragments();
      }
    }
  };

  const handleView = async (id) => {
    if (viewingId === id) { setViewingId(null); setViewData(null); return; }
    const result = await getFragmentData(auth.user, id);
    if (result) { setViewingId(id); setViewData(result); setConvertResult(null); setConvertExt(''); }
  };

  const handleConvert = async (id, mimeType) => {
    if (!convertExt) { setStatus('Select a conversion format first.'); return; }
    const result = await getFragmentConverted(auth.user, id, convertExt);
    if (result) setConvertResult(result);
  };

  const handleEditStart = (fragment) => {
    setEditingFragment(fragment);
    setEditText('');
  };

  const handleEditSave = async () => {
    if (!editText.trim()) { setStatus('Enter updated content.'); return; }
    const result = await updateFragment(auth.user, editingFragment.id, editText, editingFragment.type);
    if (result) {
      setStatus(`Fragment updated: ${editingFragment.id}`);
      setEditingFragment(null);
      setEditText('');
      await loadFragments();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this fragment?')) return;
    const result = await deleteFragment(auth.user, id);
    if (result) {
      setStatus(`Fragment deleted: ${id}`);
      if (viewingId === id) { setViewingId(null); setViewData(null); }
      await loadFragments();
    }
  };

  const renderViewData = (data) => {
    if (!data) return null;
    if (data.type?.startsWith('image/')) {
      return <img src={data.data} alt="fragment" style={{ maxWidth: '100%', marginTop: '0.5rem' }} />;
    }
    return <pre className="fragment-view-data">{data.data}</pre>;
  };

  if (auth.isLoading) return <div>Loading...</div>;
  if (auth.error) return <div>Encountering error... {auth.error.message}</div>;

  return (
    <div className="app-container">
      <Header />

      <div className="login-section">
        {auth.isAuthenticated ? (
          <AuthButton label="Logout" onClick={() => { auth.removeUser(); signOutRedirect(); }} />
        ) : (
          <AuthButton label="Login" onClick={() => auth.signinRedirect()} />
        )}
      </div>

      <UserSection username={auth.user?.profile['cognito:username']} isLoggedIn={auth.isAuthenticated} />

      {auth.isAuthenticated && (
        <div className="fragments-section">
          <h2>Create Fragment</h2>

          <div className="type-selector">
            <label htmlFor="content-type">Type</label>
            <select id="content-type" value={contentType} onChange={(e) => { setContentType(e.target.value); setText(''); setImageFile(null); }}>
              {SUPPORTED_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {isImageType ? (
            <input
              type="file"
              accept={contentType}
              onChange={(e) => setImageFile(e.target.files[0])}
              className="file-input"
            />
          ) : (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`Enter ${contentType} content...`}
              rows={4}
            />
          )}

          <button className="primary" onClick={handleCreateFragment}>Save Fragment</button>
          {status && <p className="fragment-status">{status}</p>}

          {editingFragment && (
            <div className="edit-section">
              <h2>Update Fragment</h2>
              <p className="fragment-id">{editingFragment.id}</p>
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>{editingFragment.type}</p>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                placeholder="Enter new content..."
                rows={4}
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="primary" onClick={handleEditSave}>Save Update</button>
                <button onClick={() => setEditingFragment(null)}>Cancel</button>
              </div>
            </div>
          )}

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
                  <div className="fragment-actions">
                    <button onClick={() => handleView(fragment.id)}>
                      {viewingId === fragment.id ? 'Hide' : 'View'}
                    </button>
                    {!fragment.type.startsWith('image/') && (
                      <button onClick={() => handleEditStart(fragment)}>Update</button>
                    )}
                    <button className="danger" onClick={() => handleDelete(fragment.id)}>Delete</button>
                  </div>

                  {viewingId === fragment.id && (
                    <div className="fragment-view">
                      {renderViewData(viewData)}
                      <div className="convert-section">
                        <label>Convert to:</label>
                        <select value={convertExt} onChange={(e) => { setConvertExt(e.target.value); setConvertResult(null); }}>
                          <option value="">-- select format --</option>
                          {(CONVERSION_EXTENSIONS[fragment.type.split(';')[0].trim()] || []).map((ext) => (
                            <option key={ext} value={ext}>{ext}</option>
                          ))}
                        </select>
                        <button onClick={() => handleConvert(fragment.id, fragment.type)}>Convert</button>
                      </div>
                      {convertResult && (
                        <div className="convert-result">
                          <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.25rem' }}>{convertResult.type}</p>
                          {convertResult.type?.startsWith('image/') ? (
                            <img src={convertResult.data} alt="converted" style={{ maxWidth: '100%' }} />
                          ) : (
                            <pre className="fragment-view-data">{convertResult.data}</pre>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
