import React, { useState, useEffect } from 'react';
import { Card, Table, Modal, Button } from '../../../common/UI';
import { Input, Select, Textarea } from '../../../common/Forms';
import useSettings from '../hooks/useSettings';
import { usePermission } from '../../../../context/PermissionContext';

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [roles, setRoles] = useState([]);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('staff');
  const [filters, setFilters] = useState({
    search: '',
    role: 'all',
    status: 'all',
    department: 'all'
  });

  const { 
    staffData, 
    rolesData, 
    loading, 
    error, 
    fetchStaff, 
    createStaff, 
    updateStaff, 
    deleteStaff,
    createRole,
    updateRole,
    deleteRole 
  } = useSettings();

  const { permissions } = usePermission();
  
  // Mock fetchPermissions function for now
  const fetchPermissions = () => {
    // This would typically fetch permissions from the server
    console.log('fetchPermissions called');
  };

  useEffect(() => {
    fetchStaff();
    fetchPermissions();
  }, [fetchStaff, fetchPermissions]);

  useEffect(() => {
    if (staffData) setStaff(staffData);
    if (rolesData) setRoles(rolesData);
  }, [staffData, rolesData]);

  const staffColumns = [
    { header: 'Avatar', accessor: 'avatar' },
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Role', accessor: 'role' },
    { header: 'Department', accessor: 'department' },
    { header: 'Status', accessor: 'status' },
    { header: 'Last Login', accessor: 'lastLogin' },
    { header: 'Actions', accessor: 'actions' }
  ];

  const roleColumns = [
    { header: 'Role Name', accessor: 'name' },
    { header: 'Description', accessor: 'description' },
    { header: 'Permissions Count', accessor: 'permissionsCount' },
    { header: 'Staff Count', accessor: 'staffCount' },
    { header: 'Created', accessor: 'createdAt' },
    { header: 'Actions', accessor: 'actions' }
  ];

  const handleCreateStaff = () => {
    setSelectedStaff({
      id: '',
      firstName: '',
      lastName: '',
      email: '',
      username: '',
      password: '',
      roleId: '',
      department: '',
      phone: '',
      isActive: true,
      permissions: []
    });
    setIsEditing(false);
    setShowStaffModal(true);
  };

  const handleEditStaff = (staffMember) => {
    setSelectedStaff({ ...staffMember });
    setIsEditing(true);
    setShowStaffModal(true);
  };

  const handleDeleteStaff = async (staffId) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await deleteStaff(staffId);
        setStaff(prev => prev.filter(s => s.id !== staffId));
        alert('Staff member deleted successfully!');
      } catch (error) {
        console.error('Error deleting staff member:', error);
        alert('Error deleting staff member. Please try again.');
      }
    }
  };

  const handleSaveStaff = async () => {
    try {
      if (isEditing) {
        await updateStaff(selectedStaff.id, selectedStaff);
        setStaff(prev => 
          prev.map(s => s.id === selectedStaff.id ? selectedStaff : s)
        );
      } else {
        const newStaff = await createStaff(selectedStaff);
        setStaff(prev => [...prev, newStaff]);
      }
      setShowStaffModal(false);
      alert('Staff member saved successfully!');
    } catch (error) {
      console.error('Error saving staff member:', error);
      alert('Error saving staff member. Please try again.');
    }
  };

  const handleCreateRole = () => {
    setSelectedRole({
      id: '',
      name: '',
      description: '',
      permissions: [],
      isDefault: false
    });
    setIsEditing(false);
    setShowRoleModal(true);
  };

  const handleEditRole = (role) => {
    setSelectedRole({ ...role });
    setIsEditing(true);
    setShowRoleModal(true);
  };

  const handleDeleteRole = async (roleId) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await deleteRole(roleId);
        setRoles(prev => prev.filter(r => r.id !== roleId));
        alert('Role deleted successfully!');
      } catch (error) {
        console.error('Error deleting role:', error);
        alert('Error deleting role. Please try again.');
      }
    }
  };

  const handleSaveRole = async () => {
    try {
      if (isEditing) {
        await updateRole(selectedRole.id, selectedRole);
        setRoles(prev => 
          prev.map(r => r.id === selectedRole.id ? selectedRole : r)
        );
      } else {
        const newRole = await createRole(selectedRole);
        setRoles(prev => [...prev, newRole]);
      }
      setShowRoleModal(false);
      alert('Role saved successfully!');
    } catch (error) {
      console.error('Error saving role:', error);
      alert('Error saving role. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      suspended: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-blue-100 text-blue-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const renderAvatar = (staff) => (
    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
      {staff.firstName?.charAt(0) || 'U'}
    </div>
  );

  const renderStaffActions = (staff) => (
    <div className="flex space-x-2">
      <button
        onClick={() => handleEditStaff(staff)}
        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
      >
        Edit
      </button>
      <button
        onClick={() => handleDeleteStaff(staff.id)}
        className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
        disabled={staff.isDefault}
      >
        Delete
      </button>
    </div>
  );

  const renderRoleActions = (role) => (
    <div className="flex space-x-2">
      <button
        onClick={() => handleEditRole(role)}
        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
      >
        Edit
      </button>
      <button
        onClick={() => handleDeleteRole(role.id)}
        className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
        disabled={role.isDefault}
      >
        Delete
      </button>
    </div>
  );

  const filteredStaff = staff.filter(s => {
    const matchesSearch = s.firstName?.toLowerCase().includes(filters.search.toLowerCase()) ||
                         s.lastName?.toLowerCase().includes(filters.search.toLowerCase()) ||
                         s.email?.toLowerCase().includes(filters.search.toLowerCase());
    const matchesRole = filters.role === 'all' || s.roleId === filters.role;
    const matchesStatus = filters.status === 'all' || s.status === filters.status;
    const matchesDepartment = filters.department === 'all' || s.department === filters.department;
    
    return matchesSearch && matchesRole && matchesStatus && matchesDepartment;
  });

  const processedStaffData = filteredStaff.map(s => ({
    ...s,
    avatar: renderAvatar(s),
    name: `${s.firstName} ${s.lastName}`,
    role: roles.find(r => r.id === s.roleId)?.name || 'Unknown',
    status: getStatusBadge(s.status),
    lastLogin: s.lastLogin ? new Date(s.lastLogin).toLocaleDateString() : 'Never',
    actions: renderStaffActions(s)
  }));

  const processedRoleData = roles.map(r => ({
    ...r,
    permissionsCount: r.permissions?.length || 0,
    staffCount: staff.filter(s => s.roleId === r.id).length,
    createdAt: new Date(r.createdAt).toLocaleDateString(),
    actions: renderRoleActions(r)
  }));

  const renderStaffModal = () => {
    if (!selectedStaff) return null;

    return (
      <Modal
        isOpen={showStaffModal}
        onClose={() => setShowStaffModal(false)}
        title={isEditing ? 'Edit Staff Member' : 'Add Staff Member'}
        size="large"
      >
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={selectedStaff.firstName}
              onChange={(e) => setSelectedStaff(prev => ({ ...prev, firstName: e.target.value }))}
              placeholder="Enter first name"
            />
            <Input
              label="Last Name"
              value={selectedStaff.lastName}
              onChange={(e) => setSelectedStaff(prev => ({ ...prev, lastName: e.target.value }))}
              placeholder="Enter last name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              value={selectedStaff.email}
              onChange={(e) => setSelectedStaff(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter email address"
            />
            <Input
              label="Username"
              value={selectedStaff.username}
              onChange={(e) => setSelectedStaff(prev => ({ ...prev, username: e.target.value }))}
              placeholder="Enter username"
            />
          </div>

          {!isEditing && (
            <Input
              label="Password"
              type="password"
              value={selectedStaff.password}
              onChange={(e) => setSelectedStaff(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Enter password"
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Role"
              value={selectedStaff.roleId}
              onChange={(e) => setSelectedStaff(prev => ({ ...prev, roleId: e.target.value }))}
              options={[
                { value: '', label: 'Select a role...' },
                ...roles.map(role => ({ value: role.id, label: role.name }))
              ]}
            />
            <Select
              label="Department"
              value={selectedStaff.department}
              onChange={(e) => setSelectedStaff(prev => ({ ...prev, department: e.target.value }))}
              options={[
                { value: '', label: 'Select department...' },
                { value: 'administration', label: 'Administration' },
                { value: 'customer_service', label: 'Customer Service' },
                { value: 'finance', label: 'Finance' },
                { value: 'marketing', label: 'Marketing' },
                { value: 'technical', label: 'Technical' },
                { value: 'compliance', label: 'Compliance' }
              ]}
            />
          </div>

          <Input
            label="Phone"
            value={selectedStaff.phone}
            onChange={(e) => setSelectedStaff(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="Enter phone number"
          />

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={selectedStaff.isActive}
              onChange={(e) => setSelectedStaff(prev => ({ ...prev, isActive: e.target.checked }))}
              className="rounded"
            />
            <label htmlFor="isActive" className="text-sm">Active</label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="secondary" onClick={() => setShowStaffModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveStaff}>
              {isEditing ? 'Update Staff' : 'Create Staff'}
            </Button>
          </div>
        </div>
      </Modal>
    );
  };

  const renderRoleModal = () => {
    if (!selectedRole) return null;

    return (
      <Modal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        title={isEditing ? 'Edit Role' : 'Create Role'}
        size="large"
      >
        <div className="space-y-6">
          <Input
            label="Role Name"
            value={selectedRole.name}
            onChange={(e) => setSelectedRole(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter role name"
          />

          <Textarea
            label="Description"
            value={selectedRole.description}
            onChange={(e) => setSelectedRole(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Enter role description"
            rows={3}
          />

          {/* Permissions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Permissions</label>
            <div className="grid grid-cols-2 gap-4 max-h-60 overflow-y-auto border rounded p-4">
              {permissions?.map((permission) => (
                <div key={permission.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`permission-${permission.id}`}
                    checked={selectedRole.permissions?.includes(permission.id)}
                    onChange={(e) => {
                      const updatedPermissions = e.target.checked
                        ? [...(selectedRole.permissions || []), permission.id]
                        : (selectedRole.permissions || []).filter(p => p !== permission.id);
                      setSelectedRole(prev => ({ ...prev, permissions: updatedPermissions }));
                    }}
                    className="rounded"
                  />
                  <label htmlFor={`permission-${permission.id}`} className="text-sm">
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
              checked={selectedRole.isDefault}
              onChange={(e) => setSelectedRole(prev => ({ ...prev, isDefault: e.target.checked }))}
              className="rounded"
            />
            <label htmlFor="isDefault" className="text-sm">Default Role</label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="secondary" onClick={() => setShowRoleModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveRole}>
              {isEditing ? 'Update Role' : 'Create Role'}
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
        <h2 className="text-xl font-semibold">Staff Management</h2>
        <div className="flex space-x-2">
          <Button 
            variant="secondary" 
            onClick={handleCreateRole}
            disabled={activeTab !== 'roles'}
          >
            Add Role
          </Button>
          <Button 
            variant="primary" 
            onClick={handleCreateStaff}
            disabled={activeTab !== 'staff'}
          >
            Add Staff
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Card>
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'staff', label: 'Staff Members', count: staff.length },
              { id: 'roles', label: 'Roles', count: roles.length }
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
      {activeTab === 'staff' && (
        <Card>
          <div className="p-4">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Input
                label="Search"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Search staff..."
              />
              <Select
                label="Role"
                value={filters.role}
                onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                options={[
                  { value: 'all', label: 'All Roles' },
                  ...roles.map(role => ({ value: role.id, label: role.name }))
                ]}
              />
              <Select
                label="Status"
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                  { value: 'suspended', label: 'Suspended' },
                  { value: 'pending', label: 'Pending' }
                ]}
              />
              <Select
                label="Department"
                value={filters.department}
                onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                options={[
                  { value: 'all', label: 'All Departments' },
                  { value: 'administration', label: 'Administration' },
                  { value: 'customer_service', label: 'Customer Service' },
                  { value: 'finance', label: 'Finance' },
                  { value: 'marketing', label: 'Marketing' },
                  { value: 'technical', label: 'Technical' },
                  { value: 'compliance', label: 'Compliance' }
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
                columns={staffColumns}
                data={processedStaffData}
              />
            )}
          </div>
        </Card>
      )}

      {activeTab === 'roles' && (
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
                columns={roleColumns}
                data={processedRoleData}
              />
            )}
          </div>
        </Card>
      )}

      {/* Modals */}
      {renderStaffModal()}
      {renderRoleModal()}
    </div>
  );
};

export default StaffManagement; 