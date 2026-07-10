// HTTP client for the fragments microservice (VITE_API_URL defaults to localhost:8080)
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export async function getUserFragments(user, expand = false) {
  try {
    const url = new URL('/v1/fragments', apiUrl);
    if (expand) url.searchParams.set('expand', '1');
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${user.id_token}`,
      },
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Unable to call GET /v1/fragments', { err });
  }
}

export async function createFragment(user, text, contentType = 'text/plain') {
  try {
    const res = await fetch(new URL('/v1/fragments', apiUrl), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${user.id_token}`,
        'Content-Type': contentType,
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
