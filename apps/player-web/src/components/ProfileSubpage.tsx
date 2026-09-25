import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function ProfileSubpage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="max-w-2xl space-y-4">
      <Link to="/profile" className="inline-flex items-center gap-1 text-sm text-surface-50/60 hover:text-surface-50">
        <ChevronLeft className="w-4 h-4" />
        Profile
      </Link>
      <h1 className="text-xl font-bold">{title}</h1>
      {children}
    </div>
  );
}
