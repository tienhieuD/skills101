interface TagFilterProps {
  allTags: string[]
  activeTag?: string
}

export function TagFilter({ allTags, activeTag }: TagFilterProps) {
  return (
    <p>
      Tag:{' '}
      {!activeTag ? <strong>Tất cả</strong> : <a href="/">Tất cả</a>}
      {allTags.map((tag) => (
        <span key={tag}>
          {' | '}
          {tag === activeTag ? (
            <strong>{tag}</strong>
          ) : (
            <a href={`/?tag=${encodeURIComponent(tag)}`}>{tag}</a>
          )}
        </span>
      ))}
    </p>
  )
}
