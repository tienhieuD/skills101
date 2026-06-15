/// <reference lib="webworker" />
import { defaultCache } from '@serwist/next/worker'
import type { PrecacheEntry } from 'serwist'
import { Serwist, StaleWhileRevalidate, ExpirationPlugin } from 'serwist'

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
}

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: /^https?:\/\/[^/]+\/posts\/.+/,
      handler: new StaleWhileRevalidate({
        cacheName: 'posts-cache',
        plugins: [
          new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 30 * 24 * 60 * 60 }),
        ],
      }),
    },
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        url: '/~offline',
        matcher: ({ request }) => request.destination === 'document',
      },
    ],
  },
})

serwist.addEventListeners()
