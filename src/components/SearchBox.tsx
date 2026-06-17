'use client'

import { useEffect, useState } from 'react'

interface PagefindResult {
  id: string
  data: () => Promise<{
    url: string
    excerpt: string
    meta: { title: string }
  }>
}

interface PagefindAPI {
  search: (query: string) => Promise<{ results: PagefindResult[] }>
}

declare global {
  interface Window {
    pagefind?: PagefindAPI
  }
}

interface RenderedResult {
  url: string
  title: string
  excerpt: string
}

export function SearchBox() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<RenderedResult[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'empty'>('idle')

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.pagefind) return
    import(/* webpackIgnore: true */ '/_pagefind/pagefind.js' as string)
      .then((mod) => {
        window.pagefind = mod as PagefindAPI
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) {
      setResults([])
      setStatus('idle')
      return
    }
    if (!window.pagefind) {
      setStatus('idle')
      return
    }
    setStatus('loading')
    const handle = window.setTimeout(async () => {
      try {
        const search = await window.pagefind!.search(trimmed)
        const hits = await Promise.all(
          search.results.slice(0, 10).map(async (r) => {
            const d = await r.data()
            return { url: d.url, title: d.meta.title, excerpt: d.excerpt }
          })
        )
        setResults(hits)
        setStatus(hits.length > 0 ? 'ready' : 'empty')
      } catch {
        setStatus('empty')
        setResults([])
      }
    }, 250)
    return () => window.clearTimeout(handle)
  }, [query])

  return (
    <div>
      <p>
        <label htmlFor="search-input">Tìm kiếm: </label>
        <input
          id="search-input"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm bài viết..."
          size={30}
        />
      </p>
      {status === 'loading' && <p>Đang tìm...</p>}
      {status === 'empty' && query.trim() && <p>Không tìm thấy kết quả.</p>}
      {status === 'ready' && results.length > 0 && (
        <ul>
          {results.map((r) => (
            <li key={r.url}>
              <a href={r.url} dangerouslySetInnerHTML={{ __html: r.title }} />
              <br />
              <small dangerouslySetInnerHTML={{ __html: r.excerpt }} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
