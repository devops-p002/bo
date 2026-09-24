import { useState, useEffect, useMemo } from 'react';
import { gql, useQuery } from '@apollo/client';

// Real, wireable search fields only (see server/src/graphql/schema/index.js
// UserFilterInput: role, status, vipLevel, country, search, dateRange).
// `search` ILIKE-matches username/email/firstName/lastName server-side (see
// server/src/graphql/dataSources/UserAPI.js), so the Username and Email
// inputs both feed the same backend `search` term - if both are filled,
// username wins (documented in the form).
const SEARCH_MEMBERS = gql`
  query SearchMembers($filter: UserFilterInput, $pagination: PaginationInput) {
    users(filter: $filter, pagination: $pagination) {
      totalCount
      nodes {
        id
        username
        fullName
        email
        phone
        dateOfBirth
        vipLevel
        status
        balance
        currency
        lastLoginAt
        lastLoginIP
        createdAt
      }
    }
  }
`;

export const useMemberSearch = () => {
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
  const [appliedFilter, setAppliedFilter] = useState({});

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

  // Memoized so the variables object keeps a stable reference across
  // re-renders - an inline object literal here would give useQuery a new
  // `variables` reference every render, which it treats as "variables
  // changed" and refetches forever (see gotcha #1).
  const queryVariables = useMemo(() => ({
    filter: appliedFilter,
    pagination: { page: currentPage, limit: recordsPerPage },
  }), [appliedFilter, currentPage, recordsPerPage]);

  const { data, loading, error } = useQuery(SEARCH_MEMBERS, {
    variables: queryVariables,
    skip: activeTab !== 'Account',
    fetchPolicy: 'cache-and-network',
  });

  const results = data?.users?.nodes ?? [];
  const totalCount = data?.users?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / recordsPerPage));

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

  const handleExport = () => {
    alert(`Exporting ${activeTab} data (${recordsPerPage} records per page)`);
  };

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

  const handleSave = () => {
    alert('View settings saved successfully!');
  };

  // Builds the real UserFilterInput from the form. Fields with no schema
  // equivalent (lastDepositSince, lastBetTimeSince, noLoginSince,
  // lastLoginIP, phoneNumber(Type), dateOfBirthFrom/To, lastLoginSince,
  // searchType, currencyType, channelType, channelCode, fullName) are
  // ignored here - they're disabled in AccountSearchForm so the UI doesn't
  // pretend they filter anything.
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
    // DateRangeInput requires both start and end (non-null in the schema),
    // so only send it once both bounds are set.
    if (searchData.registeredDateFrom && searchData.registeredDateTo) {
      filter.dateRange = {
        start: new Date(searchData.registeredDateFrom).toISOString(),
        end: new Date(searchData.registeredDateTo).toISOString(),
      };
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
  // backend looks members up by id, not username - the previous version
  // passed `username` here, which would 404 against real data).
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
    resultsLoading: loading,
    resultsError: error,
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
    handleUsernameClick
  };
};
