import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

/**
 * Full-screen standalone shell for Login/Register - deliberately NOT
 * nested inside the app's normal sidebar/header Layout (see App.tsx: a
 * casino site's own login screen doesn't show its own lobby nav around
 * the form). The decorative left panel uses only real brand assets
 * (the spinning logo video, the accent color token) plus lightweight
 * CSS-drawn suit glyphs for depth - no fabricated illustration assets
 * exist for this brand, so this doesn't try to fake the elaborate 3D
 * scene a reference design might show.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-surface-900">
      <header className="h-16 shrink-0 flex items-center justify-between px-4 sm:px-6 border-b border-surface-700">
        <Link to="/" className="flex items-center gap-2 font-extrabold text-lg tracking-tight">
          <img src="/betqueen-logo.png" alt="" className="w-8 h-8 rounded-full" />
          <span className="text-accent-400">Bet</span>Queen
        </Link>
        <Link
          to="/"
          aria-label="Back to lobby"
          className="w-9 h-9 flex items-center justify-center rounded-md bg-surface-700 hover:bg-surface-600 text-surface-50/80 transition-colors"
        >
          ⌂
        </Link>
      </header>

      <div className="flex-1 flex">
        {/* Decorative panel - hidden below lg, where there's no room for
            it beside the form. */}
        <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden">
          <div
            className="absolute inset-0"
            style={{ background: 'radial-gradient(circle at 50% 35%, rgba(242,193,78,0.16), transparent 60%)' }}
          />
          <span className="auth-float absolute text-4xl text-accent-400/25" style={{ top: '18%', left: '22%', animationDelay: '0s' }}>♠</span>
          <span className="auth-float absolute text-3xl text-accent-400/20" style={{ top: '68%', left: '18%', animationDelay: '1.3s' }}>♦</span>
          <span className="auth-float absolute text-5xl text-accent-400/20" style={{ top: '22%', right: '20%', animationDelay: '0.7s' }}>♥</span>
          <span className="auth-float absolute text-3xl text-accent-400/25" style={{ bottom: '20%', right: '24%', animationDelay: '2s' }}>♣</span>

          <video
            src="/betqueen-spin.webm"
            poster="/betqueen-logo.png"
            autoPlay
            loop
            muted
            playsInline
            className="relative w-64 h-64 xl:w-80 xl:h-80"
            style={{ filter: 'drop-shadow(0 0 60px rgba(242,193,78,0.35))' }}
          />
        </div>

        {/* Form panel */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-sm">
            {/* Only shown when the decorative panel above is hidden (the
                brand mark would otherwise disappear entirely below lg). */}
            <video
              src="/betqueen-spin.webm"
              poster="/betqueen-logo.png"
              autoPlay
              loop
              muted
              playsInline
              className="lg:hidden w-20 h-20 mx-auto mb-4"
            />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
