'use client';

import { supabase } from './supabase';

export async function getAuthHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return { 'Content-Type': 'application/json' };
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.access_token}`,
  };
}

export async function apiGet(path: string) {
  const headers = await getAuthHeaders();
  const res = await fetch(path, { headers });
  return res.json();
}

export async function apiPost(path: string, body: unknown) {
  const headers = await getAuthHeaders();
  const res = await fetch(path, { method: 'POST', headers, body: JSON.stringify(body) });
  return { ok: res.ok, data: await res.json() };
}

export async function apiPatch(path: string, body: unknown) {
  const headers = await getAuthHeaders();
  const res = await fetch(path, { method: 'PATCH', headers, body: JSON.stringify(body) });
  return { ok: res.ok, data: await res.json() };
}

export async function apiDelete(path: string) {
  const headers = await getAuthHeaders();
  const res = await fetch(path, { method: 'DELETE', headers });
  return { ok: res.ok, data: await res.json() };
}
