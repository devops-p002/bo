import { useState, useEffect, useCallback } from 'react';
import { useNotification } from '../../../../context/NotificationContext';
import { createPlayer, listPlayers } from '../../../../services/api/players';

const EMPTY_ADD_FORM = {
  username: '',
  email: '',
  firstName: '',
  lastName: '',
  phone: '',
  vipLevel: 'BRONZE',
};

const DEFAULT_ACCOUNT_COLUMNS = {
  registrationTime: true,
  username: true,
  name: true,
  email: true,
  phone: true,
  dateOfBirth: true,
  vip: true,
  status: true,
  totalBalance: true,
  lastLoginIp: true,
  lastLoginTime: true,
  currencyType: true,
};

const DEFAULT_PROVIDER_COLUMNS = {
  createTime: true,
  provider: true,
  providerAccount: true,
  username: true,
  name: true,
  email: true,
  phone: true,
  dateOfBirth: true,
  vip: true,
  vipExperience: true,
  affiliateUrl: true,
  status: true,
  totalBalance: true,
  signUp: true,
  lastLoginIp: true,
};

// Column checkbox preference persists for this browser session only (not
// permanently) - sessionStorage, not localStorage, per the requested
// behavior.
const COLUMNS_STORAGE_KEY = 'bo_member_search_columns';

