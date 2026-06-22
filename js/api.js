/* =====================================================
   ITE STARTUP LAUNCH PAD – API BRIDGE (api.js)
   Async fetch wrapper that talks to the FastAPI backend.
   All API calls automatically attach the JWT token.
   ===================================================== */
window.ITE = window.ITE || {};

ITE.API = (function () {
  const BASE = 'http://localhost:8000/api';
  const TOKEN_KEY = 'ite_jwt';

  function getToken() {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  function setToken(token) {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
  }

  async function request(method, path, body, isForm) {
    const headers = {};
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (body && !isForm) headers['Content-Type'] = 'application/json';

    const opts = { method, headers };
    if (body) opts.body = isForm ? body : JSON.stringify(body);

    try {
      const res = await fetch(`${BASE}${path}`, opts);
      if (res.status === 204) return null;
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`);
      return data;
    } catch (err) {
      console.error(`[ITE.API] ${method} ${path}`, err);
      throw err;
    }
  }

  return {
    setToken,
    getToken,
    get:    (path)        => request('GET',    path),
    post:   (path, body)  => request('POST',   path, body),
    patch:  (path, body)  => request('PATCH',  path, body),
    del:    (path)        => request('DELETE',  path),
    upload: (path, form)  => request('POST',   path, form, true),
  };
})();
