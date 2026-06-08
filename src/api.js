// HTTP client for the fragments microservice (VITE_API_URL defaults to localhost:8080)
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// GET /v1/fragments — returns { status, fragments: [id, ...] }
export async function getUserFragments(user) {
  try {
    const res = await fetch(new URL('/v1/fragments', apiUrl), {
      headers: {
        Authorization: `Bearer ${user.id_token}`,
      },
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.error('Unable to call GET /v1/fragments', { err });
  }
}

// POST /v1/fragments — create a text/plain fragment from raw body
export async function createFragment(user, text) {
  try {
    const res = await fetch(new URL('/v1/fragments', apiUrl), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${user.id_token}`,
        'Content-Type': 'text/plain',
      },
      body: text,
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.error('Unable to call POST /v1/fragments', { err });
  }
}
