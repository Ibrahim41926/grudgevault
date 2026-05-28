import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.72_0.19_310/12%)_0%,transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,oklch(0.62_0.24_25/8%)_0%,transparent_60%)]" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg,oklch(1 0 0),oklch(1 0 0) 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,oklch(1 0 0),oklch(1 0 0) 1px,transparent 1px,transparent 40px)',
        }}
      />

      {/* Logo */}
      <Link href="/" className="relative z-10 mb-8 flex items-center gap-2 group">
        <div className="w-10 h-10 rounded-xl gradient-bg border border-primary/30 flex items-center justify-center grudge-glow group-hover:scale-110 transition-transform">
          <span className="text-lg">🗡️</span>
        </div>
        <span className="text-xl font-bold gradient-text tracking-tight">GrudgeVault</span>
      </Link>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="grudge-glass rounded-2xl p-8 grudge-glow">
          {children}
        </div>
      </div>

      <p className="relative z-10 mt-6 text-xs text-muted-foreground italic">
        "Le pardon reste optionnel."
      </p>
    </div>
  )
}
