import type { LucideIcon } from 'lucide-react';

export type GlassTone = 'brand' | 'success' | 'danger' | 'neutral';

// Frosted-glass circular badge wrapping a lucide icon - one shared
// component so every Profile page gets the same backdrop-blur/gradient/
// inner-highlight treatment instead of one-off styling per page. Tones
// map onto this app's own accent/win/loss/surface tokens
// (tailwind.config.js) - never a literal color.
const TONE_CLASSES: Record<GlassTone, string> = {
  brand: 'from-accent-400/30 to-accent-600/10 text-accent-400 ring-accent-400/20',
  success: 'from-win/30 to-win/5 text-win ring-win/20',
  danger: 'from-loss/30 to-loss/5 text-loss ring-loss/20',
  neutral: 'from-surface-50/20 to-surface-50/5 text-surface-50/70 ring-surface-50/10',
};

export default function GlassIconBadge({
  icon: Icon,
  tone = 'neutral',
  size = 'md',
}: {
  icon: LucideIcon;
  tone?: GlassTone;
  size?: 'sm' | 'md' | 'lg';
}) {
  const dimensions = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-9 h-9';
  const iconSize = size === 'sm' ? 'w-[15px] h-[15px]' : size === 'lg' ? 'w-5 h-5' : 'w-[18px] h-[18px]';

  return (
    <div
      className={`relative shrink-0 ${dimensions} rounded-full flex items-center justify-center bg-gradient-to-br backdrop-blur-md ring-1 ring-inset shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] ${TONE_CLASSES[tone]}`}
    >
      <Icon className={iconSize} strokeWidth={2} />
    </div>
  );
}