function readStoredColumns(): { account?: Record<string, boolean>; provider?: Record<string, boolean> } {
  try {
    const raw = sessionStorage.getItem(COLUMNS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

const ACCOUNT_COLUMN_LABELS: Record<string, string> = {
  registrationTime: 'Registration Time',
  username: 'Username',
  name: 'Name',
  email: 'Email',
  phone: 'Phone',
  dateOfBirth: 'Date of Birth',
  vip: 'VIP',
  status: 'Status',
  totalBalance: 'Total Balance',
  lastLoginIp: 'Last Login IP',
  lastLoginTime: 'Last Login Time',
  currencyType: 'Currency Type',
};

const ACCOUNT_COLUMN_VALUE: Record<string, (row: any) => string> = {
  registrationTime: (row) => (row.createdAt ? new Date(row.createdAt).toLocaleString() : ''),
  username: (row) => row.username || row.email || '',
  name: (row) => row.fullName || '',
  email: (row) => row.email || '',
  phone: (row) => row.phone || '',
  dateOfBirth: (row) => (row.dateOfBirth ? new Date(row.dateOfBirth).toLocaleDateString() : ''),
  vip: (row) => row.vipLevel || '',
  status: (row) => row.status || '',
  totalBalance: (row) => String(row.balance ?? 0),
  lastLoginIp: (row) => row.lastLoginIP || '',
  lastLoginTime: (row) => (row.lastLoginAt ? new Date(row.lastLoginAt).toLocaleString() : ''),
  currencyType: (row) => row.currency || '',
};

export const useMemberSearch = () => {
  const notification = useNotification();
  const [activeTab, setActiveTab] = useState('Account');
  const [isConditionPanelOpen, setIsConditionPanelOpen] = useState(true);

  const [searchData, setSearchData] = useState({
    username: '',
    fullName: '',
    vip: 'All',
    lastDepositSince: '',
    lastBetTimeSince: '',
    noLoginSince: '',
    lastLoginIP: '',
    email: '',
    phoneNumber: '',
    phoneNumberType: 'All',
    registeredDateFrom: '',
    registeredDateTo: '',
    dateOfBirthFrom: '',
    dateOfBirthTo: '',
    lastLoginSince: '',
    searchType: 'Normal',
    currencyType: 'All',
    accountStatus: 'All',
    channelType: 'All',
    channelCode: ''
  });

  // Provider Account specific data
  const [providerData, setProviderData] = useState({
    provider: 'AWC',
    providerAccount: '',
    currencyType: 'BDT',
    createdTimeFrom: '',
    createdTimeTo: ''
  });

  // Table controls state
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showColumnsDropdown, setShowColumnsDropdown] = useState(false);

  // The filter actually sent to the query - only updated when "Search" is
  // clicked (not on every keystroke), same UX as before.
  const [appliedFilter, setAppliedFilter] = useState<any>({});

  // Column visibility state for Account tab. Columns with no backend
  // equivalent (vipExperience, vipPoint, affiliateUrl, signUp, lastDeposit,
  // lastBetTime, channelType, channelName) were dropped - see report.
  // Seeded from sessionStorage so a saved preference survives navigating
  // away and back within the same browser session.
  const [visibleAccountColumns, setVisibleAccountColumns] = useState(
    () => readStoredColumns().account ?? DEFAULT_ACCOUNT_COLUMNS,
  );

  // Column visibility state for Provider Account tab (mock data only - see
  // ProviderAccountSearchForm/SearchResultsTable notes; kept as-is).
  const [visibleProviderColumns, setVisibleProviderColumns] = useState(
    () => readStoredColumns().provider ?? DEFAULT_PROVIDER_COLUMNS,
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is outside the entire dropdown container
      const dropdownContainer = event.target.closest('.columns-dropdown-container');
      const dropdownContent = event.target.closest('.columns-dropdown-content');

      if (!dropdownContainer && !dropdownContent) {
        setShowColumnsDropdown(false);
      }
    };

    if (showColumnsDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showColumnsDropdown]);

  const [results, setResults] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState<any>(null);
  const totalPages = Math.max(1, Math.ceil(totalCount / recordsPerPage));

  // Bumped after a successful "Add Member" so the results effect below
  // re-runs even when the filter/page/limit haven't changed - the new
  // member shows up without the admin having to re-trigger Search.
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    if (activeTab !== 'Account') return undefined;
    let cancelled = false;

    setResultsLoading(true);
    listPlayers(appliedFilter, { page: currentPage, limit: recordsPerPage })
      .then((data) => {
        if (cancelled) return;
        setResults(data.nodes ?? []);
        setTotalCount(data.totalCount ?? 0);
        setResultsError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setResultsError(err);
      })
      .finally(() => {
        if (!cancelled) setResultsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab, appliedFilter, currentPage, recordsPerPage, refreshToken]);

  // Add Member modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState(EMPTY_ADD_FORM);
  const [addSaving, setAddSaving] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const openAddModal = useCallback(() => {
    setAddFormData(EMPTY_ADD_FORM);
    setAddError(null);
    setIsAddModalOpen(true);
  }, []);

  const closeAddModal = useCallback(() => {
    if (addSaving) return;
    setIsAddModalOpen(false);
  }, [addSaving]);

  const handleAddInputChange = useCallback((field: string, value: string) => {
    setAddFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleAddSubmit = useCallback(async () => {
    if (!addFormData.email.trim()) {
      setAddError('Email is required.');
      return;
    }
    try {
      setAddSaving(true);
      setAddError(null);
      await createPlayer({
        // Username is optional - identity and login are email-only;
        // username, when set, is just a display handle.
        username: addFormData.username.trim() || undefined,
        email: addFormData.email.trim(),
        firstName: addFormData.firstName.trim() || undefined,
        lastName: addFormData.lastName.trim() || undefined,
        phone: addFormData.phone.trim() || undefined,
        vipLevel: addFormData.vipLevel,
      });
      notification.success(`Member "${addFormData.username.trim() || addFormData.email}" created.`);
      setIsAddModalOpen(false);
      setRefreshToken((n) => n + 1);
    } catch (err: any) {
      setAddError(err.message || 'Failed to create member.');
    } finally {
      setAddSaving(false);
    }
  }, [addFormData, notification]);

  // Handlers
  const handleInputChange = (field, value) => {
    setSearchData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProviderInputChange = (field, value) => {
    setProviderData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRecordsPerPageChange = (value) => {
    setRecordsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  // Exports exactly what's on screen: the currently-loaded results page,
  // limited to whichever columns are currently checked visible. Provider
  // Account has no real data to export (mock only - see
  // SearchResultsTable's own notice for that tab).
  const handleExport = useCallback(() => {
    if (activeTab !== 'Account') {
      notification.info('Export is not available for Provider Account - it has no real backend data.');
      return;
    }
    if (results.length === 0) {
      notification.info('No results to export.');
      return;
    }
    const columns = Object.keys(ACCOUNT_COLUMN_LABELS).filter((key) => visibleAccountColumns[key]);
    const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const headerRow = columns.map((key) => escape(ACCOUNT_COLUMN_LABELS[key])).join(',');
    const dataRows = results.map((row) => columns.map((key) => escape(ACCOUNT_COLUMN_VALUE[key](row))).join(','));
    const csvContent = [headerRow, ...dataRows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `member-search_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [activeTab, results, visibleAccountColumns, notification]);

  const handleColumnToggle = (column) => {
    if (activeTab === 'Account') {
      setVisibleAccountColumns(prev => ({
        ...prev,
        [column]: !prev[column]
      }));
    } else {
      setVisibleProviderColumns(prev => ({
        ...prev,
        [column]: !prev[column]
      }));
    }
  };

  const handleSave = useCallback(() => {
    try {
      sessionStorage.setItem(
        COLUMNS_STORAGE_KEY,
        JSON.stringify({ account: visibleAccountColumns, provider: visibleProviderColumns }),
      );
      notification.success('Column preferences saved for this session.');
    } catch {
      notification.error('Could not save column preferences.');
    }
  }, [notification, visibleAccountColumns, visibleProviderColumns]);

  // Builds the real filter this app's REST API accepts (services/backoffice-api's
  // GET /players). Fields with no backend equivalent (lastDepositSince,
  // lastBetTimeSince, noLoginSince, lastLoginIP, phoneNumberType,
  // dateOfBirthFrom/To, lastLoginSince, searchType, currencyType,
  // channelType, channelCode) are ignored here - they're disabled in
  // AccountSearchForm so the UI doesn't pretend they filter anything.
  // fullName/phone now match real columns (see players.service.ts) now
  // that apps/player-web's "Complete your profile" page can populate them.
  const buildFilter = () => {
    const filter: any = {};
    const search = searchData.username?.trim() || searchData.email?.trim();
    if (search) filter.search = search;
    if (searchData.fullName?.trim()) filter.fullName = searchData.fullName.trim();
    if (searchData.phoneNumber?.trim()) filter.phone = searchData.phoneNumber.trim();
    if (searchData.accountStatus && searchData.accountStatus !== 'All') {
      filter.status = searchData.accountStatus;
    }
    if (searchData.vip && searchData.vip !== 'All') {
      filter.vipLevel = searchData.vip;
    }
    if (searchData.registeredDateFrom && searchData.registeredDateTo) {
      filter.dateRangeStart = new Date(searchData.registeredDateFrom).toISOString();
      filter.dateRangeEnd = new Date(searchData.registeredDateTo).toISOString();
    }
    return filter;
  };

  const handleSearch = () => {
    if (activeTab === 'Account') {
      setAppliedFilter(buildFilter());
      setCurrentPage(1);
    }
    // Provider Account tab has no backend equivalent to search against
    // (see ProviderAccountSearchForm) - nothing to wire here.
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const resetForm = () => {
    if (activeTab === 'Account') {
      setSearchData({
        username: '',
        fullName: '',
        vip: 'All',
        lastDepositSince: '',
        lastBetTimeSince: '',
        noLoginSince: '',
        lastLoginIP: '',
        email: '',
        phoneNumber: '',
        phoneNumberType: 'All',
        registeredDateFrom: '',
        registeredDateTo: '',
        dateOfBirthFrom: '',
        dateOfBirthTo: '',
        lastLoginSince: '',
        searchType: 'Normal',
        currencyType: 'All',
        accountStatus: 'All',
        channelType: 'All',
        channelCode: ''
      });
      setAppliedFilter({});
      setCurrentPage(1);
    } else {
      setProviderData({
        provider: 'AWC',
        providerAccount: '',
        currencyType: 'BDT',
        createdTimeFrom: '',
        createdTimeTo: ''
      });
    }
  };

  // Navigation function for username clicks - takes the member's real id
  // (not username: the profile route is /members/profile/:id and the
  // backend looks members up by id, not username).
  const handleUsernameClick = (id) => {
    // Open member profile page in new window
    window.open(`/members/profile/${id}`, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
  };

  return {
    // State
    activeTab,
    isConditionPanelOpen,
    searchData,
    providerData,
    recordsPerPage,
    showColumnsDropdown,
    visibleAccountColumns,
    visibleProviderColumns,

    // Search results
    results,
    resultsLoading,
    resultsError,
    totalCount,
    currentPage,
    totalPages,
    goToPage,

    // Setters
    setActiveTab,
    setIsConditionPanelOpen,
    setShowColumnsDropdown,
    setVisibleAccountColumns,
    setVisibleProviderColumns,

    // Handlers
    handleInputChange,
    handleProviderInputChange,
    handleRecordsPerPageChange,
    handleExport,
    handleColumnToggle,
    handleSave,
    handleSearch,
    resetForm,
    handleUsernameClick,

    // Add Member modal
    isAddModalOpen,
    addFormData,
    addSaving,
    addError,
    openAddModal,
    closeAddModal,
    handleAddInputChange,
    handleAddSubmit
  };
};
