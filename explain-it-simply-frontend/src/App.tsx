import { useState } from 'react'
import { Lightbulb, ArrowRight, Copy, Check, Loader2 } from 'lucide-react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const LEVELS = [
  { key: 'kid', label: 'Like I\'m 10', emoji: '🧒' },
  { key: 'teen', label: 'Teenager', emoji: '🎓' },
  { key: 'adult', label: 'General', emoji: '👤' },
  { key: 'expert', label: 'Expert', emoji: '🔬' },
]

function App() {
  const [inputText, setInputText] = useState('')
  const [simplified, setSimplified] = useState('')
  const [level, setLevel] = useState('adult')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [stats, setStats] = useState<{ original: number; simplified: number } | null>(null)

  const handleSimplify = async () => {
    if (!inputText.trim()) return
    setLoading(true)
    setError('')
    setSimplified('')
    setStats(null)

    try {
      const res = await fetch(`${API_URL}/api/simplify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, level }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Something went wrong')
      }

      const data = await res.json()
      setSimplified(data.simplified)
      setStats({ original: data.original_length, simplified: data.simplified_length })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to connect to the server'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(simplified)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const reductionPercent = stats
    ? Math.round(((stats.original - stats.simplified) / stats.original) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b border-indigo-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="bg-indigo-600 text-white p-2 rounded-xl">
            <Lightbulb size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">ExplainItSimply</h1>
            <p className="text-sm text-gray-500">Paste anything. Get a simple explanation.</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Level Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Complexity Level
          </label>
          <div className="flex gap-3 flex-wrap">
            {LEVELS.map((l) => (
              <button
                key={l.key}
                onClick={() => setLevel(l.key)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                  level === l.key
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                }`}
              >
                <span>{l.emoji}</span>
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input / Output Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Input */}
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paste your text
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste any complex text here — a research paper, legal document, technical docs, news article..."
              className="flex-1 min-h-64 p-4 rounded-xl border border-gray-200 bg-white text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            <button
              onClick={handleSimplify}
              disabled={loading || !inputText.trim()}
              className="mt-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 hover:shadow-xl"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Simplifying...
                </>
              ) : (
                <>
                  Simplify
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>

          {/* Output */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Simplified version
              </label>
              {simplified && (
                <button
                  onClick={handleCopy}
                  className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              )}
            </div>
            <div className="flex-1 min-h-64 p-4 rounded-xl border border-gray-200 bg-white text-gray-800 overflow-auto whitespace-pre-wrap">
              {loading && (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <Loader2 size={32} className="animate-spin" />
                </div>
              )}
              {error && (
                <div className="text-red-500 bg-red-50 p-4 rounded-lg">
                  {error}
                </div>
              )}
              {!loading && !error && !simplified && (
                <p className="text-gray-400 italic">Your simplified text will appear here...</p>
              )}
              {!loading && simplified && simplified}
            </div>
            {stats && !loading && (
              <div className="mt-3 flex gap-4 text-xs text-gray-500">
                <span>Original: {stats.original} chars</span>
                <span>Simplified: {stats.simplified} chars</span>
                {reductionPercent > 0 && (
                  <span className="text-green-600 font-medium">
                    {reductionPercent}% shorter
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-16">
        <div className="max-w-5xl mx-auto px-6 py-6 text-center text-sm text-gray-400">
          ExplainItSimply — Making knowledge accessible to everyone
        </div>
      </footer>
    </div>
  )
}

export default App
