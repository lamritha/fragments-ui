const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export async function getUserFragments(user, expand = false) {
  try {
    const url = new URL('/v1/fragments', apiUrl);
    if (expand) url.searchParams.set('expand', '1');
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${user.id_token}` },
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error('Unable to call GET /v1/fragments', { err });
  }
}

export async function getFragmentData(user, id) {
  try {
    const res = await fetch(new URL(`/v1/fragments/${id}`, apiUrl), {
      headers: { Authorization: `Bearer ${user.id_token}` },
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const contentType = res.headers.get('Content-Type') || '';
    if (contentType.startsWith('image/')) {
      const blob = await res.blob();
      return { type: contentType, data: URL.createObjectURL(blob) };
    }
    const text = await res.text();
    return { type: contentType, data: text };
  } catch (err) {
    console.error('Unable to call GET /v1/fragments/:id', { err });
  }
}

export async function getFragmentConverted(user, id, ext) {
  try {
    const res = await fetch(new URL(`/v1/fragments/${id}.${ext}`, apiUrl), {
      headers: { Authorization: `Bearer ${user.id_token}` },
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const contentType = res.headers.get('Content-Type') || '';
    if (contentType.startsWith('image/')) {
      const blob = await res.blob();
      return { type: contentType, data: URL.createObjectURL(blob) };
    }
    const text = await res.text();
    return { type: contentType, data: text };
  } catch (err) {
    console.error('Unable to call GET /v1/fragments/:id.ext', { err });
  }
}

export async function createFragment(user, body, contentType = 'text/plain') {
  try {
    const res = await fetch(new URL('/v1/fragments', apiUrl), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${user.id_token}`,
        'Content-Type': contentType,
      },
      body,
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error('Unable to call POST /v1/fragments', { err });
  }
}

export async function updateFragment(user, id, body, contentType) {
  try {
    const res = await fetch(new URL(`/v1/fragments/${id}`, apiUrl), {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${user.id_token}`,
        'Content-Type': contentType,
      },
      body,
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error('Unable to call PUT /v1/fragments/:id', { err });
  }
}

export async function deleteFragment(user, id) {
  try {
    const res = await fetch(new URL(`/v1/fragments/${id}`, apiUrl), {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${user.id_token}` },
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.error('Unable to call DELETE /v1/fragments/:id', { err });
  }
}
