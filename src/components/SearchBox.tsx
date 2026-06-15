'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Input, Spinner } from '@/components/ui'

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
      .catch(() => {
        // Pagefind index chưa được build (dev mode) — silent fallback
      })
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
    <div className="w-full">
      <Input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Tìm kiếm bài viết..."
      />
      {status === 'loading' && (
        <p className="mt-2 text-sm flex items-center gap-2 text-[var(--gray-600)]">
          <Spinner size="sm" label="Đang tìm" />
          Đang tìm...
        </p>
      )}
      {status === 'empty' && query.trim() && (
        <p className="mt-2 text-sm" style={{ color: 'var(--gray-600)' }}>
          Không tìm thấy kết quả.
        </p>
      )}
      {status === 'ready' && results.length > 0 && (
        <ul className="mt-3 flex flex-col gap-2">
          {results.map((r) => (
            <li key={r.url}>
              <Link
                href={r.url}
                className="block p-3 border rounded hover:bg-[var(--gray-100)]"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="font-medium" dangerouslySetInnerHTML={{ __html: r.title }} />
                <div className="text-sm mt-1" style={{ color: 'var(--gray-600)' }}
                     dangerouslySetInnerHTML={{ __html: r.excerpt }} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
