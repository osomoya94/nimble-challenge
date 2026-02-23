const BASE_URL = import.meta.env.VITE_BASE_URL;

export async function api(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // La respuesta no vino en JSON (o vino vacía). Dejamos data = null.
  }

  if (!res.ok) {
    const message = data?.message || data?.error || `Error HTTP ${res.status}`;
    throw new Error(message);
  }

  return data;
}
