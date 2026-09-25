import React, { useCallback, useEffect, useState } from 'react';
import { Card, Table, Modal, Button } from '../../../common/UI';
import { Select } from '../../../common/Forms';
import { listKyc, getKyc, updateKycStatus, kycImageUrl } from '../../../../services/api/kyc';

// Admin review queue for the KYC flow apps/player-web's Profile >
// Verification page submits into - mirrors Payments' Withdrawal
// Management list+detail+approve/reject shape. Deliberately minimal:
// a list, a detail/review panel, approve/reject buttons - no separate
// new phase.

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
];

const STATUS_BADGE: Record<string, string> = {
  PENDING: 'bg-warning-light text-warning',
  APPROVED: 'bg-success-light text-success',
  REJECTED: 'bg-error-light text-error',
};

const DOCUMENT_LABEL: Record<string, string> = {
  PASSPORT: 'Passport',
  DRIVERS_LICENSE: "Driver's License",
  NATIONAL_ID: 'National ID Card',
};

function StatusBadge({ status }: { status: string }) {
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_BADGE[status] || 'bg-navy-800/10 text-navy-800'}`}>{status}</span>;
}

function ImageThumb({ id, which, label }: { id: string; which: 'front' | 'back' | 'selfie'; label: string }) {
  return (
    <div>
      <p className="text-xs text-navy-800/60 mb-1">{label}</p>
      <img
        src={kycImageUrl(id, which)}
        alt={label}
        className="w-full h-40 object-cover rounded border border-primary-100 bg-primary-50"
      />
    </div>
  );
}

const Verification = () => {
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [rows, setRows] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [actionError, setActionError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchList = useCallback(() => {
    setLoading(true);
    setError('');
    listKyc({ status: statusFilter !== 'all' ? statusFilter : undefined }, { page: 1, limit: 50 })
      .then((res) => {
        setRows(res.nodes);
        setTotalCount(res.totalCount);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const openDetail = (id: string) => {
    setSelectedId(id);
    setDetail(null);
    setShowRejectForm(false);
    setRejectReason('');
    setActionError('');
    setDetailLoading(true);
    getKyc(id)
      .then(setDetail)
      .catch((err) => setActionError(err.message))
      .finally(() => setDetailLoading(false));
  };

  const closeDetail = () => setSelectedId(null);

  const handleApprove = async () => {
    if (!selectedId) return;
    setSubmitting(true);
    setActionError('');
    try {
      await updateKycStatus(selectedId, { status: 'APPROVED' });
      closeDetail();
      fetchList();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedId) return;
    if (!rejectReason.trim()) {
      setActionError('A rejection reason is required.');
      return;
    }
    setSubmitting(true);
    setActionError('');
    try {
      await updateKycStatus(selectedId, { status: 'REJECTED', rejectionReason: rejectReason.trim() });
      closeDetail();
      fetchList();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: 'username', label: 'Player', render: (_: any, row: any) => row.username || row.email || row.playerId },
    { key: 'documentType', label: 'Document', render: (v: string) => DOCUMENT_LABEL[v] || v },
    { key: 'documentNumber', label: 'Document #' },
    { key: 'status', label: 'Status', render: (v: string) => <StatusBadge status={v} /> },
    { key: 'createdAt', label: 'Submitted', render: (v: string) => new Date(v).toLocaleString() },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_: any, row: any) => (
        <button onClick={() => openDetail(row.id)} className="px-3 py-1 bg-primary-600 text-white rounded text-sm hover:bg-primary-700">
          Review
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-navy-900">Verification</h2>
            <p className="text-sm text-navy-800/60">{totalCount} submission{totalCount === 1 ? '' : 's'}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Select name="status" label="Status" value={statusFilter} onChange={(e: any) => setStatusFilter(e.target.value)} options={STATUS_OPTIONS} />
          </div>

          {loading ? (
            <div className="animate-pulse">
              <div className="h-10 bg-primary-50 rounded mb-4" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-primary-50 rounded mb-2" />
              ))}
            </div>
          ) : error ? (
            <div className="text-error">{error}</div>
          ) : (
            <Table columns={columns} data={rows} emptyMessage="No KYC submissions found" />
          )}
        </div>
      </Card>

      <Modal isOpen={!!selectedId} onClose={closeDetail} title="Verification review" size="lg">
        {detailLoading || !detail ? (
          <p className="text-sm text-navy-800/60">Loading…</p>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-navy-800/50">Player</p>
                <p className="font-medium">{detail.username || detail.email || detail.playerId}</p>
              </div>
              <div>
                <p className="text-navy-800/50">Status</p>
                <StatusBadge status={detail.status} />
              </div>
              <div>
                <p className="text-navy-800/50">Document type</p>
                <p className="font-medium">{DOCUMENT_LABEL[detail.documentType] || detail.documentType}</p>
              </div>
              <div>
                <p className="text-navy-800/50">Document number</p>
                <p className="font-medium">{detail.documentNumber}</p>
              </div>
              <div>
                <p className="text-navy-800/50">Expiry date</p>
                <p className="font-medium">{detail.expiryDate}</p>
              </div>
              <div>
                <p className="text-navy-800/50">Submitted</p>
                <p className="font-medium">{new Date(detail.createdAt).toLocaleString()}</p>
              </div>
            </div>

            {detail.status === 'REJECTED' && detail.rejectionReason && (
              <div className="rounded bg-error-light text-error text-sm p-3">{detail.rejectionReason}</div>
            )}

            <div className="grid grid-cols-3 gap-3">
              <ImageThumb id={detail.id} which="front" label="Front" />
              <ImageThumb id={detail.id} which="back" label="Back" />
              <ImageThumb id={detail.id} which="selfie" label="Selfie" />
            </div>

            {actionError && <p className="text-error text-sm">{actionError}</p>}

            {detail.status === 'PENDING' && (
              <div className="space-y-3 pt-2 border-t border-primary-100">
                {showRejectForm ? (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-navy-800/70">Rejection reason (required)</label>
                    <textarea
                      className="w-full rounded-md border border-primary-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                      rows={3}
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Explain why this submission was rejected…"
                    />
                    <div className="flex justify-end gap-3">
                      <Button variant="secondary" onClick={() => setShowRejectForm(false)} disabled={submitting}>
                        Cancel
                      </Button>
                      <Button variant="danger" onClick={handleReject} disabled={submitting || !rejectReason.trim()}>
                        {submitting ? 'Rejecting…' : 'Confirm reject'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end gap-3">
                    <Button variant="danger" onClick={() => setShowRejectForm(true)} disabled={submitting}>
                      Reject
                    </Button>
                    <Button variant="success" onClick={handleApprove} disabled={submitting}>
                      {submitting ? 'Approving…' : 'Approve'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Verification;
