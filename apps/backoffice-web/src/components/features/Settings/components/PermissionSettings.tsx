import React, { useState, useEffect } from 'react';
import { Card, Table, Modal, Button } from '../../../common/UI';
import { Input, Select, Textarea } from '../../../common/Forms';
import { usePermission } from '../../../../context/PermissionContext';

const PermissionSettings = () => {
  const [permissions, setPermissions] = useState([]);
  const [groups, setGroups] = useState([]);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('permissions');
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    status: 'all'
  });

  const { permissions: userPermissions } = usePermission();
  
  // Mock data and functions for now
  const permissionsData = userPermissions;
  const groupsData = [];
  const loading = false;
  const error = null;
  const fetchPermissions = () => console.log('fetchPermissions called');
  const createPermission: (...args: any[]) => Promise<any> = () => Promise.resolve();
  const updatePermission: (...args: any[]) => Promise<any> = () => Promise.resolve();
  const deletePermission: (...args: any[]) => Promise<any> = () => Promise.resolve();
  const createGroup: (...args: any[]) => Promise<any> = () => Promise.resolve();
  const updateGroup: (...args: any[]) => Promise<any> = () => Promise.resolve();
  const deleteGroup: (...args: any[]) => Promise<any> = () => Promise.resolve();

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  useEffect(() => {
    if (permissionsData) setPermissions(permissionsData);
    if (groupsData) setGroups(groupsData);
  }, [permissionsData, groupsData]);

  const permissionColumns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Code', accessor: 'code' },
    { header: 'Category', accessor: 'category' },
    { header: 'Description', accessor: 'description' },
    { header: 'Status', accessor: 'status' },
    { header: 'Actions', accessor: 'actions' }
  ];

  const groupColumns = [
    { header: 'Group Name', accessor: 'name' },
    { header: 'Description', accessor: 'description' },
    { header: 'Permissions', accessor: 'permissionCount' },
    { header: 'Users', accessor: 'userCount' },
    { header: 'Created', accessor: 'createdAt' },
    { header: 'Actions', accessor: 'actions' }
  ];

  const handleCreatePermission = () => {
    setSelectedPermission({
      id: '',
      name: '',
      code: '',
      category: '',
      description: '',
      isActive: true
    });
    setIsEditing(false);
    setShowPermissionModal(true);
  };

  const handleEditPermission = (permission) => {
    setSelectedPermission({ ...permission });
    setIsEditing(true);
    setShowPermissionModal(true);
  };

  const handleDeletePermission = async (permissionId) => {
    if (window.confirm('Are you sure you want to delete this permission?')) {
      try {
        await deletePermission(permissionId);
        setPermissions(prev => prev.filter(p => p.id !== permissionId));
        alert('Permission deleted successfully!');
      } catch (error) {
        console.error('Error deleting permission:', error);
        alert('Error deleting permission. Please try again.');
      }
    }
  };

  const handleSavePermission = async () => {
    try {
      if (isEditing) {
        await updatePermission(selectedPermission.id, selectedPermission);
        setPermissions(prev => 
          prev.map(p => p.id === selectedPermission.id ? selectedPermission : p)
        );
      } else {
        const newPermission = await createPermission(selectedPermission);
        setPermissions(prev => [...prev, newPermission]);
      }
      setShowPermissionModal(false);
      alert('Permission saved successfully!');
    } catch (error) {
      console.error('Error saving permission:', error);
      alert('Error saving permission. Please try again.');
    }
  };

  const handleCreateGroup = () => {
    setSelectedGroup({
      id: '',
      name: '',
      description: '',
      permissions: [],
      isDefault: false
    });
    setIsEditing(false);
    setShowGroupModal(true);
  };

  const handleEditGroup = (group) => {
    setSelectedGroup({ ...group });
    setIsEditing(true);
    setShowGroupModal(true);
  };

  const handleDeleteGroup = async (groupId) => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      try {
        await deleteGroup(groupId);
        setGroups(prev => prev.filter(g => g.id !== groupId));
        alert('Group deleted successfully!');
      } catch (error) {
        console.error('Error deleting group:', error);
        alert('Error deleting group. Please try again.');
      }
    }
  };

  const handleSaveGroup = async () => {
    try {
      if (isEditing) {
        await updateGroup(selectedGroup.id, selectedGroup);
        setGroups(prev => 
          prev.map(g => g.id === selectedGroup.id ? selectedGroup : g)
        );
      } else {
        const newGroup = await createGroup(selectedGroup);
        setGroups(prev => [...prev, newGroup]);
      }
      setShowGroupModal(false);
      alert('Group saved successfully!');
    } catch (error) {
      console.error('Error saving group:', error);
      alert('Error saving group. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status ? 'Active' : 'Inactive'}
      </span>
    );
  };

  const getCategoryBadge = (category) => {
    const categoryColors = {
      dashboard: 'bg-blue-100 text-blue-800',
      members: 'bg-green-100 text-green-800',
      payments: 'bg-yellow-100 text-yellow-800',
      reports: 'bg-purple-100 text-purple-800',
      marketing: 'bg-pink-100 text-pink-800',
      crm: 'bg-indigo-100 text-indigo-800',
      risk: 'bg-red-100 text-red-800',
      bets: 'bg-orange-100 text-orange-800',
      referral: 'bg-teal-100 text-teal-800',
      settings: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[category] || 'bg-gray-100 text-gray-800'}`}>
        {category?.toUpperCase() || 'GENERAL'}
      </span>
    );
  };

  const renderPermissionActions = (permission) => (
    <div className="flex space-x-2">
      <button
        onClick={() => handleEditPermission(permission)}
        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
      >
        Edit
      </button>
      <button
        onClick={() => handleDeletePermission(permission.id)}
        className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
        disabled={permission.isSystem}
      >
        Delete
      </button>
    </div>
  );

  const renderGroupActions = (group) => (
    <div className="flex space-x-2">
      <button
        onClick={() => handleEditGroup(group)}
        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
      >
        Edit
      </button>
      <button
        onClick={() => handleDeleteGroup(group.id)}
        className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
        disabled={group.isDefault}
      >
        Delete
      </button>
    </div>
  );

  const filteredPermissions = permissions.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
                         p.code?.toLowerCase().includes(filters.search.toLowerCase());
    const matchesCategory = filters.category === 'all' || p.category === filters.category;
    const matchesStatus = filters.status === 'all' || 
                         (filters.status === 'active' && p.isActive) ||
                         (filters.status === 'inactive' && !p.isActive);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const processedPermissionData = filteredPermissions.map(p => ({
    ...p,
    category: getCategoryBadge(p.category),
    status: getStatusBadge(p.isActive),
    actions: renderPermissionActions(p)
  }));

  const processedGroupData = groups.map(g => ({
    ...g,
    permissionCount: g.permissions?.length || 0,
    userCount: g.users?.length || 0,
    createdAt: new Date(g.createdAt || Date.now()).toLocaleDateString(),
    actions: renderGroupActions(g)
  }));

  const renderPermissionModal = () => {
    if (!selectedPermission) return null;

    return (
      <Modal
        isOpen={showPermissionModal}
        onClose={() => setShowPermissionModal(false)}
        title={isEditing ? 'Edit Permission' : 'Create Permission'}
        size="large"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Permission Name"
              value={selectedPermission.name}
              onChange={(e) => setSelectedPermission(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter permission name"
            />
            <Input
              label="Permission Code"
              value={selectedPermission.code}
              onChange={(e) => setSelectedPermission(prev => ({ ...prev, code: e.target.value }))}
              placeholder="e.g., dashboard.view"
            />
          </div>

          <Select
            label="Category"
            value={selectedPermission.category}
            onChange={(e) => setSelectedPermission(prev => ({ ...prev, category: e.target.value }))}
            options={[
              { value: '', label: 'Select category...' },
              { value: 'dashboard', label: 'Dashboard' },
              { value: 'members', label: 'Members' },
              { value: 'payments', label: 'Payments' },
              { value: 'reports', label: 'Reports' },
              { value: 'marketing', label: 'Marketing' },
              { value: 'crm', label: 'CRM' },
              { value: 'risk', label: 'Risk Management' },
              { value: 'bets', label: 'Bets' },
              { value: 'referral', label: 'Referral' },
              { value: 'settings', label: 'Settings' }
            ]}
          />

          <Textarea
            label="Description"
            value={selectedPermission.description}
            onChange={(e) => setSelectedPermission(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Enter permission description"
            rows={3}
          />

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={selectedPermission.isActive}
              onChange={(e) => setSelectedPermission(prev => ({ ...prev, isActive: e.target.checked }))}
              className="rounded"
            />
            <label htmlFor="isActive" className="text-sm">Active</label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="secondary" onClick={() => setShowPermissionModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSavePermission}>
              {isEditing ? 'Update Permission' : 'Create Permission'}
            </Button>
          </div>
        </div>
      </Modal>
    );
  };

  const renderGroupModal = () => {
    if (!selectedGroup) return null;

    return (
      <Modal
        isOpen={showGroupModal}
        onClose={() => setShowGroupModal(false)}
        title={isEditing ? 'Edit Permission Group' : 'Create Permission Group'}
        size="large"
      >
        <div className="space-y-6">
          <Input
            label="Group Name"
            value={selectedGroup.name}
            onChange={(e) => setSelectedGroup(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter group name"
          />

          <Textarea
            label="Description"
            value={selectedGroup.description}
            onChange={(e) => setSelectedGroup(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Enter group description"
            rows={3}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Permissions</label>
            <div className="grid grid-cols-2 gap-4 max-h-60 overflow-y-auto border rounded p-4">
              {permissions.map((permission) => (
                <div key={permission.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`group-permission-${permission.id}`}
                    checked={selectedGroup.permissions?.includes(permission.id)}
                    onChange={(e) => {
                      const updatedPermissions = e.target.checked
                        ? [...(selectedGroup.permissions || []), permission.id]
                        : (selectedGroup.permissions || []).filter(p => p !== permission.id);
                      setSelectedGroup(prev => ({ ...prev, permissions: updatedPermissions }));
                    }}
                    className="rounded"
                  />
                  <label htmlFor={`group-permission-${permission.id}`} className="text-sm">
                    {permission.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={selectedGroup.isDefault}
              onChange={(e) => setSelectedGroup(prev => ({ ...prev, isDefault: e.target.checked }))}
              className="rounded"
            />
            <label htmlFor="isDefault" className="text-sm">Default Group</label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="secondary" onClick={() => setShowGroupModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveGroup}>
              {isEditing ? 'Update Group' : 'Create Group'}
            </Button>
          </div>
        </div>
      </Modal>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Permission Settings</h2>
        <div className="flex space-x-2">
          <Button 
            variant="secondary" 
            onClick={handleCreateGroup}
            disabled={activeTab !== 'groups'}
          >
            Add Group
          </Button>
          <Button 
            variant="primary" 
            onClick={handleCreatePermission}
            disabled={activeTab !== 'permissions'}
          >
            Add Permission
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Card>
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'permissions', label: 'Permissions', count: permissions.length },
              { id: 'groups', label: 'Permission Groups', count: groups.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.label}</span>
                <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </Card>

      {/* Content */}
      {activeTab === 'permissions' && (
        <Card>
          <div className="p-4">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Input
                label="Search"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Search permissions..."
              />
              <Select
                label="Category"
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                options={[
                  { value: 'all', label: 'All Categories' },
                  { value: 'dashboard', label: 'Dashboard' },
                  { value: 'members', label: 'Members' },
                  { value: 'payments', label: 'Payments' },
                  { value: 'reports', label: 'Reports' },
                  { value: 'marketing', label: 'Marketing' },
                  { value: 'crm', label: 'CRM' },
                  { value: 'risk', label: 'Risk Management' },
                  { value: 'bets', label: 'Bets' },
                  { value: 'referral', label: 'Referral' },
                  { value: 'settings', label: 'Settings' }
                ]}
              />
              <Select
                label="Status"
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' }
                ]}
              />
            </div>

            {loading ? (
              <div className="animate-pulse">
                <div className="h-10 bg-gray-200 rounded mb-4"></div>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded mb-2"></div>
                ))}
              </div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : (
              <Table
                columns={permissionColumns}
                data={processedPermissionData}
              />
            )}
          </div>
        </Card>
      )}

      {activeTab === 'groups' && (
        <Card>
          <div className="p-4">
            {loading ? (
              <div className="animate-pulse">
                <div className="h-10 bg-gray-200 rounded mb-4"></div>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded mb-2"></div>
                ))}
              </div>
            ) : error ? (
              <div className="text-red-500">{error}</div>
            ) : (
              <Table
                columns={groupColumns}
                data={processedGroupData}
              />
            )}
          </div>
        </Card>
      )}

      {/* Modals */}
      {renderPermissionModal()}
      {renderGroupModal()}
    </div>
  );
};

export default PermissionSettings; 