import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  getDateProp,
  getFileProp,
  getMultiSelectProp,
  getSelectProp,
  getTextProp,
} from '@/lib/notion-sync/client'
import type { NotionPageProperty } from '@/lib/notion-sync/client'

// Minimal factory casts: real Notion property objects have many more fields
// (annotations, href, etc.) which are irrelevant to these helpers. Casting
// through `unknown` keeps tests focused on the values the helpers read.
const asProp = (v: unknown): NotionPageProperty => v as NotionPageProperty

describe('getTextProp', () => {
  it('joins plain_text from a title property', () => {
    const prop = asProp({
      type: 'title',
      id: 'x',
      title: [
        { plain_text: 'Hello ' },
        { plain_text: 'World' },
      ],
    })
    expect(getTextProp(prop)).toBe('Hello World')
  })

  it('joins plain_text from a rich_text property', () => {
    const prop = asProp({
      type: 'rich_text',
      id: 'x',
      rich_text: [{ plain_text: 'foo' }, { plain_text: 'bar' }],
    })
    expect(getTextProp(prop)).toBe('foobar')
  })

  it("returns '' when prop is undefined", () => {
    expect(getTextProp(undefined)).toBe('')
  })

  it("returns '' for non-text property types", () => {
    const prop = asProp({ type: 'number', id: 'x', number: 42 })
    expect(getTextProp(prop)).toBe('')
  })
})

describe('getSelectProp', () => {
  it('returns the name when select is set', () => {
    const prop = asProp({
      type: 'select',
      id: 'x',
      select: { id: 's1', name: 'Draft', color: 'gray' },
    })
    expect(getSelectProp(prop)).toBe('Draft')
  })

  it('returns null when select is null', () => {
    const prop = asProp({ type: 'select', id: 'x', select: null })
    expect(getSelectProp(prop)).toBeNull()
  })

  it('returns null when prop is undefined', () => {
    expect(getSelectProp(undefined)).toBeNull()
  })
})

describe('getMultiSelectProp', () => {
  it('returns array of names', () => {
    const prop = asProp({
      type: 'multi_select',
      id: 'x',
      multi_select: [
        { id: 'a', name: 'tag-a', color: 'blue' },
        { id: 'b', name: 'tag-b', color: 'red' },
      ],
    })
    expect(getMultiSelectProp(prop)).toEqual(['tag-a', 'tag-b'])
  })

  it('returns [] when prop is undefined', () => {
    expect(getMultiSelectProp(undefined)).toEqual([])
  })

  it('returns [] for non-multi_select types', () => {
    const prop = asProp({ type: 'number', id: 'x', number: 1 })
    expect(getMultiSelectProp(prop)).toEqual([])
  })
})

describe('getDateProp', () => {
  it('returns the start date', () => {
    const prop = asProp({
      type: 'date',
      id: 'x',
      date: { start: '2026-06-14', end: null, time_zone: null },
    })
    expect(getDateProp(prop)).toBe('2026-06-14')
  })

  it('returns null when date is null', () => {
    const prop = asProp({ type: 'date', id: 'x', date: null })
    expect(getDateProp(prop)).toBeNull()
  })

  it('returns null when prop is undefined', () => {
    expect(getDateProp(undefined)).toBeNull()
  })
})

describe('getFileProp', () => {
  it('returns the URL of an external file', () => {
    const prop = asProp({
      type: 'files',
      id: 'x',
      files: [
        {
          type: 'external',
          name: 'cover.png',
          external: { url: 'https://example.com/cover.png' },
        },
      ],
    })
    expect(getFileProp(prop)).toBe('https://example.com/cover.png')
  })

  it('returns the signed URL of a Notion-hosted file', () => {
    const prop = asProp({
      type: 'files',
      id: 'x',
      files: [
        {
          type: 'file',
          name: 'cover.png',
          file: {
            url: 'https://notion.so/signed/cover.png',
            expiry_time: '2026-06-15T00:00:00.000Z',
          },
        },
      ],
    })
    expect(getFileProp(prop)).toBe('https://notion.so/signed/cover.png')
  })

  it('returns null when files array is empty', () => {
    const prop = asProp({ type: 'files', id: 'x', files: [] })
    expect(getFileProp(prop)).toBeNull()
  })

  it('returns null when prop is undefined', () => {
    expect(getFileProp(undefined)).toBeNull()
  })
})

describe('getNotionClient', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('throws when NOTION_API_KEY is missing', async () => {
    vi.resetModules()
    vi.stubEnv('NOTION_API_KEY', '')
    const mod = await import('@/lib/notion-sync/client')
    expect(() => mod.getNotionClient()).toThrow(
      /Missing required env var: NOTION_API_KEY/,
    )
  })

  it('returns a singleton Client when NOTION_API_KEY is set', async () => {
    vi.resetModules()
    vi.stubEnv('NOTION_API_KEY', 'secret_test_token')
    const mod = await import('@/lib/notion-sync/client')
    const c1 = mod.getNotionClient()
    const c2 = mod.getNotionClient()
    expect(c1).toBe(c2)
  })
})
