import { useState } from 'react'

function App() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  const onFileChange = (e) => {
    const f = e.target.files?.[0]
    setFile(f || null)
    setResult(null)
    setError('')
    if (f) {
      const url = URL.createObjectURL(f)
      setPreview(url)
    } else {
      setPreview('')
    }
  }

  const analyze = async () => {
    if (!file) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch(`${backend}/analyze`, { method: 'POST', body: form })
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        throw new Error(payload?.detail || `Request failed: ${res.status}`)
      }
      const data = await res.json()
      setResult(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-6">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-800">Food Calorie Detector</h1>
          <p className="text-gray-600 mt-2">Upload a meal photo to identify foods and estimate calories.</p>
        </header>

        <div className="bg-white/80 backdrop-blur rounded-xl shadow p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select image</label>
              <input
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="w-full cursor-pointer"
              />
              {preview && (
                <img src={preview} alt="preview" className="mt-4 rounded-lg border object-cover max-h-72 w-full" />
              )}

              <button
                onClick={analyze}
                disabled={!file || loading}
                className={`mt-4 inline-flex items-center justify-center px-4 py-2 rounded-md text-white ${
                  loading ? 'bg-gray-400' : 'bg-orange-500 hover:bg-orange-600'
                }`}
              >
                {loading ? 'Analyzing…' : 'Analyze Image'}
              </button>

              {error && (
                <p className="mt-3 text-sm text-red-600">{error}</p>
              )}
            </div>

            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Result</h2>
              {!result && (
                <p className="text-gray-500">No analysis yet. Upload an image and click Analyze.</p>
              )}
              {result && (
                <div className="space-y-3">
                  <div className="p-3 rounded border bg-gray-50">
                    <p className="text-sm text-gray-600">Analysis ID: <span className="font-mono">{result.analysis_id}</span></p>
                  </div>
                  <ul className="divide-y rounded border">
                    {result.items?.length ? result.items.map((item, idx) => (
                      <li key={idx} className="p-3 flex items-center justify-between">
                        <div>
                          <p className="font-medium capitalize">{item.name}</p>
                          <p className="text-xs text-gray-500">Confidence: {(item.confidence * 100).toFixed(0)}% • Weight: {item.weight_grams || 0} g</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{(item.calories || 0).toFixed(0)} kcal</p>
                        </div>
                      </li>
                    )) : (
                      <li className="p-3 text-gray-500">No items detected.</li>
                    )}
                  </ul>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-orange-100 text-orange-800 font-semibold">
                    <span>Total</span>
                    <span>{(result.total_calories || 0).toFixed(0)} kcal</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">Backend: {backend}</p>
      </div>
    </div>
  )
}

export default App
