import { describe, expect, it } from 'vitest'
import { fetchHealth } from './health'

const stubFetch = (response: Response) => (async () => response) as unknown as typeof fetch

describe('fetchHealth', () => {
  it('returns the pretty-printed body', async () => {
    const result = await fetchHealth(stubFetch(Response.json({ status: 'ok' })))
    expect(result).toBe('{\n  "status": "ok"\n}')
  })

  it('throws on a non-ok response', async () => {
    const failing = stubFetch(new Response(null, { status: 503 }))
    await expect(fetchHealth(failing)).rejects.toThrow('503')
  })
})
