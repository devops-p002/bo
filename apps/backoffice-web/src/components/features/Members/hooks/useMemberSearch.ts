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
  const [visibleAccountColumns, setVisibleAccountColumns] = useState({
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
    currencyType: true
  });

  // Column visibility state for Provider Account tab (mock data only - see
  // ProviderAccountSearchForm/SearchResultsTable notes; kept as-is).
  const [visibleProviderColumns, setVisibleProviderColumns] = useState({
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
    lastLoginIp: true
  });

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
    if (!addFormData.username.trim() || !addFormData.email.trim()) {
      setAddError('Username and email are required.');
      return;
    }
    try {
      setAddSaving(true);
      setAddError(null);
      await createPlayer({
        username: addFormData.username.trim(),
        email: addFormData.email.trim(),
        firstName: addFormData.firstName.trim() || undefined,
        lastName: addFormData.lastName.trim() || undefined,
        phone: addFormData.phone.trim() || undefined,
        vipLevel: addFormData.vipLevel,
      });
      notification.success(`Member "${addFormData.username}" created.`);
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

  const handleExport = useCallback(() => {
    notification.info(`Exporting ${activeTab} data (${recordsPerPage} records per page)`);
  }, [notification, activeTab, recordsPerPage]);

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
    notification.success('View settings saved successfully!');
  }, [notification]);

  // Builds the real filter this app's REST API accepts (services/backoffice-api's
  // GET /players). Fields with no backend equivalent (lastDepositSince,
  // lastBetTimeSince, noLoginSince, lastLoginIP, phoneNumber(Type),
  // dateOfBirthFrom/To, lastLoginSince, searchType, currencyType,
  // channelType, channelCode, fullName) are ignored here - they're
  // disabled in AccountSearchForm so the UI doesn't pretend they filter
  // anything.
  const buildFilter = () => {
    const filter: any = {};
    const search = searchData.username?.trim() || searchData.email?.trim();
    if (search) filter.search = search;
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
