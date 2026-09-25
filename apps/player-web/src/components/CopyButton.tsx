import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export default function CopyButton({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can be denied by the browser - nothing to
      // recover, the value is still visible for the player to select.
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={label ? `Copy ${label}` : 'Copy'}
      title={label ? `Copy ${label}` : 'Copy'}
      className="inline-flex items-center justify-center w-6 h-6 shrink-0 rounded text-surface-50/50 hover:text-accent-400 hover:bg-surface-700"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-win" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}
