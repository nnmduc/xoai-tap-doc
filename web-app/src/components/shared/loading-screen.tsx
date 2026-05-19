export function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 bg-brand-bg">
      <div className="w-14 h-14 border-4 border-brand-border border-t-brand-primary rounded-full animate-spin" />
      <p className="font-heading text-lg font-bold text-brand-muted">Đang tải thư viện...</p>
    </div>
  )
}
