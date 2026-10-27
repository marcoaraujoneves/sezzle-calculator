export async function fetchHealth(fetchFn: typeof fetch = fetch): Promise<string> {
  const response = await fetchFn('/healthz')
  if (!response.ok) {
    throw new Error(`healthz responded with ${response.status}`)
  }
  return JSON.stringify(await response.json(), null, 2)
}
