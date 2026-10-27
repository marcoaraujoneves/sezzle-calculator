import { useEffect, useState } from 'react'
import { fetchHealth } from '@/lib/health'

export function useHealth(): string {
  const [health, setHealth] = useState('loading...')

  useEffect(() => {
    fetchHealth()
      .then(setHealth)
      .catch((error: Error) => setHealth(error.message))
  }, [])

  return health
}
