import { useHealth } from '@/hooks/use-health'

function App() {
  const health = useHealth()

  return <pre className="p-4 font-mono text-sm">{health}</pre>
}

export default App
