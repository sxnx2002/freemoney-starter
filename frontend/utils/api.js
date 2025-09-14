export async function apiRequest(path, method='GET', body=null) {
  const base = process.env.NEXT_PUBLIC_API_BASE || '';
  const res = await fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  return res.json();
}
