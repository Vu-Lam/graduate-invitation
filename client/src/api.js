async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* body rỗng hoặc không phải JSON */
  }
  if (!res.ok) {
    const err = new Error(data?.error || 'Có lỗi xảy ra, bạn thử lại sau nhé.');
    err.status = res.status;
    err.field = data?.field ?? null;
    throw err;
  }
  return data;
}

export const api = {
  getGuest: (slug) => request(`/guests/${encodeURIComponent(slug)}`),
  sendRsvp: (slug, body) =>
    request(`/guests/${encodeURIComponent(slug)}/rsvp`, { method: 'PUT', body: JSON.stringify(body) }),
  getWishes: (slug) => {
    const url = slug ? `/wishes?slug=${encodeURIComponent(slug)}` : '/wishes';
    return request(url);
  }
};
