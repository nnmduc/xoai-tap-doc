const RTDB_URL = import.meta.env.VITE_FIREBASE_RTDB_URL as string | undefined

export async function fetchUserSet(uid: string, token: string, key: string): Promise<Set<string>> {
  if (!RTDB_URL) return new Set()
  try {
    const res = await fetch(`${RTDB_URL}/users/${uid}/${key}.json?auth=${token}`)
    const data = await res.json()
    if (data && typeof data === 'object') {
      return new Set(Object.keys(data).filter((k) => data[k] === true))
    }
  } catch {}
  return new Set()
}

export function setUserEntry(
  uid: string,
  token: string,
  key: string,
  slug: string,
  value: boolean,
): void {
  if (!RTDB_URL) return
  const url = `${RTDB_URL}/users/${uid}/${key}/${slug}.json?auth=${token}`
  if (value) {
    fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: 'true',
    }).catch(() => {})
  } else {
    fetch(url, { method: 'DELETE' }).catch(() => {})
  }
}
