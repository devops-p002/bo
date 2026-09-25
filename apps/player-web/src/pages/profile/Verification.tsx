import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { BadgeCheck, Clock, ShieldAlert, Upload } from 'lucide-react';
import { getMyKycStatus, submitKyc } from '../../services/api/kyc';
import type { KycDocumentType, KycVerification } from '../../services/api/kyc';
import GlassIconBadge from '../../components/GlassIconBadge';
import ProfileSubpage from '../../components/ProfileSubpage';

const DOCUMENT_TYPES: { value: KycDocumentType; label: string }[] = [
  { value: 'PASSPORT', label: 'Passport' },
  { value: 'DRIVERS_LICENSE', label: "Driver's License" },
  { value: 'NATIONAL_ID', label: 'National ID Card' },
];

const REMINDERS = [
  'Make sure your document is valid and not expired.',
  'All four corners of the document must be visible in the photo.',
  'Take photos in good lighting - avoid glare and blur.',
  'The selfie must clearly show your face and the document together.',
  'Files must be JPG or PNG and under 3MB each.',
];

function FileField({ label, file, onChange }: { label: string; file: File | null; onChange: (file: File | null) => void }) {
  return (
    <div>
      <label className="form-label">{label}</label>
      <label className="flex items-center gap-3 rounded-md border border-dashed border-surface-600 bg-surface-700 px-3 py-3 text-sm cursor-pointer hover:border-accent-500 transition-colors">
        <Upload className="w-4 h-4 text-surface-50/50 shrink-0" />
        <span className="flex-1 truncate text-surface-50/70">{file ? file.name : 'Choose a JPG or PNG, up to 3MB'}</span>
        <input
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </label>
    </div>
  );
}

function StatusCard({ status, onResubmit }: { status: KycVerification; onResubmit: () => void }) {
  if (status.status === 'APPROVED') {
    return (
      <div className="card p-6 flex items-start gap-3">
        <GlassIconBadge icon={BadgeCheck} tone="success" size="lg" />
        <div>
          <p className="font-semibold">Verified</p>
          <p className="text-sm text-surface-50/60 mt-0.5">Your identity has been verified. No further action is needed.</p>
        </div>
      </div>
    );
  }

  if (status.status === 'REJECTED') {
    return (
      <div className="card p-6 space-y-4">
        <div className="flex items-start gap-3">
          <GlassIconBadge icon={ShieldAlert} tone="danger" size="lg" />
          <div>
            <p className="font-semibold">Verification rejected</p>
            <p className="text-sm text-surface-50/60 mt-0.5">{status.rejectionReason || 'Please review your submission and try again.'}</p>
          </div>
        </div>
        <button type="button" onClick={onResubmit} className="btn-accent w-full">
          Resubmit
        </button>
      </div>
    );
  }

  return (
    <div className="card p-6 flex items-start gap-3">
      <GlassIconBadge icon={Clock} tone="brand" size="lg" />
      <div>
        <p className="font-semibold">Under review</p>
        <p className="text-sm text-surface-50/60 mt-0.5">We're reviewing your submission - this usually takes 1-2 business days.</p>
      </div>
    </div>
  );
}

export default function Verification() {
  const [status, setStatus] = useState<KycVerification | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [documentType, setDocumentType] = useState<KycDocumentType>('PASSPORT');
  const [documentNumber, setDocumentNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [front, setFront] = useState<File | null>(null);
  const [back, setBack] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getMyKycStatus()
      .then(setStatus)
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!front || !back || !selfie) {
      setError('Please upload all three photos.');
      return;
    }
    setSubmitting(true);
    try {
      const result = await submitKyc({ documentType, documentNumber, expiryDate, front, back, selfie });
      setStatus(result);
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ProfileSubpage title="Verification">
        <p className="text-surface-50/50 text-sm">Loading…</p>
      </ProfileSubpage>
    );
  }

  if (status && !showForm) {
    return (
      <ProfileSubpage title="Verification">
        <StatusCard status={status} onResubmit={() => setShowForm(true)} />
      </ProfileSubpage>
    );
  }

  return (
    <ProfileSubpage title="Verification">
      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
          <div>
            <label className="form-label">Document type</label>
            <select className="form-input" value={documentType} onChange={(e) => setDocumentType(e.target.value as KycDocumentType)}>
              {DOCUMENT_TYPES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Document number</label>
            <input type="text" required className="form-input" value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} />
          </div>
          <div>
            <label className="form-label">Expiry date</label>
            <input type="date" required className="form-input" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
          </div>
          <FileField label="Front of document" file={front} onChange={setFront} />
          <FileField label="Back of document" file={back} onChange={setBack} />
          <FileField label="Selfie holding the document" file={selfie} onChange={setSelfie} />

          <div className="rounded-md bg-surface-700 border border-surface-600 p-4">
            <p className="text-sm font-semibold mb-2">Reminder</p>
            <ol className="space-y-1.5 text-sm text-surface-50/60 list-decimal list-inside">
              {REMINDERS.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ol>
          </div>

          {error && <p className="text-loss text-sm">{error}</p>}

          <div className="flex gap-3">
            {showForm && (
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost flex-1">
                Cancel
              </button>
            )}
            <button type="submit" disabled={submitting} className="btn-accent flex-1">
              {submitting ? 'Submitting…' : 'Submit for review'}
            </button>
          </div>
        </form>
      </div>

      <p className="text-xs text-surface-50/40">
        Having trouble verifying your identity? Contact support and we'll help you through it.
      </p>
    </ProfileSubpage>
  );
}
