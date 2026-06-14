import { syncAll } from '../src/lib/notion-sync/syncAll'

async function main() {
  console.log('[sync] Starting full sync...')
  const sinceTimestamp = process.argv[2] // optional ISO timestamp
  try {
    const result = await syncAll(sinceTimestamp)
    console.log(
      `[sync] Done: ${result.synced} synced, ${result.skipped} skipped, ${result.failed} failed`
    )
    if (result.failed > 0) process.exit(1)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[sync] Fatal error:', message)
    process.exit(1)
  }
}

main()
