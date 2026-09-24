import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useTheme } from '../../../../context/ThemeContext';
import { getPlayer, getLinkedAccounts, updatePlayer } from '../../../../services/api/players';
import type { LinkedAccount } from '../../../../services/api/players';
import PopupLayout from '../../../common/Layout/PopupLayout';
import Breadcrumb from '../../../common/UI/Breadcrumb';
import { SectionHeader, DataRow, SummaryRow } from './MemberProfile/ProfileUIComponents';
import EditModals from './MemberProfile/EditModals';

const formatDateTime = (iso) => (iso ? new Date(iso).toLocaleString() : '-');
const formatDate = (iso) => (iso ? new Date(iso).toISOString().slice(0, 10) : '');
const formatMoney = (n) => (n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Matches services/backoffice-api/src/roles.ts... no - matches the
// PlayerStatus/PlayerVipLevel enums the players table's CHECK
// constraints enforce (services/backoffice-api/migrations/
// 20260406000010_create-players.cjs).
const VIP_LEVELS = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'];
const STATUSES = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'BANNED', 'PENDING'];

const MemberProfile = ({ memberId, isPopup = false }) => {
  const { id } = useParams();
  const { isDarkTheme } = useTheme();

  // Use passed memberId or get from params
  const currentMemberId = memberId || id;

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!currentMemberId) return;
    try {
      setLoading(true);
      const data = await getPlayer(currentMemberId);
      setUser(data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [currentMemberId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Other accounts sharing a device fingerprint with this one - the real
  // fraud/multi-account signal apps/player-web's client-side fingerprint
  // collection exists for (see services/backoffice-api's
  // PlayersService.getLinkedAccounts). Loaded separately from the main
  // profile so a slow/failed lookup here never blocks the rest of the
  // page - failing open (empty list) rather than surfacing this as a
  // page-level error.
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [linkedAccountsLoading, setLinkedAccountsLoading] = useState(true);

  useEffect(() => {
    if (!currentMemberId) return undefined;
    let cancelled = false;
    setLinkedAccountsLoading(true);
    getLinkedAccounts(currentMemberId)
      .then((accounts) => {
        if (!cancelled) setLinkedAccounts(accounts);
      })
      .catch(() => {
        if (!cancelled) setLinkedAccounts([]);
      })
      .finally(() => {
        if (!cancelled) setLinkedAccountsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [currentMemberId]);

  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState({
    general: true,
    contact: true,
    action: true,
    devices: true,
    summary: true,
    balance: true,
  });

  const [editModals, setEditModals] = useState({
    general: false,
    status: false,
    contact: false,
  });

  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    birthday: '',
    vip: 'BRONZE',
    status: 'ACTIVE',
    phoneNumber1: '',
    email: '',
  });
  const [saveError, setSaveError] = useState(null);

  // Re-sync the edit form whenever fresh member data arrives (initial load,
  // or after a save), so modals always open pre-filled with real values.
  useEffect(() => {
    if (user) {
      setEditData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        birthday: formatDate(user.dateOfBirth),
        vip: user.vipLevel || 'BRONZE',
        status: user.status || 'ACTIVE',
        phoneNumber1: user.phone || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleEditModal = (modal) => {
    setSaveError(null);
    setEditModals((prev) => ({
      ...prev,
      [modal]: !prev[modal],
    }));
  };

  const handleInputChange = (field, value) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const runUpdate = async (input, modal) => {
    try {
      setSaveError(null);
      setSaving(true);
      await updatePlayer(currentMemberId, input);
      await loadProfile();
      toggleEditModal(modal);
    } catch (err: any) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // General modal -> firstName/lastName/dateOfBirth/vipLevel are real
  // UpdatePlayerDto fields. Password, gender, marital status, VIP
  // experience adjustment, group membership and user remark have no
  // backend equivalent (see EditModals.js) and are not sent.
  const handleSaveGeneral = () => runUpdate({
    firstName: editData.firstName || undefined,
    lastName: editData.lastName || undefined,
    dateOfBirth: editData.birthday ? new Date(editData.birthday).toISOString() : undefined,
    vipLevel: editData.vip,
  }, 'general');

  const handleSaveStatus = () => runUpdate({ status: editData.status }, 'status');

  // Contact modal -> only `phone` (phoneNumber1) and `email` map to real
  // fields; the backend has a single phone field, so phoneNumber2/3 have
  // nothing to save to.
  const handleSaveContact = () => runUpdate({
    phone: editData.phoneNumber1 || undefined,
    email: editData.email || undefined,
  }, 'contact');

  if (loading && !user) {
    return (
      <div className={`p-3 ${isDarkTheme ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
        <div className="animate-pulse text-sm text-gray-500">Loading member…</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className={`p-3 ${isDarkTheme ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
        <div className="text-sm text-red-500">
          {error ? `Failed to load member: ${error.message}` : 'Member not found.'}
        </div>
      </div>
    );
  }

  const stats = user.statistics || {};

  const ProfileContent = (
    <div className={`p-3 ${isDarkTheme ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      {/* Breadcrumb */}
      <div className="mb-3">
        <Breadcrumb />
      </div>

      {/* Page Title */}
      <h1 className={`text-lg font-semibold mb-3 ${isDarkTheme ? 'text-gray-100' : 'text-gray-900'}`}>
        Profile
      </h1>

      {/* Profile Content */}
      <div className="space-y-3">
        {/* General Section */}
        <div className={`${isDarkTheme ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm`}>
          <SectionHeader
            title="General"
            isExpanded={expandedSections.general}
            onToggle={() => toggleSection('general')}
            editButton={true}
            onEdit={() => toggleEditModal('general')}
          />

          {expandedSections.general && (
            <div className="space-y-0">
              <DataRow label="Username" value={user.username || '-'} />
              <DataRow label="Full Name" value={user.fullName} />
              <DataRow label="Birthday" value={user.dateOfBirth ? formatDate(user.dateOfBirth) : '-'} />
              <DataRow label="VIP Level" value={user.vipLevel} />
              {/* Custom Status Row with Edit Button */}
              <div className={`grid grid-cols-12 border-b transition-colors duration-200 hover:bg-gray-50 ${
                isDarkTheme ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200'
              }`}>
                <div className={`col-span-2 px-1.5 py-1 text-xs font-medium flex items-center ${
                  isDarkTheme ? 'text-gray-300 bg-gray-700' : 'text-gray-700 bg-gray-50'
                }`}>
                  Status
                  <button
                    onClick={() => toggleEditModal('status')}
                    className="ml-2 px-1 py-0.5 text-xs bg-primary-600 text-white rounded hover:bg-primary-700"
                  >
                    Edit
                  </button>
                </div>
                <div className={`col-span-10 px-1.5 py-1 text-xs ${
                  isDarkTheme ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <span className={`px-2 py-1 text-xs rounded ${
                    user.status === 'ACTIVE' ? 'bg-green-100 text-green-800'
                      : user.status === 'SUSPENDED' || user.status === 'BANNED' ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>{user.status}</span>
                </div>
              </div>
              <DataRow label="Currency" value={user.currency || '-'} />
              <DataRow label="Country" value={user.country || '-'} />
              {/* Fields with no backend equivalent (group, affiliate URL, user/risk
                  remarks, channel/referral info, gender, marital status) are
                  dropped rather than shown with fabricated values. */}
            </div>
          )}
        </div>

        {/* Contact Section */}
        <div className={`${isDarkTheme ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm`}>
          <SectionHeader
            title="Contact"
            isExpanded={expandedSections.contact}
            onToggle={() => toggleSection('contact')}
            editButton={true}
            onEdit={() => toggleEditModal('contact')}
          />

          {expandedSections.contact && (
            <div className="space-y-0">
              <DataRow label="Phone Number" value={user.phone || '-'} centerAlign={true} />
              <DataRow label="Email" value={user.email} centerAlign={true} />
            </div>
          )}
        </div>

        {/* Action Section */}
        <div className={`${isDarkTheme ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm`}>
          <SectionHeader
            title="Action"
            isExpanded={expandedSections.action}
            onToggle={() => toggleSection('action')}
          />

          {expandedSections.action && (
            <div className="space-y-0">
              <DataRow label="Registration Time" value={formatDateTime(user.createdAt)} centerAlign={true} />
              <DataRow label="Last Login Time" value={formatDateTime(user.lastLoginAt)} centerAlign={true} />
              <DataRow label="Last Login IP" value={user.lastLoginIP || '-'} centerAlign={true} />
              {/* Server-derived from last_login_ip (geolocation) / the login
                  request's User-Agent (device classification) - see
                  services/player-api/src/login-context.ts. */}
              <DataRow label="Last Login Location" value={user.lastLoginCountry || '-'} centerAlign={true} />
              <DataRow label="Last Login Device" value={user.lastLoginDevice || '-'} centerAlign={true} />
              {/* First/last deposit, withdrawal, adjustment, bonus and bet
                  timestamps aren't tracked yet - only aggregate totals are. */}
            </div>
          )}
        </div>

        {/* Devices & Linked Accounts Section - real device-fingerprint
            based fraud/multi-account signal (see services/backoffice-
            api's PlayersService.getLinkedAccounts and this file's own
            linkedAccounts effect). Only ever shows accounts that share an
            actual client-computed device fingerprint - never a guess. */}
        <div className={`${isDarkTheme ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm`}>
          <SectionHeader
            title="Linked Accounts"
            isExpanded={expandedSections.devices}
            onToggle={() => toggleSection('devices')}
          />

          {expandedSections.devices && (
            <div className="p-1.5">
              {linkedAccountsLoading && (
                <div className={`text-xs ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>Checking for shared devices…</div>
              )}
              {!linkedAccountsLoading && linkedAccounts.length === 0 && (
                <div className={`text-xs ${isDarkTheme ? 'text-gray-400' : 'text-gray-500'}`}>
                  No other account has logged in from a device this member has used.
                </div>
              )}
              {!linkedAccountsLoading && linkedAccounts.length > 0 && (
                <div className="space-y-1">
                  <div className={`text-xs font-medium mb-1 ${isDarkTheme ? 'text-yellow-400' : 'text-yellow-700'}`}>
                    ⚠ {linkedAccounts.length} other account{linkedAccounts.length === 1 ? '' : 's'} share{linkedAccounts.length === 1 ? 's' : ''} a device with this member
                  </div>
                  {linkedAccounts.map((account) => (
                    <a
                      key={account.playerId}
                      href={`/members/profile/${account.playerId}`}
                      target="_blank"
                      rel="noreferrer"
                      className={`flex items-center justify-between px-2 py-1 text-xs rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        isDarkTheme ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      <span>{account.username || account.email}</span>
                      <span className={isDarkTheme ? 'text-gray-500' : 'text-gray-400'}>
                        {account.sharedFingerprints} shared device{account.sharedFingerprints === 1 ? '' : 's'} · last seen {formatDateTime(account.lastSeenAt)}
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Summary Section */}
        <div className={`${isDarkTheme ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm`}>
          <SectionHeader
            title="Summary"
            isExpanded={expandedSections.summary}
            onToggle={() => toggleSection('summary')}
          />

          {expandedSections.summary && (
            <div className="p-1.5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <h4 className={`text-xs font-semibold mb-1 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                    Amount
                  </h4>
                  <div className="space-y-0">
                    <SummaryRow label="Total Deposits" value={formatMoney(user.totalDeposits)} />
                    <SummaryRow label="Total Withdrawals" value={formatMoney(user.totalWithdrawals)} />
                    <SummaryRow label="Total Bet Amount" value={formatMoney(user.totalBets)} />
                    <SummaryRow label="Total Win Amount" value={formatMoney(user.totalWins)} />
                    <SummaryRow
                      label="Profit / Loss"
                      value={formatMoney(stats.profitLoss)}
                      isNegative={(stats.profitLoss ?? 0) < 0}
                    />
                  </div>
                </div>

                <div>
                  <h4 className={`text-xs font-semibold mb-1 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                    Count
                  </h4>
                  <div className="space-y-0">
                    <SummaryRow label="Total Transactions" value={(stats.totalTransactions ?? 0).toLocaleString()} />
                  </div>
                </div>

                <div>
                  <h4 className={`text-xs font-semibold mb-1 ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                    Statistics
                  </h4>
                  <div className="space-y-0">
                    <SummaryRow label="Win Rate" value={`${(stats.winRate ?? 0).toFixed(1)}%`} />
                    <SummaryRow label="Average Bet" value={formatMoney(stats.averageBetAmount)} />
                    <SummaryRow label="Risk Score" value={stats.riskScore ?? 0} />
                    <SummaryRow label="Last Activity" value={formatDateTime(user.lastLoginAt)} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Balance Section */}
        <div className={`${isDarkTheme ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm`}>
          <SectionHeader
            title="Balance"
            isExpanded={expandedSections.balance}
            onToggle={() => toggleSection('balance')}
          />

          {expandedSections.balance && (
            <div className="p-1.5">
              {/* Main Balance */}
              <div className="mb-1.5">
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`text-xs font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                    Main Balance
                  </span>
                  <span className={`text-xs ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                    {formatMoney(user.balance)} {user.currency}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs font-medium ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                    Bonus Balance
                  </span>
                  <span className={`text-xs ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                    {formatMoney(user.bonusBalance)} {user.currency}
                  </span>
                </div>
              </div>

              {/* Provider Accounts - no per-provider wallet/linkage concept
                  exists yet, so this stays a clearly-labeled placeholder. */}
              <div className={`text-xs italic p-2 rounded ${isDarkTheme ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                Provider-account balances are not implemented yet. Not shown.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modals */}
      <EditModals
        editModals={editModals}
        editData={editData}
        toggleEditModal={toggleEditModal}
        handleInputChange={handleInputChange}
        onSaveGeneral={handleSaveGeneral}
        onSaveStatus={handleSaveStatus}
        onSaveContact={handleSaveContact}
        saving={saving}
        saveError={saveError}
        vipLevels={VIP_LEVELS}
        statuses={STATUSES}
      />
    </div>
  );

  // Render with or without PopupLayout based on isPopup prop
  if (isPopup) {
    return (
      <PopupLayout>
        {ProfileContent}
      </PopupLayout>
    );
  }

  return ProfileContent;
};

export default MemberProfile;
