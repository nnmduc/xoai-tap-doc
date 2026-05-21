interface Props {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: Props) {
  return (
    <div className="relative mb-3">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none"
        width="16" height="16" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>

      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Tìm truyện..."
        className="w-full pl-9 pr-9 py-2.5 rounded-chip bg-white border-2 border-brand-border
                   font-body text-sm text-brand-text placeholder:text-brand-muted
                   focus:outline-none focus:border-brand-primary transition-colors"
      />

      {value && (
        <button
          onClick={() => onChange('')}
          aria-label="Xoá tìm kiếm"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-body transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  )
}
